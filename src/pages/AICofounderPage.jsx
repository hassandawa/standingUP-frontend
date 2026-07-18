import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppNav, BrandLink } from '../components/PageShell.jsx';
import { Sparkles, Send, MessageCircle, User, Lightbulb, Code, DollarSign, Megaphone, ArrowRight, Rocket, Save, Trash2 } from 'lucide-react';
import { generateAICofounderChat, saveAICofounderChat, getAICofounderChatHistory, deleteAICofounderChat } from '../services/api.js';
import { getSession, readValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';

const ADVISORS = [
  {
    id: 'mentor',
    label: 'AI Mentor',
    icon: Sparkles,
    role: 'General Startup Guidance',
    desc: 'Get startup advice, next steps, validation tips, and strategic guidance from an experienced mentor.',
    color: 'border-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    id: 'product_manager',
    label: 'AI Product Manager',
    icon: Lightbulb,
    role: 'Product Strategy & Roadmap',
    desc: 'Define MVP features, prioritize your roadmap, create user stories, and refine product strategy.',
    color: 'border-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    id: 'marketing',
    label: 'AI Marketing Advisor',
    icon: Megaphone,
    role: 'Growth & Launch Strategy',
    desc: 'Plan your launch, acquire first users, build your brand, and execute growth campaigns.',
    color: 'border-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
  {
    id: 'technical',
    label: 'AI Technical Advisor',
    icon: Code,
    role: 'Tech Stack & Architecture',
    desc: 'Choose technologies, design architecture, plan databases, APIs, deployment, and scaling.',
    color: 'border-cyan-500',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
  },
  {
    id: 'investor',
    label: 'AI Investor Advisor',
    icon: DollarSign,
    role: 'Fundraising & Pitch Prep',
    desc: 'Prepare your pitch deck, refine financials, plan fundraising strategy, and get investor-ready.',
    color: 'border-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
];

function ChatMessage({ msg }) {
  return (
    <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-black ${msg.role === 'user' ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-[#F5F3EE] border-2 border-[#0A0A0A]'}`}>
        {msg.role === 'user' ? 'U' : 'AI'}
      </div>
      <div className={`max-w-[80%] p-4 border-2 border-[#0A0A0A] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#3A3A3A]'}`}>
        {msg.content || <span className="inline-block w-2 h-4 bg-[#3A3A3A] animate-pulse" />}
      </div>
    </div>
  );
}

function AdvisorPanel({ advisor, startupContext }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;
    setInput('');
    setError('');
    setSaved(false);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    const msgId = Date.now();
    setMessages((prev) => [...prev, { role: 'assistant', content: '', id: msgId }]);
    try {
      const result = await generateAICofounderChat(advisor.id, question, startupContext);
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, content: result.answer } : m));
    } catch (requestError) {
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, content: `Error: ${requestError.message}` } : m));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!messages.length || !getSession()?.token) return;
    setError('');
    try {
      await saveAICofounderChat(advisor.id, messages);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 border-2 border-[#0A0A0A] flex items-center justify-center ${advisor.bgColor}`}>
            <advisor.icon className={`h-5 w-5 ${advisor.textColor}`} />
          </div>
          <div>
            <p className="text-sm font-black uppercase">{advisor.label}</p>
            <p className="text-[9px] text-[#6A6A6A] uppercase tracking-widest font-black">{advisor.role}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && getSession()?.token && (
            <button onClick={handleSave} disabled={saved} className="h-8 px-3 border-2 border-[#0A0A0A] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
              <Save className="h-3 w-3" /> {saved ? 'Saved' : 'Save Chat'}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-[#6A6A6A] mb-5 leading-relaxed">{advisor.desc}</p>

      <div className="border-2 border-[#0A0A0A] bg-white">
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <advisor.icon className={`h-8 w-8 mb-3 ${advisor.textColor}`} />
              <p className="text-xs font-black uppercase tracking-widest text-[#6A6A6A]">Ask {advisor.label} a question</p>
              <p className="text-[10px] text-[#C0BDB6] mt-1 max-w-xs">Get advice specific to your startup idea, analysis, and business model.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>

        {error && <p className="px-4 pb-2 text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>}

        <div className="border-t-2 border-[#0A0A0A] p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${advisor.label} about your startup...`}
              disabled={loading}
              className="flex-1 border-2 border-[#0A0A0A] bg-[#F5F3EE] px-4 py-2.5 text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none disabled:opacity-50"
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="h-10 w-10 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] flex items-center justify-center hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50">
              {loading ? <span className="h-4 w-4 border-2 border-[#F5F3EE] border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AICofounderPage() {
  const { selectedIdea: savedIdea } = useIdea();
  const [activeAdvisor, setActiveAdvisor] = useState(ADVISORS[0].id);
  const profile = readValue('profile');
  const analysis = savedIdea?.analysis || readValue('ideaAnalysis');
  const selectedIdea = savedIdea?.idea_data || readValue('selectedIdea');
  const plan = readValue('plan');

  const startupContext = {
    startup_name: selectedIdea?.startup_name || '',
    pitch: selectedIdea?.pitch || '',
    problem: selectedIdea?.problem || '',
    solution: selectedIdea?.solution || '',
    target_users: selectedIdea?.target_users || [],
    industry: profile?.preferred_industry || '',
    business_model: plan?.revenue_model?.pricing_model || analysis?.monetization_model || '',
    mvp_features: plan?.mvp_features || selectedIdea?.mvp_features || [],
    competitors: plan?.competitors || selectedIdea?.competitors || [],
    market_demand: Number(analysis?.market_demand_score || 0),
    uniqueness: Number(analysis?.uniqueness_score || 0),
    feasibility: Number(analysis?.feasibility_score || 0),
    revenue_potential: Number(analysis?.revenue_potential_score || 0),
    risks: plan?.risks || analysis?.risks || [],
    monetization_model: analysis?.monetization_model || '',
  };

  const currentAdvisor = ADVISORS.find((a) => a.id === activeAdvisor) || ADVISORS[0];

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-2">AI Co-Founder Team</p>
              <h1 className="text-4xl font-black uppercase leading-none">Your Startup Advisors</h1>
            </div>
            <Link to="/results" className="h-10 px-4 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
              <ArrowRight className="h-4 w-4" /> Results
            </Link>
          </div>

          <IdeaSelector />

          {!selectedIdea && (
            <div className="border-2 border-[#0A0A0A] bg-white p-8 text-center">
              <Rocket className="h-8 w-8 mx-auto mb-3 text-[#C0BDB6]" />
              <p className="text-sm font-black uppercase mb-2">No Startup Selected</p>
              <p className="text-xs text-[#6A6A6A] mb-4">Generate and select a startup idea first to get personalized advisor advice.</p>
              <Link to="/results" className="h-10 px-6 inline-flex items-center bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] border-2 border-[#0A0A0A] transition-colors">
                Go to Results
              </Link>
            </div>
          )}

          {selectedIdea && (
            <div className="mb-6 border-2 border-[#0A0A0A] bg-white p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Context: {selectedIdea.startup_name}</p>
              <p className="text-xs text-[#3A3A3A]">{selectedIdea.pitch}</p>
            </div>
          )}

          {selectedIdea && (
            <>
              <div className="flex flex-wrap gap-1 border-2 border-[#0A0A0A] bg-white p-1 mb-8">
                {ADVISORS.map((advisor) => {
                  const Icon = advisor.icon;
                  const isActive = activeAdvisor === advisor.id;
                  return (
                    <button key={advisor.id} onClick={() => setActiveAdvisor(advisor.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-colors flex-1 justify-center ${isActive ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#0A0A0A] hover:bg-[#F5F3EE]'}`}>
                      <Icon className={`h-4 w-4 ${isActive ? 'text-[#F5F3EE]' : advisor.textColor}`} />
                      <span className="hidden sm:inline">{advisor.label}</span>
                    </button>
                  );
                })}
              </div>

              <AdvisorPanel key={activeAdvisor} advisor={currentAdvisor} startupContext={startupContext} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}