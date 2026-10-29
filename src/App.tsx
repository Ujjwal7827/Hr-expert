import React, { useState } from 'react';
import {
  UJJWAL_RESUME_TEXT,
  PRECOMPUTED_HR_EVALUATION
} from './data/ujjwalResume';
import { WelcomeImportView } from './components/WelcomeImportView';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { SectionAuditCard } from './components/SectionAuditCard';
import { HRChatAdvisor } from './components/HRChatAdvisor';
import { BulletPointRewriter } from './components/BulletPointRewriter';
import { ATSAnalyzer } from './components/ATSAnalyzer';
import { InterviewCoach } from './components/InterviewCoach';
import { ResumeComparisonView } from './components/ResumeComparisonView';
import { ImportResumeModal } from './components/ImportResumeModal';
import { exportOptimizedResumePDF, exportAuditReportPDF, parseRawTextToExportData } from './utils/pdfGenerator';
import { safeFetchJson } from './utils/apiClient';
import { detectDomainFromResumeText } from './data/domains';
import {
  Sparkles,
  FileText,
  MessageSquare,
  Wand2,
  Target,
  HelpCircle,
  Printer,
  RotateCcw,
  UserCheck,
  CheckCircle,
  LayoutDashboard,
  FileDown,
  Loader2,
  Upload,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'makeover' | 'audit' | 'tools' | 'chat'>('makeover');
  const [toolsSubTab, setToolsSubTab] = useState<'ats' | 'rewriter' | 'interview'>('ats');
  // Starts completely clean without default resume; user is greeted by Welcome view
  const [hasImportedResume, setHasImportedResume] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStage, setAuditStage] = useState<string>('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isPrintingReport, setIsPrintingReport] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Extract candidate name from first line or placeholder
  const candidateName = (hasImportedResume && resumeText.trim())
    ? (resumeText.split('\n').map(l => l.trim()).find(l => l.length > 0 && !l.startsWith('#')) || 'Candidate')
    : 'No Resume Loaded';

  const handleResetToWelcome = () => {
    setHasImportedResume(false);
    setEvaluation(null);
    setResumeText('');
    setImportNotice(null);
    setImportError(null);
    setActiveTab('makeover');
  };

  const handleQuickDownloadPDF = () => {
    if (!hasImportedResume || !evaluation) {
      setIsImportModalOpen(true);
      return;
    }
    setIsDownloadingPDF(true);
    try {
      const exportData = parseRawTextToExportData(resumeText, candidateName);
      exportOptimizedResumePDF(exportData);
    } catch (err: any) {
      setImportError(`PDF export error: ${err.message || 'Failed to export'}`);
    } finally {
      setTimeout(() => setIsDownloadingPDF(false), 600);
    }
  };

  const handlePrintAuditReport = () => {
    if (!hasImportedResume || !evaluation) {
      setIsImportModalOpen(true);
      return;
    }
    setIsPrintingReport(true);
    try {
      // 1. Generate & download the official executive audit report PDF document
      exportAuditReportPDF(evaluation, candidateName);

      // 2. Also trigger native browser window.print() if allowed by browser/environment
      try {
        window.print();
      } catch (e) {
        console.log('Native window.print() bypassed due to sandbox iframe permissions:', e);
      }
    } catch (err: any) {
      setImportError(`Print report error: ${err.message || 'Failed to generate print report'}`);
    } finally {
      setTimeout(() => setIsPrintingReport(false), 600);
    }
  };

  const handleImportResume = async (newText: string, autoAudit: boolean = true) => {
    setResumeText(newText);
    setHasImportedResume(true);
    setIsImportModalOpen(false);
    setImportError(null);

    // Extract first bullet from imported resume if available
    const lines = newText.split('\n');
    const firstBullet = lines.find((l) => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*'));
    if (firstBullet) {
      setRewriterInitialBullet(firstBullet.replace(/^[•\-\*]\s*/, '').trim());
      setRewriterInitialContext(`Imported Resume (${newText.split('\n')[0]?.trim() || 'Candidate'})`);
    }

    if (autoAudit) {
      await handleRunGeminiReAudit(newText, false, true);
    } else {
      setImportNotice(`Resume loaded for ${newText.split('\n')[0]?.trim() || 'Candidate'}. Click Re-audit to evaluate.`);
    }
  };

  // Selected bullet for the rewriter
  const [rewriterInitialBullet, setRewriterInitialBullet] = useState(
    'Designed and launched 300+ websites across multiple site editors for SMB clients, building responsive, CMS-based, user-centric web experiences.'
  );
  const [rewriterInitialContext, setRewriterInitialContext] = useState('SaaS Web Designer at Adaan Digital');

  const handleOpenRewriterWithText = (text: string, context: string) => {
    setRewriterInitialBullet(text);
    setRewriterInitialContext(context);
    setToolsSubTab('rewriter');
    setActiveTab('tools');
  };

  const handleJumpToTab = (tab: string) => {
    if (tab === 'audit' || tab === 'overview') {
      setActiveTab('audit');
    } else if (tab === 'rewriter') {
      setToolsSubTab('rewriter');
      setActiveTab('tools');
    } else if (tab === 'ats') {
      setToolsSubTab('ats');
      setActiveTab('tools');
    } else if (tab === 'interview') {
      setToolsSubTab('interview');
      setActiveTab('tools');
    } else if (tab === 'chat') {
      setActiveTab('chat');
    } else {
      setActiveTab('makeover');
    }
  };

  const handleRunGeminiReAudit = async (
    newText: string,
    enableThinking: boolean = false,
    isFreshImport: boolean = false
  ) => {
    setIsAuditing(true);
    setImportError(null);
    const parsedName = newText.split('\n')[0]?.trim() || 'Candidate';
    setAuditStage(`Instant Analysis: Evaluating universal HR standards for ${parsedName}...`);

    try {
      const data = await safeFetchJson<any>('/api/rate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: newText,
        })
      });

      setEvaluation(data);
      setHasImportedResume(true);
      setActiveTab('makeover');

      if (isFreshImport) {
        setImportNotice(`Resume for ${parsedName} evaluated! Overall Score: ${data.overallScore}/100 (Grade ${data.grade})`);
      }
    } catch (err: any) {
      console.error('Audit evaluation error:', err);
      setImportError(err.message || 'Evaluation encountered an error. Please try again or paste resume text.');
    } finally {
      setIsAuditing(false);
      setAuditStage('');
    }
  };

  const detectedDomain = hasImportedResume && resumeText ? detectDomainFromResumeText(resumeText) : null;

  const tabs = [
    { id: 'makeover', label: 'HR Makeover & PDF', icon: Sparkles },
    { id: 'audit', label: 'Scorecard & Fixes', icon: LayoutDashboard },
    { id: 'tools', label: 'ATS & Tools', icon: Target },
    { id: 'chat', label: 'AI Advisor', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Branding & Candidate Info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  TalentAudit Pro
                </h1>
                <p className="text-xs text-slate-500">
                  {hasImportedResume ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-800">{candidateName}</span>
                      {detectedDomain && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {detectedDomain.name}
                        </span>
                      )}
                      {evaluation && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-emerald-700 font-semibold">Score: {evaluation.overallScore}/100</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-500">Grade {evaluation.grade}</span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span>Executive Resume Quality Evaluator</span>
                  )}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {hasImportedResume ? (
                <>
                  <button
                    onClick={handleResetToWelcome}
                    className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Return to Welcome Screen & Start Over"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Start Over</span>
                  </button>

                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Import or paste another resume"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Change Resume</span>
                  </button>

                  <button
                    onClick={handleQuickDownloadPDF}
                    disabled={isDownloadingPDF}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Download ATS-Optimized PDF Resume"
                  >
                    {isDownloadingPDF ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>Export PDF</span>
                  </button>

                  <button
                    onClick={handlePrintAuditReport}
                    disabled={isPrintingReport}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Print or download complete executive audit report"
                    aria-label="Print or download executive audit report"
                  >
                    {isPrintingReport ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                    ) : (
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span className="hidden sm:inline">Print Report</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Resume</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation (visible once resume is loaded) */}
          {hasImportedResume && evaluation && (
            <div className="border-t border-slate-100 -mb-px">
              <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3 px-3.5 sm:px-4 text-xs whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                        isActive
                          ? 'border-indigo-600 text-indigo-700 font-bold'
                          : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {tab.id === 'audit' && evaluation && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 ml-0.5">
                          {evaluation.overallScore}
                        </span>
                      )}
                      {tab.id === 'makeover' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 ml-0.5 hidden sm:inline">
                          Top Pick
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Real-time Analysis Loading Banner */}
        {isAuditing && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-lg overflow-hidden relative animate-in fade-in duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/50 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Executive HR Evaluation in Progress
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 font-semibold">
                      Universal Standards
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Analyzing Freshly Imported Resume for <span className="text-indigo-200">{candidateName}</span>
                  </h3>
                  <p className="text-xs text-indigo-200/80 mt-1 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                    <span>{auditStage || 'Reading resume structure & evaluating universal HR standards...'}</span>
                  </p>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end text-right text-xs text-indigo-300/70">
                <span className="font-semibold text-white">Full-Stack Intelligence Pipeline</span>
                <span className="text-[11px]">Gemini 3.8 Flash Turbo Engine</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {importError && !isAuditing && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {resumeText && (
                <button
                  onClick={() => handleRunGeminiReAudit(resumeText, false, true)}
                  className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-white hover:bg-rose-100 rounded-lg border border-rose-300 transition-colors cursor-pointer"
                >
                  Retry Evaluation
                </button>
              )}
              <button
                onClick={() => setImportError(null)}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer p-1"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Import Success Banner */}
        {importNotice && !isAuditing && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importNotice}</span>
            </div>
            <button
              onClick={() => setImportNotice(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* IF NO RESUME IMPORTED YET: Render Welcome & Import View */}
        {(!hasImportedResume || !evaluation) ? (
          <WelcomeImportView
            onImportResume={handleImportResume}
            isAuditing={isAuditing}
            auditStage={auditStage}
          />
        ) : (
          <>
            {/* Candidate Banner on Mobile */}
            <div className="sm:hidden mb-4 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Candidate: {candidateName}</span>
                <span>Universal HR Quality Audit</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Score: {evaluation.overallScore}/100
              </span>
            </div>

            {/* Tab 1: HR Makeover & PDF Export (Primary Value) */}
            {activeTab === 'makeover' && (
              <div className="space-y-6">
                <ResumeComparisonView
                  currentResumeText={resumeText}
                  onUpdateResumeText={setResumeText}
                  onRunGeminiReAudit={handleRunGeminiReAudit}
                  isAuditing={isAuditing}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                />
              </div>
            )}

            {/* Tab 2: Combined Scorecard & Section Fixes (All Audit in One Place) */}
            {activeTab === 'audit' && (
              <div className="space-y-8">
                <ExecutiveSummary
                  evaluation={evaluation}
                  candidateName={candidateName}
                  onJumpToTab={handleJumpToTab}
                />
                <div className="pt-2">
                  <SectionAuditCard
                    sectionCritiques={evaluation.sectionCritiques}
                    actionPlan={evaluation.actionPlanTo90Plus}
                    onOpenRewriterWithText={handleOpenRewriterWithText}
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Unified ATS & Career Tools (Switcher for Matcher, Rewriter, Interview) */}
            {activeTab === 'tools' && (
              <div className="space-y-6">
                {/* Clean Sub-navigation Bar */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
                  <button
                    onClick={() => setToolsSubTab('ats')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      toolsSubTab === 'ats'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Job Description Matcher</span>
                  </button>
                  <button
                    onClick={() => setToolsSubTab('rewriter')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      toolsSubTab === 'rewriter'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Google XYZ Bullet Optimizer</span>
                  </button>
                  <button
                    onClick={() => setToolsSubTab('interview')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      toolsSubTab === 'interview'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Interview Prep Coach</span>
                  </button>
                </div>

                {toolsSubTab === 'ats' && (
                  <ATSAnalyzer resumeText={resumeText} />
                )}
                {toolsSubTab === 'rewriter' && (
                  <BulletPointRewriter
                    initialBullet={rewriterInitialBullet}
                    initialContext={rewriterInitialContext}
                  />
                )}
                {toolsSubTab === 'interview' && (
                  <InterviewCoach resumeText={resumeText} />
                )}
              </div>
            )}

            {/* Tab 4: AI HR Advisor (Multi-turn Recruiter Consultation) */}
            {activeTab === 'chat' && (
              <HRChatAdvisor resumeContext={resumeText} />
            )}
          </>
        )}
      </main>

      {/* Import Resume Modal */}
      <ImportResumeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportResume={handleImportResume}
      />
    </div>
  );
}
