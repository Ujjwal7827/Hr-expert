import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High-capacity JSON payload support for documents & resumes (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// High-speed in-memory LRU cache for instant repeat evaluations
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getCached(key: string): any | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any): void {
  if (apiCache.size > 200) {
    const oldestKey = apiCache.keys().next().value;
    if (oldestKey) apiCache.delete(oldestKey);
  }
  apiCache.set(key, { data, timestamp: Date.now() });
}

// Optimized, high-velocity Gemini caller using gemini-3.1-flash-lite / gemini-3.5-flash-lite
async function callGemini({
  model = 'gemini-3.1-flash-lite',
  prompt,
  systemInstruction,
  responseSchema,
  responseMimeType,
}: {
  model?: string;
  prompt: string;
  systemInstruction?: string;
  enableThinking?: boolean;
  responseSchema?: any;
  responseMimeType?: string;
}) {
  const modelsToTry = [
    model,
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash'
  ];
  // Deduplicate
  const uniqueModels = Array.from(new Set(modelsToTry));

  const config: any = {
    temperature: 0.2, // Low temperature for high-velocity, deterministic output
  };

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  if (responseMimeType) {
    config.responseMimeType = responseMimeType;
  }
  if (responseSchema) {
    config.responseSchema = responseSchema;
  }

  let lastError: any = null;

  for (const targetModel of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model call to ${targetModel} encountered an issue (${err?.message}). Attempting fallback...`);
    }
  }

  throw lastError || new Error('All Gemini model fallbacks exhausted.');
}

// 0. Server Health Check
app.get('/api/health', (_req, res) => {
  return res.json({
    status: 'ok',
    server: 'TalentAudit Node/Express Service',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Helper: Extract text from resume files (PDF, DOCX, TXT, images)
async function extractResumeTextHandler(req: express.Request, res: express.Response) {
  try {
    const { fileBase64, mimeType = 'application/pdf', fileName = '' } = req.body;

    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({ error: 'fileBase64 string is required' });
    }

    // Clean data URL prefix if present (e.g. data:application/pdf;base64,...)
    const cleanBase64 = fileBase64.includes('base64,')
      ? fileBase64.split('base64,')[1].trim()
      : fileBase64.trim();

    const buffer = Buffer.from(cleanBase64, 'base64');
    const lowerName = fileName.toLowerCase();
    const isDocx =
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc') ||
      mimeType.includes('wordprocessingml') ||
      mimeType.includes('msword');

    // 1. If it's a Word DOCX document, extract via mammoth in 5ms
    if (isDocx) {
      try {
        const mammothResult = await mammoth.extractRawText({ buffer });
        if (mammothResult && mammothResult.value && mammothResult.value.trim().length > 20) {
          return res.json({
            text: mammothResult.value.trim(),
            extractedWith: 'mammoth-docx-parser',
            warnings: mammothResult.messages
          });
        }
      } catch (docxErr: any) {
        console.warn('Mammoth docx parse failed, trying alternative:', docxErr?.message);
      }
    }

    // 2. If it's plain text or markdown sent as base64
    if (
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md') ||
      lowerName.endsWith('.json') ||
      mimeType.startsWith('text/')
    ) {
      const decodedText = buffer.toString('utf-8');
      if (decodedText && decodedText.trim().length > 20) {
        return res.json({
          text: decodedText.trim(),
          extractedWith: 'utf8-text-decoder'
        });
      }
    }

    // 3. For PDF documents or images, use Gemini Multimodal extraction
    const targetMime = mimeType && mimeType.includes('/') ? mimeType : 'application/pdf';
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: targetMime,
                data: cleanBase64,
              },
            },
            {
              text: `Extract the full verbatim text of this resume cleanly in plain text format.
Preserve all sections: Header & Contact Info, Professional Summary, Experience, Skills, Projects, Education, Certifications, and Languages.
Do not invent or add extra info. Output only the clean plain text of the resume.`,
            },
          ],
        },
      });

      if (response && response.text && response.text.trim().length > 20) {
        return res.json({
          text: response.text.trim(),
          extractedWith: 'gemini-multimodal'
        });
      }
    } catch (geminiPdfErr: any) {
      console.warn('Gemini multimodal extraction error:', geminiPdfErr?.message);
    }

    // 4. Fallback: Extract plain text strings from buffer if PDF text streams exist
    const rawBufferStr = buffer.toString('latin1');
    const textMatches = rawBufferStr.match(/\(([^()]{3,})\)T[jJ]/g) || [];
    if (textMatches.length > 5) {
      const extractedPieces = textMatches
        .map((m) => m.replace(/^\(/, '').replace(/\)T[jJ]$/, ''))
        .filter((s) => s.trim().length > 1);
      const fallbackText = extractedPieces.join(' ');
      if (fallbackText.length > 50) {
        return res.json({
          text: fallbackText,
          extractedWith: 'pdf-stream-fallback'
        });
      }
    }

    return res.status(422).json({
      error: 'Could not extract readable text from document. Please use the "Paste Resume Text" tab to paste your resume directly.'
    });
  } catch (err: any) {
    console.error('Error in /api/extract-resume:', err);
    return res.status(500).json({
      error: err.message || 'Failed to extract text from document',
      hint: 'You can paste your resume text directly in the Paste Resume tab.'
    });
  }
}

// Register file extraction routes and aliases
app.post('/api/extract-resume', extractResumeTextHandler);
app.post('/api/extract', extractResumeTextHandler);
app.post('/api/parse-resume', extractResumeTextHandler);
app.post('/api/extract-text', extractResumeTextHandler);

// Helper: Resume evaluation handler
async function rateResumeHandler(req: express.Request, res: express.Response) {
  try {
    const { resumeText } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 10) {
      return res.status(400).json({ error: 'Valid resume text is required' });
    }

    const cacheKey = `rate-resume:${resumeText.trim()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const systemInstruction = `You are a Fortune 500 VP of People, Head of Talent Acquisition & Executive HR Expert with 20+ years of senior hiring experience across all professional fields and industries.
Your mission is to evaluate any resume purely as an HR Expert scoring the universal craftsmanship, structure, impact, communication, credibility, and ATS-readiness of the document.
Keep your analysis concise, crisp, highly specific, and fast to read.

CRITICAL INSTRUCTIONS:
- DO NOT evaluate against or score for any specific job role, job title, or specific industry field.
- DO NOT match against or require any specific evaluating field or role filter. Remove any role-matching penalties!
- Evaluate the resume strictly on UNIVERSAL HR QUALITY & CRAFTSMANSHIP:
  1. Impact & Quantified Metrics (Accomplished [X] by doing [Z] measured by [Y])
  2. Action Verbs & Communication Clarity (punchy active verbs, no fluff)
  3. ATS Parseability & Layout (clean structure, standard headers)
  4. Credibility, Timeline Continuity & Credentials
  5. Structure, Hierarchy & 6-Second First Impression

Provide an honest, objective score out of 100 based entirely on executive HR hiring standards.`;

    const prompt = `Perform an objective, fast Executive HR evaluation on this resume:

Resume content:
"""
${resumeText}
"""

Evaluate this thoroughly and concisely according to universal executive HR hiring standards. Rate purely on resume quality, structure, impact, clarity, credibility, and ATS readiness—NOT for any specific job role or evaluating field.`;

    const rawResponse = await callGemini({
      model: 'gemini-3.1-flash-lite',
      prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER, description: 'Score out of 100 based on universal HR quality' },
          grade: { type: Type.STRING, description: 'Letter grade like A+, A, B+, B, C+' },
          verdict: { type: Type.STRING, description: 'Executive HR verdict in 1-2 sentences' },
          candidateLevel: { type: Type.STRING, description: 'Career seniority tier based on experience, e.g. Early Career / Associate, Mid-Level Professional, Senior Professional, Executive / Lead' },
          sixSecondImpression: { type: Type.STRING, description: 'What an executive HR screener notices in the first 6 seconds' },
          categoryScores: {
            type: Type.OBJECT,
            properties: {
              impactAndMetrics: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  feedback: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ['score', 'feedback', 'recommendation']
              },
              actionVerbsAndClarity: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  feedback: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ['score', 'feedback', 'recommendation']
              },
              technicalDepth: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  feedback: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ['score', 'feedback', 'recommendation']
              },
              atsCompatibility: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  feedback: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ['score', 'feedback', 'recommendation']
              },
              credibilityAndCerts: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  feedback: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ['score', 'feedback', 'recommendation']
              },
              structureAndReadability: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  feedback: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ['score', 'feedback', 'recommendation']
              }
            },
            required: ['impactAndMetrics', 'actionVerbsAndClarity', 'atsCompatibility', 'credibilityAndCerts', 'structureAndReadability']
          },
          topStrengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Top 3-4 strengths'
          },
          criticalRedFlags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Critical red flags or risks that cause instant rejection'
          },
          sectionCritiques: {
            type: Type.OBJECT,
            properties: {
              contactInfo: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  fix: { type: Type.STRING }
                },
                required: ['status', 'critique', 'fix']
              },
              summary: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  rewrittenVersion: { type: Type.STRING }
                },
                required: ['status', 'critique', 'rewrittenVersion']
              },
              experience: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  enhancedBullets: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        originalSnippet: { type: Type.STRING },
                        improvedXYZ: { type: Type.STRING },
                        rationale: { type: Type.STRING }
                      },
                      required: ['originalSnippet', 'improvedXYZ', 'rationale']
                    }
                  }
                },
                required: ['status', 'critique', 'enhancedBullets']
              },
              skills: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  missingKeySkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestedGrouping: { type: Type.STRING }
                },
                required: ['status', 'critique', 'missingKeySkills', 'suggestedGrouping']
              },
              projects: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['status', 'critique', 'recommendations']
              },
              certifications: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  urgentFix: { type: Type.STRING }
                },
                required: ['status', 'critique', 'urgentFix']
              }
            },
            required: ['contactInfo', 'summary', 'experience', 'skills', 'projects', 'certifications']
          },
          hiringRecommendation: {
            type: Type.STRING,
            description: 'Recruiter decision: "Strong Reject", "Lean Reject", "Borderline / Needs Portfolio Vetting", "Interview with reservations", or "Strong Hire"'
          },
          actionPlanTo90Plus: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '5 high-impact concrete actions to elevate the resume'
          }
        },
        required: [
          'overallScore',
          'grade',
          'verdict',
          'candidateLevel',
          'sixSecondImpression',
          'categoryScores',
          'topStrengths',
          'criticalRedFlags',
          'sectionCritiques',
          'hiringRecommendation',
          'actionPlanTo90Plus'
        ]
      }
    });

    const parsed = JSON.parse(rawResponse || '{}');
    if (parsed.categoryScores) {
      if (!parsed.categoryScores.actionVerbsAndClarity && parsed.categoryScores.technicalDepth) {
        parsed.categoryScores.actionVerbsAndClarity = parsed.categoryScores.technicalDepth;
      }
      if (!parsed.categoryScores.technicalDepth && parsed.categoryScores.actionVerbsAndClarity) {
        parsed.categoryScores.technicalDepth = parsed.categoryScores.actionVerbsAndClarity;
      }
    }
    setCache(cacheKey, parsed);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/rate-resume:', err);
    return res.status(500).json({ error: err.message || 'Failed to rate resume' });
  }
}

// Register evaluation routes and aliases
app.post('/api/rate-resume', rateResumeHandler);
app.post('/api/evaluate-resume', rateResumeHandler);
app.post('/api/audit-resume', rateResumeHandler);
app.post('/api/audit', rateResumeHandler);

// 1.5 Senior HR Expert Full-Resume Makeover & Shortlist Optimizer (IT & Non-IT)
app.post('/api/hr-enhance', async (req, res) => {
  try {
    const { resumeText, targetDomain = '', targetRole = '' } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Valid resume text is required for HR enhancement' });
    }

    const cacheKey = `hr-enhance:${targetDomain}:${targetRole}:${resumeText.trim().slice(0, 200)}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const systemInstruction = `You are a Fortune 500 VP of Talent Acquisition and Senior HR Executive Recruiter with 20+ years of high-volume hiring and shortlisting experience across ALL IT and Non-IT industries (including Software Engineering, Sales & BD, Healthcare & Clinical Nursing, Finance & Accounting, Marketing, Operations & Supply Chain, Human Resources, Customer Success, Education, Legal, etc.).

Your mission is to take the provided resume (regardless of candidate background or domain) and transform it into a top-1% shortlist-ready resume that gets immediate interview calls within a recruiter's 6-second scan.

CRITICAL SHORTLIST PRINCIPLES:
1. TRUTHFUL EXTRACTION: Extract the candidate's actual name, employment history, companies, dates, degrees, and core background accurately from their text. Do NOT replace them with an unrelated candidate.
2. INDUSTRY & DOMAIN SPECIFICITY:
   - Identify or use the target domain: "${targetDomain || 'auto-detect'}".
   - Identify or use the target role: "${targetRole || 'auto-detect'}".
   - Use industry-appropriate terminology, certifications, and metrics.
   - DO NOT force software/developer concepts (like GitHub, React, coding stacks) onto non-IT resumes (such as Sales, Nursing, Teaching, Accounting, or HR)!
3. REWRITE WITH THE GOOGLE XYZ FORMULA:
   - Transform weak, passive job descriptions into quantified accomplishments: "Accomplished [X] as measured by [Y] by doing [Z]".
   - Tailor metrics to their domain:
     * Sales: Quota attainment % (>100%), ARR/revenue closed, deal cycle reduction, outbound pipeline.
     * Healthcare/Nursing: Patient ratios, clinical compliance %, medication safety (0 errors), HCAHPS satisfaction.
     * Finance/Accounting: Budget scale ($), EBITDA, OPEX savings, forecast variance %, close cycle days.
     * Marketing: CAC reduction %, ROAS (e.g. 4.2x), MQL volume, conversion rate lift, organic traffic.
     * Operations/Logistics: On-Time Delivery (OTIF %), inventory turns, freight savings, lead time reduction.
     * HR/Talent: Time-to-fill reduction, retention %, offer acceptance rate (90%+), eNPS score.
     * IT/Software: Latency reduction (ms), 99.9% uptime, user scale (MAUs), defect reduction %, architecture.
4. EXECUTIVE SUMMARY:
   - Craft a punchy, 3-4 sentence recruiter-grade summary with years of experience, core domain superpowers, and proven track record.
5. SKILLS GROUPING:
   - Group skills into 3-4 relevant domain categories (e.g., Core Competencies, Domain Tools & Software, Methodologies & Certifications).
6. HR SHORTLIST VERDICT:
   - Provide an honest executive recruiter assessment explaining exactly why this enhanced resume passes the 6-second scan and guarantees an interview callback.`;

    const prompt = `Transform and elevate this candidate's resume for top-tier employer shortlists:

--- CANDIDATE RESUME ---
"""
${resumeText}
"""

Target Domain: ${targetDomain || 'Auto-detect from resume'}
Target Role: ${targetRole || 'Auto-detect from resume'}

Extract all genuine candidate details and deliver a comprehensive HR-grade makeover adhering to the schema.`;

    const rawResponse = await callGemini({
      model: 'gemini-3.1-flash-lite',
      prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          candidateName: { type: Type.STRING },
          contactLine1: { type: Type.STRING, description: 'City, State/Country | Phone | Email' },
          contactLine2: { type: Type.STRING, description: 'LinkedIn URL | Portfolio or Professional Credentials' },
          detectedDomain: { type: Type.STRING, description: 'Domain name e.g. Sales & BD, Healthcare & Nursing, IT & Software, Finance & Accounting' },
          targetRole: { type: Type.STRING, description: 'Elevated target job title' },
          executiveSummary: { type: Type.STRING, description: '3-4 sentences of recruiter-grade summary packed with quantifiable impact' },
          enhancedExperience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                roleTitle: { type: Type.STRING },
                company: { type: Type.STRING },
                dates: { type: Type.STRING },
                location: { type: Type.STRING },
                bullets: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3-4 high-impact bullets rewritten using XYZ formula with domain-relevant metrics'
                },
                originalBullets: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Original bullet snippets from the source resume'
                },
                hrImprovementsExplanation: { type: Type.STRING, description: 'Why this rewritten version gets shortlisted by recruiters' }
              },
              required: ['roleTitle', 'company', 'dates', 'location', 'bullets', 'hrImprovementsExplanation']
            }
          },
          categorizedSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: 'e.g. Core Competencies, Domain Tools & Software, Methodologies & Compliance' },
                items: { type: Type.STRING, description: 'Comma-separated list of high-value industry skills' }
              },
              required: ['category', 'items']
            }
          },
          initiativesOrProjects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                contextOrStack: { type: Type.STRING, description: 'Tools, methodologies, or clinical/business context' },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                linkOrOutcome: { type: Type.STRING, description: 'Key measurable result or URL' }
              },
              required: ['title', 'contextOrStack', 'bullets']
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                degree: { type: Type.STRING },
                institution: { type: Type.STRING },
                year: { type: Type.STRING }
              },
              required: ['degree', 'institution', 'year']
            }
          },
          certifications: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          languages: { type: Type.STRING },
          hrShortlistVerdict: {
            type: Type.OBJECT,
            properties: {
              shortlistScore: { type: Type.INTEGER, description: 'Projected HR ATS score out of 100 (typically 92-98)' },
              shortlistLikelihood: { type: Type.STRING, description: 'e.g. Top 3% Recruiter Shortlist (High Callback Rate)' },
              sixSecondImpression: { type: Type.STRING, description: 'What immediately grabs the recruiter in the first 6 seconds' },
              top3ShortlistReasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Top 3 reasons why an HR manager will shortlist this candidate'
              },
              keyAdviceForInterviews: { type: Type.STRING, description: 'Executive advice for walking into the first interview' }
            },
            required: ['shortlistScore', 'shortlistLikelihood', 'sixSecondImpression', 'top3ShortlistReasons', 'keyAdviceForInterviews']
          },
          fullFormattedResumeText: {
            type: Type.STRING,
            description: 'Complete ATS-ready plain text resume formatted with standard section headers ready to copy-paste'
          }
        },
        required: [
          'candidateName',
          'contactLine1',
          'detectedDomain',
          'targetRole',
          'executiveSummary',
          'enhancedExperience',
          'categorizedSkills',
          'education',
          'hrShortlistVerdict',
          'fullFormattedResumeText'
        ]
      }
    });

    const parsed = JSON.parse(rawResponse || '{}');
    setCache(cacheKey, parsed);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/hr-enhance:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate HR enhancement' });
  }
});

// Alias routes for HR makeover
app.post('/api/hr-transform', async (req, res) => {
  return res.redirect(307, '/api/hr-enhance');
});

// 2. Multi-turn HR Expert Chat (IT & Non-IT)
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      resumeContext,
      persona = 'recruiter',
      domain = 'general',
      model = 'gemini-3.1-flash-lite'
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const personaInstructions: Record<string, string> = {
      recruiter: `You are an elite Senior Talent Acquisition Partner & Executive Recruiter with 15+ years experience screening candidates across IT, Sales, Healthcare, Finance, Marketing, Operations, and Management.
You are direct, sharp, highly observant, and constructive. You evaluate resumes through the lens of hiring managers and ATS algorithms.
Give actionable advice, rewrite sentences directly using XYZ formula, highlight red flags, and coach candidates on what gets shortlisted.`,
      director: `You are a VP of People & Head of Talent Acquisition at a Fortune 500 enterprise.
You look at candidate trajectory, leadership maturity, cross-functional collaboration, credentials, and executive communication.
You give high-level strategic positioning advice and interview preparation for high-impact roles.`,
      architect: `You are a Functional Domain Expert & Hiring Committee Reviewer (evaluating depth in the candidate's specific field: Software, Clinical Nursing, Corporate Finance, Enterprise Sales, or Operations).
You scrutinize domain depth, methodologies, tools, and regulatory or technical rigor.
You advise the candidate on how to prove genuine high-level expertise rather than generic responsibilities.`,
      mentor: `You are an encouraging Senior Career Strategist and Resume Doctor.
You are empathetic, insightful, and break down complex resume improvements into easy, confidence-boosting steps.`,
    };

    const baseInstruction = personaInstructions[persona] || personaInstructions.recruiter;
    const systemInstruction = `${baseInstruction}

Target Domain / Context: ${domain}

Candidate Resume Context:
"""
${resumeContext || 'No resume context provided'}
"""

Guidelines:
- Keep answers insightful, formatted with clear markdown, bolding, and bullet points.
- When suggesting changes, always provide exact 'Before' and 'After' snippets.
- Tailor advice to the candidate's actual industry (IT or Non-IT) without assuming tech stacks for non-tech professionals.
- Be genuine and respectful, but never sugarcoat flaws that will cause rejection.`;

    const formattedHistory = messages.map((m: { role: string; content: string }) => {
      return `${m.role === 'user' ? 'User' : 'HR Expert'}: ${m.content}`;
    }).join('\n\n');

    const lastMessage = messages[messages.length - 1]?.content || 'Please give me advice on my resume.';

    const prompt = `Conversation history:
${formattedHistory}

Current user query:
"${lastMessage}"

Provide your expert response as the HR specialist:`;

    const reply = await callGemini({
      model: model || 'gemini-3.1-flash-lite',
      prompt,
      systemInstruction,
    });

    return res.json({
      reply,
      thinkingUsed: false,
      modelUsed: 'gemini-3.1-flash-lite (High Speed)',
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({ error: err.message || 'Chat service error' });
  }
});

// 3. AI Bullet Point Supercharger (IT & Non-IT)
app.post('/api/rewrite-bullet', async (req, res) => {
  try {
    const { bulletText, context = '', domain = 'general', style = 'xyz' } = req.body;

    if (!bulletText) {
      return res.status(400).json({ error: 'bulletText is required' });
    }

    const systemInstruction = `You are a Fortune 500 Senior HR Recruiter and Executive Resume Strategist across all industries (IT and Non-IT).
Transform weak, passive bullet points into high-impact accomplishments using the Google XYZ Formula: "Accomplished [X] as measured by [Y] by doing [Z]".
Adapt metrics to the field:
- Sales: quota %, revenue ($), win rates, deal cycles.
- Healthcare/Nursing: patient ratios, medication safety (0 errors), HCAHPS scores, clinical compliance.
- Finance: budget ($), EBITDA, OPEX savings, variance %, close speed.
- Marketing: CAC reduction %, ROAS, MQL volume, conversion rate.
- Operations: on-time delivery %, lead time reduction, inventory turns, logistics savings.
- HR: time-to-hire, offer acceptance rate, retention, eNPS.
- IT/Tech: latency, uptime, scale (MAUs), defect reduction %, stack.
Always begin with strong active verbs and concrete quantifiable outcomes.`;

    const prompt = `Transform this resume bullet point:
Original: "${bulletText}"
Role / Industry context: "${context || 'Professional'}" (Domain: ${domain})
Selected style: "${style}"

Provide 3 diverse, high-powered rewrite variations:
1. Metric & Business Impact Focused (highlighting performance, efficiency, dollar value or percentage gains)
2. Domain Competency Focused (highlighting core industry tools, compliance, methodologies, and leadership)
3. Balanced Google XYZ Format (optimal for general recruiters & ATS shortlisting)

Also explain what made the original bullet weak and what keywords were added.`;

    const rawResponse = await callGemini({
      model: 'gemini-3.1-flash-lite',
      prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          rewrites: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                bullet: { type: Type.STRING },
                keyImprovement: { type: Type.STRING },
                atsKeywordsAdded: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['title', 'bullet', 'keyImprovement', 'atsKeywordsAdded']
            }
          }
        },
        required: ['originalWeaknesses', 'rewrites']
      }
    });

    return res.json(JSON.parse(rawResponse || '{}'));
  } catch (err: any) {
    console.error('Error in /api/rewrite-bullet:', err);
    return res.status(500).json({ error: err.message || 'Rewrite failed' });
  }
});

// 4. Mock HR & Interview Question Generator
app.post('/api/interview-prep', async (req, res) => {
  try {
    const { resumeText } = req.body;

    const systemInstruction = `You are an elite Senior Talent Acquisition Partner & Executive Hiring Screener with 20+ years of interview experience.
Analyze the candidate's actual resume content objectively to generate realistic, customized interview questions.
Focus on verifying their claims, numbers, past employment dates, technical/functional competencies, and situational responses.`;

    const prompt = `Based on this resume:
"""
${resumeText}
"""

Generate customized interview preparation questions:
1. 3 Tough HR Screen Questions (verifying timeline continuity, scope of responsibilities, credentials, and achievements)
2. 3 Domain & Technical Deep-Dive Questions (based directly on the projects, tools, systems, and methodologies listed in their resume)
3. 2 Behavioral / Situational Questions (handling difficult challenges, cross-functional collaboration, tight deadlines, or constraints)
4. Recommended winning talking points and answer frameworks for the candidate to excel.`;

    const rawResponse = await callGemini({
      model: 'gemini-3.1-flash-lite',
      prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hrScreenQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                whyTheyAskIt: { type: Type.STRING },
                modelAnswerTip: { type: Type.STRING }
              },
              required: ['question', 'whyTheyAskIt', 'modelAnswerTip']
            }
          },
          technicalQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                testedConcept: { type: Type.STRING },
                modelAnswerTip: { type: Type.STRING }
              },
              required: ['question', 'testedConcept', 'modelAnswerTip']
            }
          },
          behavioralQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                situationFocus: { type: Type.STRING },
                starAnswerGuide: { type: Type.STRING }
              },
              required: ['question', 'situationFocus', 'starAnswerGuide']
            }
          }
        },
        required: ['hrScreenQuestions', 'technicalQuestions', 'behavioralQuestions']
      }
    });

    return res.json(JSON.parse(rawResponse || '{}'));
  } catch (err: any) {
    console.error('Error in /api/interview-prep:', err);
    return res.status(500).json({ error: err.message || 'Interview prep failed' });
  }
});

// 5. ATS Keyword & Role Benchmark
app.post('/api/ats-keyword-gap', async (req, res) => {
  try {
    const { resumeText, targetRole = 'React Front-End Developer' } = req.body;

    const systemInstruction = `You are an Applicant Tracking System (ATS) algorithm analyzer like Taleo, Greenhouse, and Workday.
Analyze keyword presence, density, and missing high-priority skills for the specified target role.`;

    const prompt = `Analyze this resume against modern industry requirements for "${targetRole}":
"""
${resumeText}
"""

Determine ATS match percentage, found skills, critical missing skills, and formatting risk score.`;

    const rawResponse = await callGemini({
      model: 'gemini-3.1-flash-lite',
      prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.INTEGER, description: 'Percentage match 0-100' },
          roleTitle: { type: Type.STRING },
          foundKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          criticalMissingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          niceToHaveMissingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          atsFormattingRisk: { type: Type.STRING, description: 'Low, Medium, or High risk with reason' },
          placementAdvice: { type: Type.STRING, description: 'Where to weave missing keywords naturally' }
        },
        required: [
          'matchScore',
          'roleTitle',
          'foundKeywords',
          'criticalMissingKeywords',
          'niceToHaveMissingKeywords',
          'atsFormattingRisk',
          'placementAdvice'
        ]
      }
    });

    return res.json(JSON.parse(rawResponse || '{}'));
  } catch (err: any) {
    console.error('Error in /api/ats-keyword-gap:', err);
    return res.status(500).json({ error: err.message || 'ATS analysis failed' });
  }
});

// 6. Custom Job Description (JD) Keyword Gap & Tailoring Matcher
app.post('/api/match-job-description', async (req, res) => {
  try {
    const { resumeText, jobDescription, jobTitle = 'Target Job' } = req.body;

    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({ error: 'Job description text is required' });
    }

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const systemInstruction = `You are a Principal Technical Recruiter and ATS Algorithm Specialist (Greenhouse, Workday, Lever).
Your mission is to analyze an applicant's resume against a real-world Job Description (JD) provided by an employer.
Calculate an ATS match score (0-100), identify existing matched skills, and pinpoint all critical missing keywords.
For every missing keyword, suggest an exact, contextual sentence/bullet point showing how the applicant can legitimately weave it into their resume without keyword stuffing.`;

    const prompt = `Compare this applicant's resume directly against the target Job Description:

--- APPLICANT RESUME ---
"""
${resumeText}
"""

--- TARGET JOB DESCRIPTION ---
"""
${jobDescription}
"""

Analyze all explicit and implicit requirements (languages, frameworks, libraries, tools, testing, cloud, architecture, methodologies). Return the detailed JSON response adhering to the schema.`;

    const rawResponse = await callGemini({
      model: 'gemini-3.1-flash-lite',
      prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.INTEGER, description: 'ATS match percentage 0-100' },
          detectedJobTitle: { type: Type.STRING, description: 'Job title detected from JD' },
          summary: { type: Type.STRING, description: 'Executive summary of how well the resume matches the JD' },
          matchingKeywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING },
                category: { type: Type.STRING },
                contextInResume: { type: Type.STRING }
              },
              required: ['keyword', 'category']
            }
          },
          missingKeywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING },
                importance: { type: Type.STRING, description: 'Critical, High, or Recommended' },
                category: { type: Type.STRING, description: 'Language, Framework, Testing, Tool, Methodology' },
                whyItMatters: { type: Type.STRING },
                suggestedPlacement: { type: Type.STRING, description: 'e.g. Skills section, Experience bullet, Project description' },
                suggestedSentence: { type: Type.STRING, description: 'Natural resume-ready bullet or phrase to insert' }
              },
              required: ['keyword', 'importance', 'category', 'whyItMatters', 'suggestedPlacement', 'suggestedSentence']
            }
          },
          atsFormattingRisk: { type: Type.STRING },
          tailoringStrategy: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Top 3-4 strategic tips to tailor the resume for this specific JD'
          }
        },
        required: [
          'matchScore',
          'detectedJobTitle',
          'summary',
          'matchingKeywords',
          'missingKeywords',
          'atsFormattingRisk',
          'tailoringStrategy'
        ]
      }
    });

    return res.json(JSON.parse(rawResponse || '{}'));
  } catch (err: any) {
    console.error('Error in /api/match-job-description:', err);
    return res.status(500).json({ error: err.message || 'Job description analysis failed' });
  }
});

// Explicit 404 handler for unknown /api/* requests.
// Prevents requests from falling through into Vite HTML middleware.
app.all('/api/*', (req, res) => {
  return res.status(404).json({
    error: `The AI server was not found (HTTP 404). This app needs its Node server running ("npm start"); static-only hosting cannot run the AI features.`,
    endpoint: `${req.method} ${req.path}`,
    suggestion: 'Verify that the endpoint exists and the Node backend is running.'
  });
});

// Centralized error handler returning clean JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || (err.name === 'PayloadTooLargeError' ? 413 : 500);
  return res.status(status).json({
    error: err.message || 'Internal AI Server Error',
    code: err.code || 'SERVER_ERROR'
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TalentAudit Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
