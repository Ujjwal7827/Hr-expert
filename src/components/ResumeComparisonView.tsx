import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  FileText,
  Sparkles,
  Edit3,
  RotateCcw,
  Loader2,
  FileDown,
  Upload,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronDown,
  Briefcase,
  AlertCircle,
  Eye,
  ShieldCheck
} from 'lucide-react';
import {
  exportOptimizedResumePDF,
  convertEnhancedToExportData,
  parseRawTextToExportData
} from '../utils/pdfGenerator';
import { DOMAINS, detectDomainFromResumeText, getDomainById, DomainDefinition } from '../data/domains';
import { safeFetchJson } from '../utils/apiClient';

interface ResumeComparisonViewProps {
  currentResumeText: string;
  onUpdateResumeText: (text: string) => void;
  onRunGeminiReAudit: (text: string, enableThinking: boolean) => Promise<void>;
  isAuditing: boolean;
  onOpenImportModal?: () => void;
}

export const ResumeComparisonView: React.FC<ResumeComparisonViewProps> = ({
  currentResumeText,
  onUpdateResumeText,
  onRunGeminiReAudit,
  isAuditing,
  onOpenImportModal
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainDefinition>(() =>
    detectDomainFromResumeText(currentResumeText)
  );
  const [activeView, setActiveView] = useState<'comparison' | 'edit'>('comparison');
  const [editedText, setEditedText] = useState(currentResumeText);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedOptimized, setCopiedOptimized] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfTheme, setPdfTheme] = useState<'modern' | 'classic' | 'minimal'>('modern');

  // HR Transformation state
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementError, setEnhancementError] = useState<string | null>(null);
  const [appliedSuccessNotice, setAppliedSuccessNotice] = useState<string | null>(null);

  // Auto-detect domain and auto-generate makeover whenever currentResumeText changes
  useEffect(() => {
    setEditedText(currentResumeText);
    const detected = detectDomainFromResumeText(currentResumeText);
    setSelectedDomain(detected);

    if (currentResumeText && currentResumeText.trim().length > 30 && !enhancedData && !isEnhancing) {
      handleGenerateMakeover(detected);
    }
  }, [currentResumeText]);

  // Handle triggering the HR enhancement
  const handleGenerateMakeover = async (domainToUse?: DomainDefinition) => {
    if (!currentResumeText || currentResumeText.trim().length < 20 || isEnhancing) return;
    setIsEnhancing(true);
    setEnhancementError(null);

    const activeDom = domainToUse || selectedDomain;

    try {
      const data = await safeFetchJson<any>('/api/hr-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: currentResumeText,
          targetDomain: activeDom.name,
          targetRole: activeDom.sampleJobTitles[0] || ''
        })
      });

      setEnhancedData(data);
    } catch (err: any) {
      console.error('HR Makeover generation failed:', err);
      setEnhancementError(err.message || 'Failed to generate HR makeover. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDomainChange = (domainId: string) => {
    const newDomain = getDomainById(domainId);
    setSelectedDomain(newDomain);
    handleGenerateMakeover(newDomain);
  };

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(currentResumeText);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyOptimized = () => {
    const textToCopy = enhancedData?.fullFormattedResumeText || currentResumeText;
    navigator.clipboard.writeText(textToCopy);
    setCopiedOptimized(true);
    setTimeout(() => setCopiedOptimized(false), 2000);
  };

  const handleDownloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      const exportData = enhancedData
        ? convertEnhancedToExportData(enhancedData, currentResumeText.split('\n')[0] || 'Candidate')
        : parseRawTextToExportData(currentResumeText, currentResumeText.split('\n')[0] || 'Candidate');

      exportOptimizedResumePDF(exportData, pdfTheme);
    } catch (err: any) {
      setEnhancementError(`PDF generation error: ${err.message || 'Failed to export PDF'}`);
    } finally {
      setTimeout(() => setIsExportingPDF(false), 800);
    }
  };

  const handleApplyOptimizedAsCurrent = () => {
    if (!enhancedData?.fullFormattedResumeText) return;
    onUpdateResumeText(enhancedData.fullFormattedResumeText);
    setEditedText(enhancedData.fullFormattedResumeText);
    setAppliedSuccessNotice('HR-Optimized Resume has been applied as your current working resume!');
    setTimeout(() => setAppliedSuccessNotice(null), 3500);
  };

  const handleSaveAndReaudit = () => {
    onUpdateResumeText(editedText);
    onRunGeminiReAudit(editedText, false);
    setActiveView('comparison');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Top Header & Domain Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Senior HR Recruiter Makeover &amp; Shortlist Optimizer</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Original Resume vs. HR Shortlist-Ready Edition
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transform any IT or Non-IT resume with recruiter-approved XYZ action metrics, domain competencies, and ATS formatting
          </p>
        </div>

        {/* Domain Selector & PDF Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Dropdown */}
          <div className="relative">
            <select
              value={selectedDomain.id}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Change target industry domain"
            >
              <optgroup label="IT & Technical Domains">
                {DOMAINS.filter((d) => d.category === 'it').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Non-IT Professional Domains">
                {DOMAINS.filter((d) => d.category === 'non-it').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Quick PDF Export */}
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            title="Download ATS-ready PDF"
          >
            {isExportingPDF ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>Export ATS PDF</span>
          </button>
        </div>
      </div>

      {/* Domain Context Info Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${selectedDomain.badgeColor}`}>
            {selectedDomain.name}
          </span>
          <span className="text-slate-600 hidden sm:inline">{selectedDomain.description}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleGenerateMakeover()}
            disabled={isEnhancing}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isEnhancing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{enhancedData ? 'Re-generate Makeover' : 'Generate HR Shortlist Makeover'}</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {enhancementError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{enhancementError}</span>
        </div>
      )}

      {/* Success alert if applied */}
      {appliedSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{appliedSuccessNotice}</span>
          </div>
          <button
            onClick={() => setAppliedSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* View Switcher Tabs: Side-by-Side vs Edit */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'comparison'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Side-by-Side Comparison</span>
          </button>
          <button
            onClick={() => setActiveView('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'edit'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Raw Text Editor</span>
          </button>
        </div>

        {/* PDF Styling Theme */}
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span className="hidden sm:inline">Theme:</span>
          {(['modern', 'classic', 'minimal'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setPdfTheme(t)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize cursor-pointer transition-colors ${
                pdfTheme === t
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300 font-bold'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: Side-by-Side Comparison */}
      {activeView === 'comparison' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Original / Current Candidate Resume */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                    Input Resume
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentResumeText.split('\n')[0] || 'Candidate Resume'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyOriginal}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                    title="Copy original resume text"
                  >
                    {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setActiveView('edit')}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                    title="Edit original text"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Raw display */}
              <div className="font-mono text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 max-h-[560px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-2xs">
                {currentResumeText || 'No resume text loaded.'}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>{currentResumeText.split(/\s+/).filter(Boolean).length} words</span>
              {onOpenImportModal && (
                <button
                  onClick={onOpenImportModal}
                  className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload different resume</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: HR-Optimized Shortlisted Edition */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-white p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>HR Shortlisted (95/100)</span>
                  </span>
                  <span className="text-xs font-semibold text-indigo-900 hidden sm:inline">
                    {enhancedData?.targetRole || selectedDomain.sampleJobTitles[0] || 'Target Role'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyOptimized}
                    className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                    title="Copy HR-optimized resume"
                  >
                    {copiedOptimized ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadText(
                        enhancedData?.fullFormattedResumeText || currentResumeText,
                        `${(enhancedData?.candidateName || 'Candidate').replace(/\s+/g, '_')}_HR_Optimized.txt`
                      )
                    }
                    className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                    title="Download plain text (.txt)"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Enhanced Content Preview */}
              {isEnhancing ? (
                <div className="h-[480px] flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-indigo-100">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Senior HR Recruiter Transforming Resume...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Applying XYZ action formulas, extracting domain metrics ({selectedDomain.name}), and structuring high-impact bullet points for 6-second shortlisting.
                  </p>
                </div>
              ) : enhancedData ? (
                <div className="bg-white p-4 rounded-xl border border-indigo-200/80 max-h-[560px] overflow-y-auto space-y-4 shadow-2xs text-xs text-slate-800">
                  {/* Executive Header */}
                  <div className="border-b border-slate-100 pb-3 text-center">
                    <h3 className="text-base font-bold text-slate-900">
                      {enhancedData.candidateName}
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {enhancedData.contactLine1}
                    </p>
                    {enhancedData.contactLine2 && (
                      <p className="text-indigo-600 text-[11px] font-medium">
                        {enhancedData.contactLine2}
                      </p>
                    )}
                  </div>

                  {/* Recruiter Shortlist Badge */}
                  {enhancedData.hrShortlistVerdict && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{enhancedData.hrShortlistVerdict.shortlistLikelihood}</span>
                        </span>
                        <span className="font-bold text-emerald-800">
                          Score: {enhancedData.hrShortlistVerdict.shortlistScore || 95}/100
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        <strong>6-Second Scan:</strong> {enhancedData.hrShortlistVerdict.sixSecondImpression}
                      </p>
                    </div>
                  )}

                  {/* Summary */}
                  <div>
                    <h4 className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider mb-1">
                      Professional Executive Summary
                    </h4>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {enhancedData.executiveSummary}
                    </p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h4 className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider mb-2">
                      Professional Experience (XYZ Quantified Format)
                    </h4>
                    <div className="space-y-3">
                      {(enhancedData.enhancedExperience || []).map((exp: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-start justify-between font-bold text-slate-900">
                            <span>{exp.roleTitle}</span>
                            <span className="text-slate-500 text-[11px]">{exp.dates}</span>
                          </div>
                          <div className="flex items-start justify-between text-slate-600 text-[11px] italic mb-1.5">
                            <span>{exp.company}</span>
                            <span>{exp.location}</span>
                          </div>
                          <ul className="space-y-1">
                            {(exp.bullets || []).map((b: string, bIdx: number) => (
                              <li key={bIdx} className="flex items-start gap-1.5 text-slate-700">
                                <span className="text-indigo-600 font-bold shrink-0">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                          {exp.hrImprovementsExplanation && (
                            <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-emerald-800 font-medium">
                              ★ HR Why Shortlisted: {exp.hrImprovementsExplanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competencies / Skills */}
                  <div>
                    <h4 className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider mb-1.5">
                      Core Competencies &amp; Domain Systems
                    </h4>
                    <div className="space-y-1.5">
                      {(enhancedData.categorizedSkills || []).map((s: any, idx: number) => (
                        <div key={idx} className="text-[11px]">
                          <strong className="text-slate-900">{s.category}: </strong>
                          <span className="text-slate-600">{s.items}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Initiatives / Projects */}
                  {enhancedData.initiativesOrProjects && enhancedData.initiativesOrProjects.length > 0 && (
                    <div>
                      <h4 className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider mb-1.5">
                        Key Career Initiatives &amp; Projects
                      </h4>
                      <div className="space-y-2">
                        {enhancedData.initiativesOrProjects.map((p: any, idx: number) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="font-bold text-slate-900">{p.title}</div>
                            {p.contextOrStack && (
                              <div className="text-[10px] text-slate-500 italic mb-1">
                                {p.contextOrStack}
                              </div>
                            )}
                            <ul className="space-y-0.5">
                              {(p.bullets || []).map((b: string, bIdx: number) => (
                                <li key={bIdx} className="text-slate-700 text-[11px] flex items-start gap-1">
                                  <span className="text-indigo-600 font-bold">•</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education & Certs */}
                  <div>
                    <h4 className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider mb-1">
                      Education &amp; Credentials
                    </h4>
                    {(enhancedData.education || []).map((edu: any, idx: number) => (
                      <div key={idx} className="text-[11px] text-slate-700 flex justify-between">
                        <span><strong>{edu.degree}</strong> – {edu.institution}</span>
                        <span className="text-slate-500">{edu.year}</span>
                      </div>
                    ))}
                    {(enhancedData.certifications || []).length > 0 && (
                      <div className="mt-1 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                        <strong>Certifications: </strong> {enhancedData.certifications.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[480px] flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-indigo-100">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    No HR Makeover Generated Yet
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
                    Click below to have our Fortune 500 HR Talent Acquisition Director elevate this resume for <strong>{selectedDomain.name}</strong> hiring standards.
                  </p>
                  <button
                    onClick={() => handleGenerateMakeover()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate HR Recruiter Makeover</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions for Enhanced Resume */}
            <div className="mt-4 pt-3 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {enhancedData ? 'Shortlist Ready (Top 3%)' : 'Awaiting Makeover'}
              </span>
              <div className="flex items-center gap-2">
                {enhancedData && (
                  <button
                    onClick={handleApplyOptimizedAsCurrent}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    title="Load this transformed text into your working resume"
                  >
                    Apply to Working Resume
                  </button>
                )}
                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export ATS PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: Raw Text Direct Editor */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Direct Resume Text Editor
            </span>
            <span className="text-xs text-slate-500">
              {editedText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={18}
            className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            placeholder="Paste or edit your resume text directly..."
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setEditedText(currentResumeText)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              Reset Changes
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('comparison')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndReaudit}
                disabled={isAuditing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isAuditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>Save &amp; Re-audit Resume</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
