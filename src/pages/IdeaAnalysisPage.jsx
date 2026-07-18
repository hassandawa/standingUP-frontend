import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, RefreshCw, Users, Target, Shield, TrendingUp, Lightbulb, Code, DollarSign, AlertTriangle, BarChart3, UserCheck, FileText, Share2, Send, MessageCircle, Copy, CheckCheck, Mic, Square, Mail, Shuffle } from 'lucide-react';
import { AppNav } from '../components/PageShell.jsx';
import { readValue, saveValue } from '../services/storage.js';
import { analyzeIdea, analyzeIdeaStream, chatAboutIdeaStream, shareAnalysis, estimateMarketSize, runDebate, sendEmailReport, saveBuildProgress, loadBuildProgress, saveAnalysisProgress, createSavedIdea } from '../services/api.js';

function ScoreBar({ label, value, icon: Icon }) {
  const pct = Math.max(0, Math.min(100, Number(value || 0) * 10));
  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="h-4 w-4 text-[#0A0A0A]" />}
        <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 border-2 border-[#0A0A0A] bg-[#F5F3EE]">
          <div className="h-full bg-[#0A0A0A]" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-lg font-black leading-none">{Number(value || 0).toFixed(1)}</span>
      </div>
    </div>
  );
}

function ListBlock({ title, items, icon: Icon }) {
  if (!items?.length) return null;
  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-4 w-4 text-[#0A0A0A]" />}
        <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-sm text-[#3A3A3A]">
            <Check className="h-4 w-4 text-[#0A0A0A] shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TextBlock({ title, text, icon: Icon }) {
  if (!text) return null;
  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="h-4 w-4 text-[#0A0A0A]" />}
        <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
      </div>
      <p className="text-sm font-medium text-[#3A3A3A] leading-relaxed">{text}</p>
    </div>
  );
}

function CompetitorCard({ competitor }) {
  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-5">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-black uppercase tracking-tight">{competitor.name}</h4>
        <span className="text-[8px] font-black uppercase tracking-widest border border-[#0A0A0A] px-1.5 py-0.5">{competitor.source}</span>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Strengths</p>
          <ul className="space-y-1">
            {competitor.strengths?.map((s, i) => (
              <li key={i} className="text-xs text-[#3A3A3A] flex gap-2">
                <span className="text-[#0A0A0A] font-black">+</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Weaknesses</p>
          <ul className="space-y-1">
            {competitor.weaknesses?.map((w, i) => (
              <li key={i} className="text-xs text-[#3A3A3A] flex gap-2">
                <span className="text-[#0A0A0A] font-black">-</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function BuildPlanDay({ day }) {
  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[9px] font-black border-2 border-[#0A0A0A] px-2 py-1 leading-none">D{day.day}</span>
        <h4 className="text-xs font-black uppercase tracking-tight">{day.title}</h4>
      </div>
      <ul className="space-y-1.5">
        {day.tasks?.map((task, i) => (
          <li key={i} className="text-[11px] font-medium text-[#3A3A3A] flex gap-2">
            <span className="text-[#6A6A6A]">&rarr;</span> {task}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MarketSizeSection({ ideaForm }) {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEstimate() {
    setLoading(true);
    setError('');
    setMarketData(null);
    try {
      const data = await estimateMarketSize({
        startup_idea: ideaForm?.startup_idea || '',
        industry: ideaForm?.industry || '',
        target_audience: ideaForm?.target_audience || '',
      });
      setMarketData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <h3 className="text-xs font-black uppercase tracking-widest">Market Size Estimator</h3>
        </div>
        <button type="button" onClick={handleEstimate} disabled={loading}
          className="h-9 px-4 border-2 border-[#0A0A0A] text-[10px] font-black uppercase tracking-widest hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
          {loading ? 'Estimating...' : 'Estimate Market'}
        </button>
      </div>
      {error && <p className="text-[10px] font-black text-[#0A0A0A] mb-3">{error}</p>}
      {marketData && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">TAM</p>
              <p className="text-sm font-bold mt-1">{marketData.tam}</p>
            </div>
            <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">SAM</p>
              <p className="text-sm font-bold mt-1">{marketData.sam}</p>
            </div>
            <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">SOM</p>
              <p className="text-sm font-bold mt-1">{marketData.som}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="border-2 border-[#0A0A0A] p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Growth Rate</p>
              <p className="text-sm font-medium mt-1">{marketData.growth_rate}</p>
            </div>
            <div className="border-2 border-[#0A0A0A] p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Revenue Projection</p>
              <p className="text-sm font-medium mt-1">{marketData.revenue_projection}</p>
            </div>
          </div>
          {marketData.key_trends?.length > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Key Trends</p>
              <div className="flex flex-wrap gap-2">
                {marketData.key_trends.map((t, i) => (
                  <span key={i} className="border-2 border-[#0A0A0A] px-3 py-1 text-[10px] font-bold uppercase tracking-wide">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] px-4 py-2 flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Confidence:</span>
            <span className="text-xs font-bold uppercase">{marketData.data_confidence}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function DebateSection({ ideaForm }) {
  const [debateData, setDebateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDebate() {
    setLoading(true);
    setError('');
    setDebateData(null);
    try {
      const data = await runDebate({
        startup_idea: ideaForm?.startup_idea || '',
        industry: ideaForm?.industry || '',
        target_audience: ideaForm?.target_audience || '',
      });
      setDebateData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <h3 className="text-xs font-black uppercase tracking-widest">Multi-Agent Debate Room</h3>
        </div>
        <button type="button" onClick={handleDebate} disabled={loading}
          className="h-9 px-4 border-2 border-[#0A0A0A] text-[10px] font-black uppercase tracking-widest hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
          {loading ? 'Debating...' : 'Start Debate'}
        </button>
      </div>
      {error && <p className="text-[10px] font-black text-[#0A0A0A] mb-3">{error}</p>}
      {debateData && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {debateData.agents?.map((agent, i) => (
              <div key={i} className="border-2 border-[#0A0A0A] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{agent.emoji}</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{agent.agent_name}</p>
                    <p className="text-[9px] font-medium text-[#6A6A6A] uppercase tracking-widest">{agent.role}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#3A3A3A] leading-relaxed">{agent.argument}</p>
              </div>
            ))}
          </div>
          <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#C0BDB6] mb-2">Consensus</p>
            <p className="text-sm font-medium leading-relaxed">{debateData.consensus}</p>
          </div>
          {debateData.key_takeaways?.length > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Key Takeaways</p>
              <ul className="space-y-1">
                {debateData.key_takeaways.map((t, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[#3A3A3A]"><Check className="h-4 w-4 shrink-0 mt-0.5" />{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressTracker({ analysis }) {
  const token = readValue('progressToken');
  const ideaForm = readValue('ideaForm');
  const progressKey = token || (ideaForm?.startup_idea || '').substring(0, 40).replace(/\s+/g, '-').toLowerCase();
  const [progress, setProgress] = useState(() => {
    const saved = readValue('buildProgress');
    return saved || {};
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) {
      loadBuildProgress(token).then((data) => {
        if (data?.days && Object.keys(data.days).length > 0) {
          setProgress(data.days);
        }
      }).catch(() => {});
    }
  }, [token]);

  function toggleTask(dayIndex, taskIndex) {
    const dayKey = String(dayIndex);
    const current = progress[dayKey]?.completed_tasks || [];
    const task = analysis?.seven_day_build_plan?.[dayIndex - 1]?.tasks?.[taskIndex];
    if (!task) return;
    const updated = current.includes(task) ? current.filter((t) => t !== task) : [...current, task];
    const newProgress = { ...progress, [dayKey]: { completed_tasks: updated, notes: progress[dayKey]?.notes || '', updated_at: new Date().toISOString() } };
    setProgress(newProgress);
    saveValue('buildProgress', newProgress);
  }

  async function handleSave() {
    setSaving(true);
    try {
      for (const dayKey of Object.keys(progress)) {
        const day = progress[dayKey];
        await saveBuildProgress(progressKey, parseInt(dayKey), day.completed_tasks || [], day.notes || '');
      }
      saveValue('progressToken', progressKey);
    } catch { /* ignore */ }
    setSaving(false);
  }

  if (!analysis?.seven_day_build_plan?.length) return null;

  const totalTasks = analysis.seven_day_build_plan.reduce((sum, d) => sum + (d.tasks?.length || 0), 0);
  const completedCount = Object.values(progress).reduce((sum, d) => sum + (d.completed_tasks?.length || 0), 0);
  const pct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <h3 className="text-xs font-black uppercase tracking-widest">Build Progress</h3>
        </div>
        <button type="button" onClick={handleSave} disabled={saving}
          className="h-9 px-4 border-2 border-[#0A0A0A] text-[10px] font-black uppercase tracking-widest hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Progress'}
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-3 border-2 border-[#0A0A0A] bg-[#F5F3EE]">
          <div className="h-full bg-[#0A0A0A] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-black">{completedCount}/{totalTasks} ({pct}%)</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {analysis.seven_day_build_plan.map((day) => {
          const dayKey = String(day.day);
          const dayProgress = progress[dayKey]?.completed_tasks || [];
          const allDone = day.tasks?.length > 0 && day.tasks.every((t) => dayProgress.includes(t));
          return (
            <div key={day.day} className={`border-2 border-[#0A0A0A] p-3 ${allDone ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white'}`}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2">Day {day.day}: {day.title}</p>
              {day.tasks?.map((task, ti) => {
                const checked = dayProgress.includes(task);
                return (
                  <label key={ti} className="flex items-start gap-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={checked} onChange={() => toggleTask(day.day, ti)}
                      className="mt-0.5 border-2 border-[#0A0A0A] accent-[#0A0A0A]" />
                    <span className={`text-[10px] font-medium ${checked ? 'line-through opacity-60' : ''}`}>{task}</span>
                  </label>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return (
    <button type="button" onClick={listening ? stopListening : startListening}
      className={`h-10 w-10 border-2 border-[#0A0A0A] flex items-center justify-center transition-colors ${listening ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F5F3EE]'}`}
      title={listening ? 'Stop listening' : 'Voice input'}>
      {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}

function LoadingSkeleton({ streamText }) {
  return (
    <div className="space-y-6">
      <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] p-6 mb-6">
        <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-3">AI is analyzing your idea...</p>
        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
          {streamText || ''}
          <span className="inline-block w-2 h-4 bg-[#F5F3EE] ml-0.5 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-2 border-[#0A0A0A] bg-white p-4">
            <div className="h-2.5 bg-[#E8E6E0] mb-3" />
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-[#E8E6E0]" />
              <div className="h-5 w-8 bg-[#E8E6E0]" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-2 border-[#0A0A0A] bg-white p-5">
            <div className="h-3 bg-[#E8E6E0] w-1/3 mb-4" />
            <div className="h-2.5 bg-[#E8E6E0] w-full mb-2" />
            <div className="h-2.5 bg-[#E8E6E0] w-3/4 mb-2" />
            <div className="h-2.5 bg-[#E8E6E0] w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPanel({ analysis }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    const msgId = Date.now();
    setMessages((prev) => [...prev, { role: 'assistant', content: '', id: msgId }]);
    let accumulated = '';
    chatAboutIdeaStream(analysis, question,
      (token) => {
        accumulated += token;
        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, content: accumulated } : m));
      },
      (answer) => {
        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, content: answer } : m));
        setLoading(false);
      },
      (err) => {
        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, content: `Error: ${err}` } : m));
        setLoading(false);
      },
    );
  }

  return (
    <div className="border-2 border-[#0A0A0A] bg-white mt-10">
      <div className="border-b-2 border-[#0A0A0A] p-4 flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        <h3 className="text-xs font-black uppercase tracking-widest">Ask About This Idea</h3>
      </div>
      <div className="p-4 max-h-80 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <p className="text-xs font-medium text-[#C0BDB6] text-center py-4">Ask a follow-up question about this idea analysis.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`max-w-[80%] p-3 border-2 border-[#0A0A0A] text-sm ${msg.role === 'user' ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-[#F5F3EE] text-[#0A0A0A]'}`}>
              {msg.content || <span className="inline-block w-2 h-4 bg-[#0A0A0A] animate-pulse" />}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="border-t-2 border-[#0A0A0A] p-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          disabled={loading}
          className="flex-1 border-2 border-[#0A0A0A] bg-[#F5F3EE] px-4 py-2.5 text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none disabled:opacity-50"
        />
        <VoiceInput onResult={(text) => setInput((prev) => prev + text)} />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="h-10 w-10 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] flex items-center justify-center hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function IdeaAnalysisPage() {
  const navigate = useNavigate();
  const cached = readValue('ideaAnalysis');
  const ideaForm = readValue('ideaForm');
  const [result, setResult] = useState(cached);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [emailAddr, setEmailAddr] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [voiceInputIdea, setVoiceInputIdea] = useState('');
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [savingIdea, setSavingIdea] = useState(false);
  const [ideaSaved, setIdeaSaved] = useState(false);

  async function handleSaveProgress() {
    if (!result) return;
    setSavingProgress(true);
    setProgressSaved(false);
    try {
      await saveAnalysisProgress(result, ideaForm || {});
      setProgressSaved(true);
      setTimeout(() => setProgressSaved(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProgress(false);
    }
  }

  async function handleSaveToIdeas() {
    if (!result) return;
    setSavingIdea(true);
    setIdeaSaved(false);
    try {
      const title = result.startup_name || result.refined_idea || ideaForm?.startup_idea || 'Untitled Idea';
      const description = result.pitch || result.problem || '';
      await createSavedIdea({
        title,
        description,
        idea_data: {
          startup_name: result.startup_name || '',
          pitch: result.pitch || '',
          problem: result.problem || '',
          solution: result.solution || '',
          target_users: result.target_users || [],
          ...result,
        },
        analysis: result,
        plan: {},
        profile: readValue('profile') || {},
      });
      setIdeaSaved(true);
      setTimeout(() => setIdeaSaved(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingIdea(false);
    }
  }

  async function handleGenerate() {
    if (!ideaForm) return;
    setError('');
    setLoading(true);
    setStreamText('');
    setResult(null);
    setShareUrl('');

    analyzeIdeaStream(ideaForm,
      (token) => { setStreamText((prev) => prev + token); },
      (analysis) => {
        setResult(analysis);
        setLoading(false);
        setStreamText('');
        saveValue('ideaAnalysis', analysis);
      },
      (err) => {
        setError(err);
        setLoading(false);
        setStreamText('');
      },
    );
  }

  async function handleRegenerate() {
    if (!ideaForm) return;
    await handleGenerate();
  }

  async function handleShare() {
    if (!result) return;
    try {
      const res = await shareAnalysis(result, ideaForm || {});
      setShareUrl(res.url);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCopyShare() {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {
        // fallback
      }
    }
  }

  if (!result && !loading) {
    return (
      <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
        <AppNav />
        <section className="pt-32 px-6 max-w-3xl mx-auto">
          <div className="border-2 border-[#0A0A0A] bg-white p-8">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-3">No Analysis</p>
            <h1 className="text-4xl font-black uppercase leading-none mb-4">Analyze an idea first.</h1>
            <Link to="/input" className="h-12 px-8 inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F5F3EE] border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] transition-colors">
              Start Analysis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="section-label mb-4">Idea Analysis</p>
              <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight">Idea<br />Intelligence.</h1>
            </div>
            <div className="flex gap-3 flex-wrap">
              {result && (
                <>
                  <button type="button" onClick={handleSaveProgress} disabled={savingProgress}
                    className="h-12 px-6 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
                    <BarChart3 className="h-4 w-4" /> {savingProgress ? 'Saving...' : 'Save Progress'}
                  </button>
                  <button type="button" onClick={handleSaveToIdeas} disabled={savingIdea}
                    className="h-12 px-6 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-transparent hover:text-[#0A0A0A] transition-colors disabled:opacity-50">
                    <Lightbulb className="h-4 w-4" /> {savingIdea ? 'Saving...' : 'Save to Ideas'}
                  </button>
                  <button type="button" onClick={() => setEmailModal(true)}
                    className="h-12 px-6 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                    <Mail className="h-4 w-4" /> Email
                  </button>
                  <Link to="/compare" className="h-12 px-6 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                    <Shuffle className="h-4 w-4" /> Compare
                  </Link>
                  <button type="button" onClick={handleShare}
                    className="h-12 px-6 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </>
              )}
              {progressSaved && (
                <div className="w-full border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Check className="h-4 w-4" /> Progress saved successfully.
                </div>
              )}
              {ideaSaved && (
                <div className="w-full border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Check className="h-4 w-4" /> Idea saved! Access it from any feature page.
                </div>
              )}
              <button type="button" onClick={handleRegenerate} disabled={loading}
                className="h-12 px-6 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
                <RefreshCw className="h-4 w-4" /> {loading ? 'Analyzing' : 'Re-analyze'}
              </button>
              <Link to="/input" className="h-12 px-6 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center justify-center hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">New Idea</Link>
            </div>
          </div>

          {loading && <LoadingSkeleton streamText={streamText} />}

          {shareUrl && (
            <div className="border-2 border-[#0A0A0A] bg-white p-4 mb-6 flex items-center gap-3">
              <Share2 className="h-4 w-4 shrink-0" />
              <input readOnly value={shareUrl} className="flex-1 bg-[#F5F3EE] px-3 py-2 text-xs font-medium border-2 border-[#0A0A0A]" />
              <button onClick={handleCopyShare} className="h-9 px-4 border-2 border-[#0A0A0A] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                {shareCopied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {shareCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}

          {emailModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEmailModal(false)}>
              <div className="border-2 border-[#0A0A0A] bg-white w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-sm font-black uppercase tracking-widest mb-4">Email Report</h3>
                <input value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} placeholder="your@email.com"
                  className="w-full border-2 border-[#0A0A0A] bg-[#F5F3EE] px-4 py-3 text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none mb-4" />
                <div className="flex gap-3">
                  <button type="button" onClick={async () => {
                    if (!emailAddr.trim()) return;
                    setEmailSending(true);
                    setEmailStatus('');
                    try {
                      const res = await sendEmailReport(result, emailAddr.trim(), ideaForm || {});
                      setEmailStatus(res.sent ? 'Email sent!' : `Not sent: ${res.message}`);
                    } catch (err) { setEmailStatus(err.message); }
                    setEmailSending(false);
                  }} disabled={emailSending || !emailAddr.trim()}
                    className="h-10 px-6 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50">
                    {emailSending ? 'Sending...' : 'Send'}
                  </button>
                  <button type="button" onClick={() => setEmailModal(false)}
                    className="h-10 px-6 border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">Cancel</button>
                </div>
                {emailStatus && <p className="text-[10px] font-black mt-3">{emailStatus}</p>}
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="border-2 border-[#0A0A0A] bg-white p-6 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-[#0A0A0A]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Refined Idea</span>
                  </div>
                  <p className="text-lg font-bold leading-snug">{result.refined_idea}</p>
                </div>
                <div className="border-2 border-[#0A0A0A] bg-white p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-[#0A0A0A]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Problem Statement</span>
                  </div>
                  <p className="text-base font-medium text-[#3A3A3A] leading-relaxed">{result.problem_statement}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                <ScoreBar label="Market Demand" value={result.market_demand_score} icon={TrendingUp} />
                <ScoreBar label="Uniqueness" value={result.uniqueness_score} icon={Lightbulb} />
                <ScoreBar label="Feasibility" value={result.feasibility_score} icon={Code} />
                <ScoreBar label="Revenue Potential" value={result.revenue_potential_score} icon={DollarSign} />
                <ScoreBar label="Hackathon Score" value={result.hackathon_winning_score} icon={BarChart3} />
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <TextBlock title="Target Users" text={result.target_users?.join(', ')} icon={Users} />
                <TextBlock title="Differentiation" text={result.differentiation_strategy} icon={Shield} />
                <TextBlock title="Monetization" text={result.monetization_model} icon={DollarSign} />
              </div>

              {result.competitors?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Competitor Analysis ({result.competitors.length})
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.competitors.map((comp, i) => (
                      <CompetitorCard key={`${comp.name}-${i}`} competitor={comp} />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <ListBlock title="MVP Features" items={result.mvp_features} icon={Target} />
                <ListBlock title="Tech Stack" items={result.tech_stack_recommendation} icon={Code} />
                <ListBlock title="Risks" items={result.risks} icon={AlertTriangle} />
                <ListBlock title="Improvement Suggestions" items={result.improvement_suggestions} icon={Lightbulb} />
              </div>

              {result.seven_day_build_plan?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> 7-Day MVP Build Plan
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {result.seven_day_build_plan.map((day) => (
                      <BuildPlanDay key={day.day} day={day} />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-2 border-[#0A0A0A] bg-white p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="h-4 w-4 text-[#0A0A0A]" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Founder Readiness</h3>
                  </div>
                  <p className="text-sm font-medium text-[#3A3A3A] leading-relaxed">{result.founder_readiness_check}</p>
                </div>
                <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Pitch Summary</h3>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{result.pitch_summary}</p>
                </div>
              </div>

              <MarketSizeSection ideaForm={ideaForm} />
              <DebateSection ideaForm={ideaForm} />
              <ProgressTracker analysis={result} />
              <ChatPanel analysis={result} />
            </>
          )}

          {error && (
            <div className="mt-8 border-2 border-[#0A0A0A] bg-white p-5">
              <p className="text-xs font-black uppercase tracking-wide">{error}</p>
              <button onClick={handleRegenerate} className="mt-4 h-10 px-4 border-2 border-[#0A0A0A] text-[10px] font-black uppercase tracking-widest hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                Try Again
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
