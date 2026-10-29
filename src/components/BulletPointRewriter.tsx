import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight, Check, Copy, Tag, AlertCircle, Loader2, ChevronDown, Award } from 'lucide-react';
import { safeFetchJson } from '../utils/apiClient';
import { DOMAINS, getDomainById, DomainDefinition } from '../data/domains';

interface BulletRewriterProps {
  initialBullet?: string;
  initialContext?: string;
  initialDomainId?: string;
}

export const BulletPointRewriter: React.FC<BulletRewriterProps> = ({
  initialBullet = 'Closed new accounts and managed client relationships for enterprise software.',
  initialContext = 'Senior Sales Executive',
  initialDomainId = 'sales-bd'
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainDefinition>(() =>
    getDomainById(initialDomainId)
  );
  const [bulletText, setBulletText] = useState(initialBullet);
  const [context, setContext] = useState(initialContext);
  const [style, setStyle] = useState('xyz');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic sample presets reflecting both IT and Non-IT domains
  const domainPresets = [
    {
      domainId: 'sales-bd',
      domainLabel: 'Sales & BD',
      title: 'B2B Sales Deal Closing',
      bullet: 'Responsible for selling SaaS software to mid-market companies and doing demos.',
      context: 'Senior Account Executive at TechScale'
    },
    {
      domainId: 'healthcare-nursing',
      domainLabel: 'Healthcare',
      title: 'ICU Critical Care & Patient Safety',
      bullet: 'Administered medications and took care of intensive care patients on ventilators.',
      context: 'Staff Registered Nurse (ICU) at Metro Health'
    },
    {
      domainId: 'finance-accounting',
      domainLabel: 'Finance',
      title: 'FP&A Budgeting & Cost Reductions',
      bullet: 'Helped prepare monthly budgets and financial forecasts in Excel.',
      context: 'Senior Financial Analyst at Horizon Corp'
    },
    {
      domainId: 'it-software',
      domainLabel: 'IT & Software',
      title: 'Frontend Performance & Architecture',
      bullet: 'Built responsive client web applications and fixed UI bugs using React and Tailwind.',
      context: 'Frontend Software Developer'
    },
    {
      domainId: 'marketing-communications',
      domainLabel: 'Marketing',
      title: 'Paid Acquisition & ROAS',
      bullet: 'Ran Google Ads and social media campaigns to get more leads.',
      context: 'Growth Marketing Manager'
    },
    {
      domainId: 'hr-talent',
      domainLabel: 'HR & Talent',
      title: 'Recruiting Velocity & Retention',
      bullet: 'Recruited candidates for various open corporate roles and coordinated phone screens.',
      context: 'Talent Acquisition Partner'
    }
  ];

  const handleRewrite = async () => {
    if (!bulletText.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await safeFetchJson<any>('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText,
          context,
          domain: selectedDomain.name,
          style
        })
      });

      setResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error rewriting bullet point');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google XYZ Formula Recruiter Supercharger</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Resume Bullet Point Power-Up (All Domains)
          </h2>
          <p className="text-xs text-slate-500">
            Convert passive job duty descriptions into quantified, high-impact achievements: "Accomplished [X] as measured by [Y] by doing [Z]"
          </p>
        </div>

        {/* Domain Selector */}
        <div className="relative">
          <select
            value={selectedDomain.id}
            onChange={(e) => {
              const dom = getDomainById(e.target.value);
              setSelectedDomain(dom);
              if (dom.sampleBullet) {
                setBulletText(dom.sampleBullet.before);
                setContext(dom.sampleBullet.role);
              }
            }}
            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.category.toUpperCase()})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Preset selector pills */}
      <div>
        <span className="text-xs font-bold text-slate-700 block mb-2">
          Or try one of these quick cross-industry examples:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {domainPresets.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setBulletText(sample.bullet);
                setContext(sample.context);
                setSelectedDomain(getDomainById(sample.domainId));
              }}
              className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 bg-slate-50 transition-all text-xs cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 group-hover:text-indigo-700">
                  {sample.title}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                  {sample.domainLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                "{sample.bullet}"
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Original Resume Bullet Point
            </label>
            <textarea
              value={bulletText}
              onChange={(e) => setBulletText(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans"
              placeholder="e.g. Responsible for managing regional accounts and training new staff..."
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Role &amp; Context
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-slate-800"
                placeholder="e.g. Senior Account Executive"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Formula
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="xyz">Google XYZ Formula (Accomplished [X] by [Z] as measured by [Y])</option>
                <option value="star">STAR Achievement (Situation, Task, Action, Result)</option>
                <option value="executive">Executive Leadership &amp; Business Impact</option>
              </select>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleRewrite}
            disabled={isLoading || !bulletText.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating High-Impact Rewrites...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Supercharge Bullet Point</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-slate-200 animate-in fade-in duration-300">
          {/* Weaknesses identified in original */}
          {result.originalWeaknesses && result.originalWeaknesses.length > 0 && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Why HR / ATS Reject the Original Bullet</span>
              </h4>
              <ul className="space-y-1">
                {result.originalWeaknesses.map((w: string, idx: number) => (
                  <li key={idx} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3 Variations */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3 High-Powered Recruiter Shortlist Rewrites
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {result.rewrites?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/10 bg-white transition-all space-y-3 shadow-2xs relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.title}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed pt-1">
                        • {item.bullet}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy(item.bullet, idx)}
                      className="shrink-0 p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                      title="Copy bullet"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600">
                      <strong>HR Value Added:</strong> {item.keyImprovement}
                    </span>

                    {item.atsKeywordsAdded && item.atsKeywordsAdded.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {item.atsKeywordsAdded.map((k: string, kIdx: number) => (
                          <span
                            key={kIdx}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
