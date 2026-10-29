import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Award,
  Target,
  MessageSquare,
  HelpCircle,
  Zap,
  ArrowRight,
  ClipboardPaste,
  FileCheck
} from 'lucide-react';
import { UJJWAL_RESUME_TEXT } from '../data/ujjwalResume';
import { safeFetchJson } from '../utils/apiClient';

interface WelcomeImportViewProps {
  onImportResume: (text: string, autoAudit?: boolean) => Promise<void>;
  isAuditing: boolean;
  auditStage: string;
}

const SAMPLE_RESUMES = [
  {
    role: 'IT & Software',
    candidate: 'Ujjwal Singh (Web & Frontend)',
    description: '300+ SMB websites, React/Tailwind, needs stronger conversion & impact metrics.',
    text: UJJWAL_RESUME_TEXT
  },
  {
    role: 'Sales & BD',
    candidate: 'Marcus Vance (Enterprise Account Executive)',
    description: 'B2B SaaS deals, $1.45M closed ARR, 132% quota attainment, MEDDPICC selling.',
    text: `Marcus Vance
Chicago, IL | (312) 555-8912 | marcus.vance@example.com | linkedin.com/in/marcusvance-sales

PROFESSIONAL SUMMARY
High-performing Enterprise Account Executive with 5+ years of experience exceeding revenue quotas selling complex B2B SaaS solutions into Fortune 1000 accounts. Proven expertise in consultative MEDDPICC qualification, C-level executive presentations, and outbound pipeline generation.

PROFESSIONAL EXPERIENCE
Senior Enterprise Account Executive | ApexCloud Solutions | 2022 - Present (Chicago, IL)
• Closed $1.45M in new Annual Recurring Revenue (ARR) across 38 mid-market enterprise deals, finishing at 132% of fiscal quota.
• Shortened average enterprise sales cycle velocity from 75 to 48 days by implementing mutual action plans and executive stakeholder alignment.
• Sourced 42% of closed pipeline via targeted outbound account-based prospecting across manufacturing and financial services verticals.
• Partnered with Solutions Engineering and Customer Success to achieve a 98% first-year client retention rate.

Account Executive | Kinetic CRM Software | 2019 - 2022 (Austin, TX)
• Achieved 118% average annual quota attainment selling cloud CRM licenses with average deal sizes of $45K ARR.
• Conducted 140+ tailored product demonstrations annually to VP of Sales, CRO, and IT Director buyers.
• Won 2021 "Top Producer" award out of a 28-rep commercial sales organization.

EDUCATION
Bachelor of Science in Marketing & Communications
University of Illinois at Urbana-Champaign (2019)

CORE COMPETENCIES & TOOLS
Enterprise B2B Sales, Quota Attainment (130%+), Pipeline Management, MEDDPICC, Salesforce, HubSpot CRM, Gong.io, Salesloft, Contract Negotiation, Territory Planning`
  },
  {
    role: 'Healthcare & Nursing',
    candidate: 'Elena Rostova, BSN, RN (ICU & Critical Care)',
    description: 'Critical care, 1:2 patient ratio, ventilator management, zero medication errors.',
    text: `Elena Rostova, BSN, RN
Philadelphia, PA | (215) 555-0143 | elena.rostova.rn@example.com | linkedin.com/in/elena-rostova-rn

PROFESSIONAL SUMMARY
Compassionate, board-certified Critical Care Registered Nurse (BSN, RN) with 4+ years of intensive care and trauma unit experience. Demonstrated excellence managing high-acuity ventilator patients, complex pharmacological titrations, and emergency resuscitations with zero medication errors.

CLINICAL EXPERIENCE
Staff Registered Nurse (ICU) | Temple University Hospital | 2021 - Present (Philadelphia, PA)
• Managed high-acuity care for 2-3 critically ill trauma, septic, and post-cardiac arrest patients per shift in a 24-bed Level 1 trauma ICU.
• Administered complex vasoactive infusions, continuous renal replacement therapy (CRRT), and mechanical ventilation with 100% adherence to clinical protocols and zero medication errors across 36 months.
• Collaborated in multidisciplinary physician rounds, advocating for patient safety and executing rapid code responses.
• Championed unit central line infection (CLABSI) reduction initiative, resulting in 18 consecutive months with zero hospital-acquired infections.

Staff Nurse (Medical-Surgical Unit) | Penn Medicine | 2019 - 2021 (Philadelphia, PA)
• Delivered acute post-operative and telemetry care for 5-6 patients per shift, achieving a 96% patient satisfaction (HCAHPS) rating.
• Educated patients and families on post-surgical wound care and medication regimens, decreasing 30-day preventable readmissions by 12%.

EDUCATION & CREDENTIALS
Bachelor of Science in Nursing (BSN) | Villanova University (2019, Magna Cum Laude)
Licenses & Certifications: Registered Nurse (PA License #RN-894120), CCRN (Critical Care), BLS, ACLS, PALS

CORE CLINICAL COMPETENCIES
ICU / Critical Care, Mechanical Ventilation, Hemodynamic Monitoring, Epic EHR, Patient & Family Education, IV Infusion Titration, Trauma Triage, Infection Prevention (CLABSI/CAUTI)`
  },
  {
    role: 'Finance & Accounting',
    candidate: 'David Chen, CPA (Senior Financial Analyst)',
    description: 'FP&A, $48M operating budget, $1.8M cost savings identified, month-end close acceleration.',
    text: `David Chen, CPA
New York, NY | (917) 555-4321 | david.chen.cpa@example.com | linkedin.com/in/davidchen-fpa

PROFESSIONAL SUMMARY
Detail-oriented Senior Financial Analyst and Certified Public Accountant (CPA) with 5+ years of experience in corporate FP&A, financial modeling, and variance analysis. Proven track record managing $45M+ operating budgets and partnering with department heads to identify $2M+ in cost efficiencies.

PROFESSIONAL EXPERIENCE
Senior Financial Analyst | Horizon Media Group | 2022 - Present (New York, NY)
• Built dynamic multi-year financial forecasting models for a $48M corporate operating budget, maintaining variance accuracy within 1.8% of actuals.
• Conducted quarterly departmental spend reviews, uncovering $1.8M in redundant software licenses and vendor overcharges.
• Streamlined the monthly financial reporting package in NetSuite and Power BI, reducing executive dashboard delivery from 8 business days to 3.
• Partnered with Chief Financial Officer on M&A due diligence valuation models for a $14M strategic acquisition.

Financial Analyst | Deloitte & Touche LLP | 2019 - 2022 (New York, NY)
• Performed GAAP financial statement audits and internal control testing for Fortune 500 manufacturing and commercial clients.
• Automated 12 recurring audit reconciliation schedules in Excel (VBA/Power Query), saving 40+ hours per audit engagement.

EDUCATION & LICENSES
B.S. in Accounting & Finance | NYU Stern School of Business (2019)
Certified Public Accountant (CPA) – New York State Board of Accountancy

FINANCIAL SKILLS & TOOLS
Financial Modeling, FP&A, Corporate Budgeting ($48M+), GAAP Compliance, Variance Analysis, NetSuite, SAP, Power BI, Advanced Excel (XLOOKUP, Power Query, Macros), M&A Valuation`
  },
  {
    role: 'Marketing & Growth',
    candidate: 'Alex Rivera (Growth Marketing Manager)',
    description: 'PPC campaigns, $650k budget management, -27% CAC, 4.1x ROAS, HubSpot/GA4.',
    text: `Alex Rivera
Austin, TX | (512) 555-4321 | alex.rivera@example.com | linkedin.com/in/alexrivera-growth

PROFESSIONAL SUMMARY
Data-oriented Growth Marketing Manager with 4+ years of experience scaling B2B demand generation pipelines, paid acquisition, and inbound conversion. Managed over $650K in annual digital ad spend with an average ROAS of 4.1x and 4,200+ qualified MQLs generated.

WORK EXPERIENCE
Growth Marketing Manager | ScaleFlow SaaS | 2021 - Present (Austin, TX)
• Orchestrated multichannel paid search and social campaigns across Google Ads, LinkedIn, and Meta, generating 4,200+ qualified MQLs annually.
• Lowered Customer Acquisition Cost (CAC) by 27% through systematic multivariate landing page testing and negative keyword pruning.
• Designed automated email nurturing sequences in HubSpot, increasing lead-to-opportunity conversion by 19%.
• Analyzed weekly pipeline metrics using Google Analytics 4 and Tableau to allocate budget toward highest ROI channels.

Digital Marketing Associate | Elevate Agency | 2020 - 2021 (Austin, TX)
• Managed content strategy and technical SEO optimizations for 12 client websites, yielding an average organic traffic increase of 65% in 9 months.
• Wrote high-converting ad copy and product one-pagers that generated $180k in attributable pipeline revenue.

SKILLS & TOOLS
Google Ads (Search & Display), Meta Ads Manager, LinkedIn Campaign Manager, HubSpot, GA4, Semrush, Webflow, Copywriting, A/B Testing, Attribution Modeling, CAC / LTV Optimization

EDUCATION
B.A. in Strategic Communication & Marketing | University of Texas at Austin (2020)`
  },
  {
    role: 'HR & Talent',
    candidate: 'Priya Sharma (Senior Talent Acquisition Partner)',
    description: '70+ annual corporate hires, time-to-hire slashed from 52 to 31 days, 94% offer acceptance.',
    text: `Priya Sharma
Atlanta, GA | (404) 555-7890 | priya.sharma.hr@example.com | linkedin.com/in/priyasharma-talent

PROFESSIONAL SUMMARY
Strategic Senior Talent Acquisition Partner with 5+ years of experience driving full-lifecycle recruiting across corporate, engineering, and commercial departments. Champion of structured competency-based interviewing, diversity sourcing, and candidate experience, slashing time-to-fill by 40%.

WORK EXPERIENCE
Senior Talent Acquisition Partner | Nexis Solutions | 2022 - Present (Atlanta, GA)
• Led end-to-end recruitment for 70+ technical, sales, and operations roles across 4 business units, cutting average time-to-hire from 52 to 31 days.
• Maintained a 94% candidate offer acceptance rate through proactive candidate nurturing, compensation benchmarking, and rapid feedback loops.
• Overhauled structured interview rubrics in Greenhouse ATS, eliminating interviewer bias and boosting 90-day new hire retention to 96%.
• Expanded diverse sourcing talent pools by 34% through partnerships with regional professional associations and universities.

Corporate Recruiter | Apex Staffing Partners | 2019 - 2022 (Atlanta, GA)
• Sourced, screened, and placed 45+ professionals annually in commercial and finance positions.
• Coordinated quarterly career fairs and employer branding webinars attracting 500+ applicants.

EDUCATION & CERTIFICATIONS
B.A. in Human Resource Management | Georgia State University (2019)
SHRM-CP (Certified Professional) | LinkedIn Certified Professional Recruiter

CORE COMPETENCIES & SYSTEMS
Full-Lifecycle Recruiting, Executive Sourcing, Greenhouse ATS, Workday, LinkedIn Recruiter, Compensation Benchmarking, Structured Interviewing, Time-to-Hire Reduction, Diversity Pipeline Sourcing`
  }
];

export const WelcomeImportView: React.FC<WelcomeImportViewProps> = ({
  onImportResume,
  isAuditing,
  auditStage
}) => {
  const [tab, setTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setExtractionError(null);

    // If text file
    if (
      file.type === 'text/plain' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json')
    ) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (text && text.trim().length > 30) {
          setPastedText(text);
          await onImportResume(text, true);
        } else {
          setExtractionError('The uploaded file appears to be empty or has too little text.');
        }
      };
      reader.readAsText(file);
      return;
    }

    // PDF, DOCX, or binary document
    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const base64Data = result.includes('base64,') ? result.split('base64,')[1] : result;
          const mimeType = file.type || 'application/pdf';

          const data = await safeFetchJson<{ text: string }>('/api/extract-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType,
              fileName: file.name
            })
          });

          if (data && data.text && data.text.trim().length > 20) {
            setPastedText(data.text);
            await onImportResume(data.text, true);
          } else {
            throw new Error('Could not find readable text in this document. Please try pasting your resume text.');
          }
        } catch (err: any) {
          setExtractionError(err.message || 'Error processing document');
        } finally {
          setIsExtracting(false);
        }
      };
      reader.onerror = () => {
        setExtractionError('Error reading file from disk. Please try selecting the file again.');
        setIsExtracting(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setExtractionError(err.message || 'Error processing document');
      setIsExtracting(false);
    }
  };

  const handleAnalyzePasted = async () => {
    if (!pastedText || pastedText.trim().length < 40) {
      setExtractionError('Please paste at least a couple sentences of your resume (name, experience, skills).');
      return;
    }
    setExtractionError(null);
    await onImportResume(pastedText.trim(), true);
  };

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Hero Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Executive HR &amp; ATS Resume Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Evaluate Your Resume Like a{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
            Senior HR Director
          </span>
        </h1>

        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Import your resume below to receive an instant, objective 100-point evaluation and shortlist makeover.
          Built for <strong className="text-slate-900 font-semibold">ALL professional domains (IT and Non-IT)</strong> — Sales, Healthcare, Finance, Engineering, Marketing, HR, Operations &amp; more.
        </p>

        {/* Domain Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 max-w-3xl mx-auto">
          {['IT & Software', 'Sales & BD', 'Healthcare & Clinical', 'Finance & FP&A', 'Growth Marketing', 'HR & Recruiting', 'Supply Chain', 'Legal & Risk'].map((d) => (
            <span key={d} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Main Interactive Import Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Method Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'upload'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document (PDF / DOCX)</span>
          </button>

          <button
            onClick={() => setTab('paste')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'paste'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Paste Resume Text</span>
          </button>

          <button
            onClick={() => setTab('samples')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'samples'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Try Sample Resume</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: UPLOAD DOCUMENT */}
          {tab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-indigo-600 bg-indigo-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                    {isExtracting || isAuditing ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <FileUp className="w-8 h-8" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">
                      {isExtracting
                        ? 'Extracting text from resume...'
                        : isAuditing
                        ? 'Analyzing resume with Gemini Pro...'
                        : 'Drag & Drop your resume file here'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Supports PDF, Word (.docx), Plain Text (.txt), or Markdown
                    </p>
                  </div>

                  {!isExtracting && !isAuditing && (
                    <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Files on Computer</span>
                    </div>
                  )}

                  {selectedFile && !isExtracting && (
                    <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      Loaded: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>

              {extractionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                    <span>{extractionError}</span>
                  </div>
                  <button
                    onClick={() => {
                      setTab('paste');
                      setExtractionError(null);
                    }}
                    className="shrink-0 px-3 py-1 bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                  >
                    Paste Text Instead
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Files are processed privately &amp; securely
                </span>
                <span>Max file size: 10MB</span>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE RESUME TEXT */}
          {tab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Paste Resume Content (Summary, Experience, Education, Skills)
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    setExtractionError(null);
                  }}
                  rows={10}
                  placeholder={`John Doe\nSoftware Engineer | San Francisco, CA | john@example.com\n\nPROFESSIONAL SUMMARY\nFull-stack engineer with 4+ years of experience building scalable web applications...\n\nWORK EXPERIENCE\nSenior Frontend Engineer | Acme Corp (2022 - Present)\n• Architected design system used across 8 applications, cutting frontend dev cycles by 30%...\n• Spearheaded web vitals initiative, improving LCP from 3.2s to 1.1s...`}
                  className="w-full p-4 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed transition-all"
                />
              </div>

              {extractionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{extractionError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  {pastedText.length} characters • ~{pastedText.split(/\s+/).filter(Boolean).length} words
                </span>

                <button
                  onClick={handleAnalyzePasted}
                  disabled={isAuditing || !pastedText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {isAuditing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Universal HR Standards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Start HR Evaluation &amp; Scoring</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DEMO SAMPLES */}
          {tab === 'samples' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Want to test the HR scoring system instantly? Pick any of these realistic candidate profiles to experience the full evaluation suite:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SAMPLE_RESUMES.map((sample, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 bg-slate-50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {sample.role}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-2">{sample.candidate}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        setPastedText(sample.text);
                        await onImportResume(sample.text, true);
                      }}
                      disabled={isAuditing}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      {isAuditing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Load &amp; Score This Resume</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Pillar Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Universal HR Scorecard</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            100-point rubric assessing impact metrics, action verbs, machine parsability, layout, and credibility.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Google XYZ Rewrites</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Transform passive responsibilities into "Accomplished [X], measured by [Y], by doing [Z]" power bullets.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Job Description Matcher</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Paste any targeted job opening to detect missing keywords, skill gaps, and custom tailoring advice.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">ATS Optimized PDF Export</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate and download a clean, single-page PDF formatted to effortlessly pass modern ATS scanners.
          </p>
        </div>
      </div>
    </div>
  );
};
