import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageSquare, Briefcase, Users, Loader2 } from 'lucide-react';
import { safeFetchJson } from '../utils/apiClient';
import { detectDomainFromResumeText } from '../data/domains';

interface InterviewCoachProps {
  resumeText: string;
}

export const InterviewCoach: React.FC<InterviewCoachProps> = ({ resumeText }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'hr-0': true,
    'domain-0': true
  });

  const domain = detectDomainFromResumeText(resumeText);

  // Domain-adaptive starter questions
  const [questionsData, setQuestionsData] = useState<any>(() => ({
    hrScreenQuestions: [
      {
        question: `Can you walk me through your key responsibilities and quantify your proudest achievements in ${domain.name}?`,
        whyTheyAskIt: 'Recruiters want to verify if your claimed numbers, timeline continuity, and scope match your actual hands-on involvement.',
        modelAnswerTip: `Use the STAR format: "In my recent role, I had full accountability for [scope]. A major milestone was when I [action], resulting in [quantified outcome like ${domain.keyShortlistMetrics[0] || 'metrics'}]."`
      },
      {
        question: 'Under Certifications and Credentials, how do you keep your domain knowledge up to date with changing industry standards?',
        whyTheyAskIt: 'Hiring managers screen for continuous learners who seek accredited certifications and follow regulatory/market best practices.',
        modelAnswerTip: 'Highlight rigorous professional development, accredited licenses, and practical case studies or project proofs.'
      },
      {
        question: 'Could you clarify your transition timeline between your career positions?',
        whyTheyAskIt: 'Recruiters check for dates, gaps, or overlapping roles to confirm baseline credibility before scheduling next rounds.',
        modelAnswerTip: 'Be transparent and confident: "I transitioned to [company] to expand my scope in [area], leading directly to [positive outcome]."'
      }
    ],
    technicalQuestions: [
      {
        question: `In your work within ${domain.name}, how do you approach complex problem-solving when faced with tight constraints or unexpected roadblocks?`,
        testedConcept: `Domain execution, analytical rigor, and adherence to ${domain.name} best practices.`,
        modelAnswerTip: 'Walk through your structured process: diagnosis of the issue, stakeholder communication, execution of corrective action, and monitoring measurable impact.'
      },
      {
        question: `What specific methodologies, tools, and systems do you rely on to maintain high quality and zero defects in your deliverables?`,
        testedConcept: `Hands-on tool proficiency, quality control, and compliance.`,
        modelAnswerTip: `Mention specific industry-standard tools and frameworks from your resume, demonstrating both tactical and strategic mastery.`
      }
    ],
    behavioralQuestions: [
      {
        question: 'Tell me about a time you had to align competing priorities between cross-functional teams under a tight deadline.',
        situationFocus: 'Stakeholder management, negotiation, composure, and on-time execution.',
        starAnswerGuide: 'Situation: Competing priorities with limited bandwidth. Task: Meet the milestone without compromising standards. Action: Built a transparent prioritization matrix and unified stakeholders. Result: Delivered on schedule with zero critical misses.'
      }
    ]
  }));

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRegenerate = async () => {
    if (!resumeText || resumeText.trim().length < 20 || isLoading) return;
    setIsLoading(true);
    try {
      const data = await safeFetchJson<any>('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText
        })
      });

      setQuestionsData(data);
    } catch (err: any) {
      alert(err.message || 'Failed to refresh interview questions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Executive Recruiter &amp; Hiring Committee Simulator</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Anticipated Recruiter &amp; Functional Interview Questions
          </h2>
          <p className="text-xs text-slate-500">
            Targeted questions hiring managers will ask based on your background in <strong>{domain.name}</strong>, with winning talking points
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-600" />}
          <span>{isLoading ? 'Generating Questions...' : 'Generate AI Questions for My Resume'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Section 1: HR Screening Questions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Users className="w-4 h-4" />
            </div>
            <span>HR Phone Screen Questions (Gatekeeper Round)</span>
          </div>

          <div className="space-y-3">
            {questionsData.hrScreenQuestions?.map((item: any, i: number) => {
              const id = `hr-${i}`;
              const isOpen = !!openItems[id];
              return (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <button
                    onClick={() => toggleItem(id)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-100/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-bold text-indigo-600 text-xs mt-0.5">Q{i + 1}.</span>
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">{item.question}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 bg-white border-t border-slate-200 text-xs space-y-2.5">
                      <div className="p-2.5 rounded-lg bg-amber-50 text-amber-900">
                        <strong className="block text-[11px] uppercase tracking-wider text-amber-800">
                          Why HR Asks This:
                        </strong>
                        <p className="mt-0.5">{item.whyTheyAskIt}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-950">
                        <strong className="block text-[11px] uppercase tracking-wider text-emerald-800">
                          Recommended Winning Talking Point:
                        </strong>
                        <p className="mt-0.5 leading-relaxed">{item.modelAnswerTip}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Domain & Technical Deep-Dive */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <Briefcase className="w-4 h-4" />
            </div>
            <span>Domain &amp; Competency Deep-Dive (Hiring Manager Round)</span>
          </div>

          <div className="space-y-3">
            {questionsData.technicalQuestions?.map((item: any, i: number) => {
              const id = `domain-${i}`;
              const isOpen = !!openItems[id];
              return (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <button
                    onClick={() => toggleItem(id)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-100/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-bold text-blue-600 text-xs mt-0.5">D{i + 1}.</span>
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">{item.question}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 bg-white border-t border-slate-200 text-xs space-y-2.5">
                      <div className="p-2.5 rounded-lg bg-blue-50 text-blue-900">
                        <strong className="block text-[11px] uppercase tracking-wider text-blue-800">
                          Tested Core Concept:
                        </strong>
                        <p className="mt-0.5">{item.testedConcept}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-950">
                        <strong className="block text-[11px] uppercase tracking-wider text-emerald-800">
                          Model Answer Strategy:
                        </strong>
                        <p className="mt-0.5 leading-relaxed">{item.modelAnswerTip}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Behavioral Questions */}
        {questionsData.behavioralQuestions && questionsData.behavioralQuestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Behavioral &amp; Situational Questions (STAR Method)</span>
            </div>

            <div className="space-y-3">
              {questionsData.behavioralQuestions.map((item: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                    {item.question}
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                    <strong className="text-purple-700 block text-[11px]">Recommended STAR Framework:</strong>
                    <p className="mt-1 leading-relaxed">{item.starAnswerGuide}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
