import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  RotateCcw,
  Copy,
  Check,
  Briefcase,
  ShieldAlert,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { safeFetchJson } from '../utils/apiClient';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinkingUsed?: boolean;
  modelUsed?: string;
  timestamp: string;
}

interface HRChatAdvisorProps {
  resumeContext: string;
}

import { detectDomainFromResumeText } from '../data/domains';

export const HRChatAdvisor: React.FC<HRChatAdvisorProps> = ({ resumeContext }) => {
  const detectedDomain = detectDomainFromResumeText(resumeContext);
  const candidateName = (
    resumeContext.split('\n').map((l) => l.trim()).find((l) => l.length > 0 && !l.startsWith('#')) || 'Candidate'
  ).split(' ')[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${candidateName}! I'm your Senior Talent Acquisition Partner & Executive HR Advisor for **${detectedDomain.name}**.

I've evaluated your resume through the lens of senior hiring directors and ATS screeners. Here are the most impactful topics we can work on:

1. **6-Second Recruiter Screen**: What hiring teams notice first and how to guarantee you pass the initial scan.
2. **Quantifying Accomplishments**: Transforming routine job duties into high-impact XYZ metrics (${detectedDomain.keyShortlistMetrics[0] || 'measurable outcomes'}).
3. **Domain Competencies & Keywords**: Aligning your terminology with modern ATS requirements for top-paying roles.
4. **Behavioral & Deep-Dive Interview Prep**: Crafting STAR stories and negotiating top-tier compensation.

How can I help you elevate your resume or prepare for upcoming interviews today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState<'recruiter' | 'director' | 'architect' | 'mentor'>('recruiter');
  const [enableThinking, setEnableThinking] = useState(false);
  const [modelSpeed, setModelSpeed] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    `What would make an HR recruiter shortlist my resume in 6 seconds?`,
    `How do I quantify my achievements using the Google XYZ formula?`,
    `What are the top 3 tough questions an interviewer will ask about my experience?`,
    `Can you rewrite my summary to make it punchy and recruiter-ready?`
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await safeFetchJson<any>('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content
          })),
          resumeContext,
          persona,
          enableThinking,
          model: modelSpeed
        })
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'I analyzed your question. Let me know if you would like me to rewrite or practice an answer.',
        thinkingUsed: data.thinkingUsed,
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error connecting to HR Intelligence Advisor: ${err.message || 'Please retry in a moment.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Conversation reset. I am ready to advise you as your ${
          persona === 'recruiter'
            ? 'Silicon Valley Tech Recruiter'
            : persona === 'director'
            ? 'Fortune 500 VP of Talent'
            : persona === 'architect'
            ? 'Principal Frontend Architect'
            : 'Senior Career Mentor'
        }. What would you like to discuss regarding your resume?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">HR Expert Advisor &amp; Interview Simulator</h3>
              {enableThinking && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> High Thinking Mode Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Interactive multi-turn career counsel grounded in your actual resume
            </p>
          </div>
        </div>

        {/* Persona & Thinking Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona Picker */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 pl-1">Role:</span>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="recruiter">Tech Recruiter (Direct &amp; Sharp)</option>
              <option value="director">Talent Director (Executive Strategy)</option>
              <option value="architect">Frontend Architect (Technical Vetting)</option>
              <option value="mentor">Career Mentor (Supportive &amp; Tactical)</option>
            </select>
          </div>

          {/* Thinking Mode Toggle */}
          <button
            onClick={() => setEnableThinking(!enableThinking)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              enableThinking
                ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Uses structured reasoning with high-velocity model"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Deep Reasoning</span>
            <span
              className={`text-[9px] uppercase px-1 py-0.2 rounded font-bold ${
                enableThinking ? 'bg-purple-800 text-purple-200' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {enableThinking ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Model Speed Option (when thinking not forced) */}
          {!enableThinking && (
            <select
              value={modelSpeed}
              onChange={(e) => setModelSpeed(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (High Speed)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Ultra Fast)</option>
            </select>
          )}

          <button
            onClick={resetChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-indigo-600 shadow-2xs'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`rounded-2xl p-4 text-xs leading-relaxed relative group ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-tl-xs'
              }`}
            >
              {/* Optional Thinking pill */}
              {msg.thinkingUsed && (
                <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  <Brain className="w-3 h-3" /> Deep HR Reasoning Applied
                </div>
              )}

              {/* Message text with formatting */}
              <div className="whitespace-pre-wrap font-normal break-words">
                {msg.content}
              </div>

              {/* Message Footer */}
              <div
                className={`mt-2 flex items-center justify-between gap-4 pt-1 border-t text-[10px] ${
                  msg.role === 'user'
                    ? 'border-indigo-500/40 text-indigo-200'
                    : 'border-slate-100 text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="hover:text-slate-700 transition-colors flex items-center gap-1"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 mr-auto max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 text-xs text-slate-600 shadow-2xs flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>
                {enableThinking
                  ? 'Consulting Gemini 3.1 Pro with High Thinking Level... Formulating recruitment strategy...'
                  : 'HR Expert is reviewing your query against your resume...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Suggested:
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors whitespace-nowrap shrink-0 border border-slate-200/80 disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask the ${
              persona === 'recruiter'
                ? 'Tech Recruiter'
                : persona === 'director'
                ? 'Talent Director'
                : persona === 'architect'
                ? 'Frontend Architect'
                : 'Career Mentor'
            } anything about your resume or interviews...`}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50 transition-all text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask HR</span>
          </button>
        </form>
      </div>
    </div>
  );
};
