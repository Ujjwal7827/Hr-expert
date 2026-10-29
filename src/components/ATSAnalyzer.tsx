import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Loader2,
  FileText,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
  Tag,
  Lightbulb,
  Building2
} from 'lucide-react';
import { safeFetchJson } from '../utils/apiClient';

interface ATSAnalyzerProps {
  resumeText: string;
}

export const ATSAnalyzer: React.FC<ATSAnalyzerProps> = ({ resumeText }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Job Description state
  const [jobDescriptionInput, setJobDescriptionInput] = useState(
    `Frontend Software Engineer (React / TypeScript)
Responsibilities:
- Build and maintain modern, responsive user interfaces using React.js, TypeScript, and Tailwind CSS.
- Integrate RESTful APIs and handle asynchronous data fetching and global state management.
- Write unit and integration tests using Jest and React Testing Library to maintain 90%+ code reliability.
- Optimize frontend web performance, ensuring sub-2 second Core Web Vitals (LCP, CLS, INP).
- Collaborate in an Agile/Scrum team using Git, GitHub pull requests, and CI/CD pipelines.

Qualifications:
- 1-3 years of frontend web development experience.
- Strong proficiency in JavaScript (ES6+), TypeScript, React, HTML5, and modern CSS frameworks (Tailwind/Bootstrap).
- Hands-on experience with API integration, Chrome DevTools profiling, and cross-browser debugging.
- Familiarity with state management libraries (Zustand, Redux) and bundlers like Vite or Next.js.`
  );

  const [jdAnalysisResult, setJdAnalysisResult] = useState<any>({
    matchScore: 68,
    detectedJobTitle: 'Frontend Software Engineer (React / TypeScript)',
    summary:
      'The applicant demonstrates strong foundations in HTML, CSS, JavaScript, React.js, Tailwind CSS, and Git with impressive volume (300+ sites). However, the job description explicitly prioritizes TypeScript, Unit Testing (Jest), and Global State Management, which are currently missing from the resume.',
    matchingKeywords: [
      { keyword: 'React.js', category: 'Framework', contextInResume: 'Listed in Web Technologies and Projects' },
      { keyword: 'Tailwind CSS', category: 'Styling', contextInResume: 'Used in Speech-to-Text project & Skills' },
      { keyword: 'JavaScript (ES6+)', category: 'Language', contextInResume: 'Found in Skills, Summary & Experience' },
      { keyword: 'HTML5 & CSS3', category: 'Core Web', contextInResume: 'Featured across all projects' },
      { keyword: 'Git & GitHub', category: 'Version Control', contextInResume: 'Version Control section' },
      { keyword: 'Responsive Web Design', category: 'Concept', contextInResume: 'Listed in Concepts & Summary' },
      { keyword: 'Cross-Browser Compatibility', category: 'Concept', contextInResume: 'Mentioned in Experience at Adaan' }
    ],
    missingKeywords: [
      {
        keyword: 'TypeScript',
        importance: 'Critical',
        category: 'Language / Core Stack',
        whyItMatters: 'Explicitly required in Qualifications for enterprise type-safety and interface contracts.',
        suggestedPlacement: 'Skills (Languages) & Speech-to-Text Project',
        suggestedSentence:
          'Migrated components to TypeScript, defining strict interfaces for audio transcription state and API response payloads.'
      },
      {
        keyword: 'Unit Testing (Jest / React Testing Library)',
        importance: 'Critical',
        category: 'Testing & Quality',
        whyItMatters: 'The JD requires maintaining 90%+ test coverage to avoid regression defects.',
        suggestedPlacement: 'Projects (Speech-to-Text Converter) & Skills',
        suggestedSentence:
          'Authored unit tests using Jest and React Testing Library covering voice recognition error handlers and state transitions.'
      },
      {
        keyword: 'State Management (Zustand / Redux)',
        importance: 'High',
        category: 'Architecture',
        whyItMatters: 'Necessary for handling complex asynchronous streaming data across components.',
        suggestedPlacement: 'Skills (Frameworks & Libraries) & Projects',
        suggestedSentence:
          'Architected global state management with Zustand to handle real-time audio streams and transcript history with minimal re-renders.'
      },
      {
        keyword: 'RESTful API Integration',
        importance: 'High',
        category: 'Networking',
        whyItMatters: 'JD explicitly highlights asynchronous REST API data fetching and error handling.',
        suggestedPlacement: 'Experience (Adaan Digital) & Projects',
        suggestedSentence:
          'Integrated third-party RESTful APIs and asynchronous data fetching pipelines, reducing client data loading latency by 30%.'
      },
      {
        keyword: 'Core Web Vitals (LCP, CLS, INP)',
        importance: 'Recommended',
        category: 'Performance',
        whyItMatters: 'Demonstrates deep engineering discipline beyond superficial design styling.',
        suggestedPlacement: 'Professional Summary & Experience Bullets',
        suggestedSentence:
          'Optimized Core Web Vitals across 300+ client sites, achieving sub-2s Largest Contentful Paint (LCP) and zero Cumulative Layout Shift.'
      }
    ],
    atsFormattingRisk: 'Low Risk — Standard single-column layout, parseable bullet points, and clear header hierarchy.',
    tailoringStrategy: [
      'Add TypeScript to your Technical Skills section immediately under Languages.',
      'Weave Jest/Testing into your Speech-to-Text Converter project description to satisfy the testing requirement.',
      'Highlight RESTful API integration under Adaan Digital Experience bullets to prove custom engineering beyond template builders.',
      'Explicitly cite Core Web Vitals (LCP, CLS) in your Professional Summary to mirror the JD performance terminology.'
    ]
  });

  const sampleJobDescriptions = [
    {
      title: 'Sales: Enterprise Account Executive (B2B SaaS)',
      jd: `Enterprise Account Executive (B2B SaaS)
Responsibilities:
- Drive end-to-end B2B sales cycles from discovery through proposal and contract execution for enterprise accounts ($50k-$200k ACV).
- Consistently exceed quarterly and annual quota targets ($1M+ ARR).
- Partner with Solution Architects and Customer Success to ensure seamless onboarding and account expansion.
Qualifications:
- 3+ years quota-carrying SaaS sales experience with verifiable track record of achieving >100% of plan.
- Expertise in Salesforce, MEDDPICC sales methodologies, outbound prospecting, and executive C-suite presentations.`
    },
    {
      title: 'Healthcare: Registered Nurse (ICU & Acute Care)',
      jd: `Registered Nurse (RN) - Intensive & Acute Care
Responsibilities:
- Provide high-acuity nursing care, assessing vital signs, triaging incoming trauma cases, and executing rapid physician care plans.
- Document clinical notes in Epic EHR with 100% regulatory, HIPAA, and patient safety compliance.
- Administer pharmacological titrations and manage mechanical ventilation with zero errors.
Qualifications:
- Active RN license in good standing (BSN preferred); BLS, ACLS, and PALS certified.
- 1-3 years clinical experience in emergency, critical care, or acute hospital settings.`
    },
    {
      title: 'Finance: Senior Financial Analyst (FP&A & Modeling)',
      jd: `Senior Financial Analyst (FP&A & Corporate Modeling)
Responsibilities:
- Build dynamic multi-year financial models, cash flow forecasts, and variance analyses for executive leadership.
- Partner with department heads to manage the $35M annual departmental budget and track CapEx/OpEx.
- Automate recurring monthly financial reporting packages using Advanced Excel, Power BI, and NetSuite/SAP.
Qualifications:
- Bachelor's in Finance, Accounting, or Economics (CPA or CFA in progress preferred).
- 3+ years experience in corporate FP&A or public accounting with strong GAAP comprehension.`
    },
    {
      title: 'Tech: Full-Stack / Frontend Engineer (React/TypeScript)',
      jd: `Frontend Software Engineer (React / TypeScript)
Responsibilities:
- Build and maintain modern, responsive user interfaces using React.js, TypeScript, and Tailwind CSS.
- Integrate RESTful APIs and handle asynchronous data fetching and global state management.
- Write unit and integration tests using Jest and React Testing Library to maintain 90%+ code reliability.
- Optimize frontend web performance, ensuring sub-2 second Core Web Vitals (LCP, CLS, INP).
Qualifications:
- 1-3 years of frontend web development experience with React, TypeScript, and modern CSS frameworks.`
    },
    {
      title: 'Marketing: Senior Growth Marketing Manager',
      jd: `Senior Growth Marketing Manager (B2B Demand Gen)
Responsibilities:
- Own multi-channel acquisition strategy across paid search, paid social, SEO, and email lifecycle automation.
- Partner with Sales to optimize lead scoring, conversion funnels, and pipeline attribution in HubSpot and Salesforce.
- Execute systematic A/B testing on landing pages and ad copy to maximize conversion efficiency and lower CAC.
Qualifications:
- 3+ years proven experience managing $500k+ digital marketing budgets with demonstrable ROAS.
- Deep expertise in Google Ads, GA4, Meta Ads Manager, HubSpot, and SEMrush.`
    },
    {
      title: 'HR: Senior Talent Acquisition Partner',
      jd: `Senior Talent Acquisition Partner / Recruiter
Responsibilities:
- Drive full-lifecycle recruiting across commercial, corporate, and specialized technical departments.
- Partner with hiring executives to define role specs, salary bands, and structured competency interview scorecards.
- Implement proactive candidate sourcing strategies in Greenhouse ATS that slash time-to-hire by 30%.
Qualifications:
- 3+ years full-cycle recruitment experience in corporate or high-growth environments.
- Proficiency in Greenhouse or Workday ATS, LinkedIn Recruiter, and structured behavioral interview frameworks.`
    }
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAnalyzeJobDescription = async () => {
    if (!jobDescriptionInput.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const data = await safeFetchJson<any>('/api/match-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescriptionInput
        })
      });

      setJdAnalysisResult(data);
    } catch (err: any) {
      alert(err.message || 'Error analyzing job description');
    } finally {
      setIsLoading(false);
    }
  };

  const getImportanceBadge = (importance: string) => {
    if (importance === 'Critical') {
      return 'bg-rose-100 text-rose-800 border-rose-300';
    }
    if (importance === 'High') {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Applicant Tracking System (ATS) &amp; Keyword Matcher</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Job Description (JD) Gap Scanner &amp; Missing Keyword Suggester
          </h2>
          <p className="text-xs text-slate-500">
            Paste any job description from LinkedIn, Indeed, or career sites to find missing keywords and get ready-to-use resume bullets
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Universal ATS &amp; Keyword Scanner</span>
        </div>
      </div>

      <div className="space-y-6">
          {/* Preset Samples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Or load a sample Job Description to test:
              </span>
              <span className="text-[11px] text-slate-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sampleJobDescriptions.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => setJobDescriptionInput(sample.jd)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-300 text-left text-xs transition-colors cursor-pointer"
                >
                  <span className="font-bold text-slate-900 block truncate text-[11px]">
                    {sample.title}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {sample.jd.split('\n')[1] || ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Paste Target Job Description (Requirements, Responsibilities, Skills):
              </label>
              {jobDescriptionInput && (
                <button
                  onClick={() => setJobDescriptionInput('')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear Text
                </button>
              )}
            </div>
            <textarea
              value={jobDescriptionInput}
              onChange={(e) => setJobDescriptionInput(e.target.value)}
              rows={7}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed placeholder-slate-400"
              placeholder="Paste job posting text from LinkedIn, Indeed, Greenhouse, Lever, or company careers page here..."
            />

            <button
              onClick={handleAnalyzeJobDescription}
              disabled={isLoading || !jobDescriptionInput.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xs cursor-pointer active:scale-99"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Comparing Resume Against Job Description with Gemini...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Analyze Job Description &amp; Find Missing Keywords</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results Display */}
          {jdAnalysisResult && !isLoading && (
            <div className="space-y-6 pt-4 border-t border-slate-200 animate-in fade-in duration-300">
              {/* Match Score Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                    Target Role Match: {jdAnalysisResult.detectedJobTitle || 'Target Position'}
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <h3 className="text-3xl font-black text-white">
                      {jdAnalysisResult.matchScore}%
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        jdAnalysisResult.matchScore >= 80
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                          : jdAnalysisResult.matchScore >= 65
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40'
                          : 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                      }`}
                    >
                      {jdAnalysisResult.matchScore >= 80
                        ? 'Strong Match'
                        : jdAnalysisResult.matchScore >= 65
                        ? 'Moderate Match (Gaps to Fill)'
                        : 'Significant Keyword Gaps'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed pt-1">
                    {jdAnalysisResult.summary}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">
                      ATS Format Safety
                    </span>
                    <span className="text-xs font-bold text-emerald-300">
                      100% Parseable
                    </span>
                  </div>
                </div>
              </div>

              {/* CRITICAL MISSING KEYWORDS WITH ACTIONABLE INSERTION RECOMMENDATIONS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Missing Keywords &amp; Tailored Sentence Suggestions ({jdAnalysisResult.missingKeywords?.length || 0})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Keywords found in the Job Description that are absent from your resume, with ready-to-copy integration examples
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {jdAnalysisResult.missingKeywords?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {item.keyword}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getImportanceBadge(
                              item.importance
                            )}`}
                          >
                            {item.importance}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200 text-slate-700">
                            {item.category}
                          </span>
                        </div>

                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          Recommended in: {item.suggestedPlacement}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Why the recruiter asks for this:</strong> {item.whyItMatters}
                      </p>

                      {/* Suggested tailored bullet point to copy */}
                      <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Suggested Resume Bullet Point to Add:
                          </span>
                          <button
                            onClick={() => handleCopy(item.suggestedSentence, `kw-${idx}`)}
                            className="p-1 px-2 rounded bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            {copiedKey === `kw-${idx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Sentence</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-indigo-950 font-mono leading-relaxed bg-white p-2.5 rounded-md border border-indigo-100">
                          • {item.suggestedSentence}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matching Keywords Detected */}
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Matching Keywords Found in Your Resume ({jdAnalysisResult.matchingKeywords?.length || 0})
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {jdAnalysisResult.matchingKeywords?.map((match: any, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-2xs text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900">✓ {match.keyword}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{match.category}</span>
                      </div>
                      {match.contextInResume && (
                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                          {match.contextInResume}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailoring Strategies */}
              {jdAnalysisResult.tailoringStrategy?.length > 0 && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                  <strong className="block font-bold uppercase tracking-wider text-purple-900 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Strategic Advice for this Specific Job Application:
                  </strong>
                  <ul className="space-y-1 text-purple-900 list-disc list-inside">
                    {jdAnalysisResult.tailoringStrategy.map((tip: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
};

