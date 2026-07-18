import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, DollarSign, Factory, X, Sparkles, Lightbulb, Wand2, Mic, Square } from 'lucide-react';
import Input from '../components/Input.jsx';
import { AppNav } from '../components/PageShell.jsx';
import { analyzeProfile, generateIdeas, analyzeIdea } from '../services/api.js';
import { clearGeneratedState, saveValue } from '../services/storage.js';

const skillsSteps = [
  { id: 1, title: 'Skills' },
  { id: 2, title: 'Context' },
  { id: 3, title: 'Goal' },
];

const skillSuggestions = [
  'Full-Stack Development', 'Backend Development', 'Frontend Development', 'Mobile Development',
  'AI/ML', 'NLP', 'Computer Vision', 'Data Science',
  'Blockchain', 'Cybersecurity', 'Cloud Computing', 'DevOps',
  'UI/UX Design', 'Product Design', 'Graphic Design', 'Video Editing',
  'Product Management', 'Marketing', 'Sales', 'Finance', 'Operations',
  'Content Writing', 'Copywriting', 'SEO', 'Research',
  'No-Code', 'Automation', 'Prompt Engineering',
];

const interestSuggestions = [
  'Education', 'SaaS', 'Productivity', 'FinTech', 'Health', 'Creator Tools',
  'Ecommerce', 'Climate', 'Gaming', 'Travel', 'Food', 'Fitness', 'Real Estate',
  'LegalTech', 'HRTech', 'EdTech', 'AI Tools', 'Developer Tools', 'Marketplaces',
  'Local Services', 'Remote Work', 'Mental Health', 'Personal Finance',
  'Logistics', 'Agriculture', 'Fashion', 'Music', 'Sports', 'Nonprofits', 'B2B',
];

const experienceOptions = [
  { value: 'Beginner', label: 'Beginner', desc: 'Learning the basics and building first projects.' },
  { value: 'Intermediate', label: 'Intermediate', desc: 'Can ship useful work with guidance.' },
  { value: 'Advanced', label: 'Advanced', desc: 'Comfortable building and leading execution.' },
  { value: 'Expert', label: 'Expert', desc: 'Deep domain skill and strong delivery history.' },
];

const goalOptions = [
  { value: 'Hackathon MVP', label: 'Hackathon MVP', desc: 'Fast concept, demo, and pitch.' },
  { value: 'Side project', label: 'Side Project', desc: 'Practical launch with low budget.' },
  { value: 'Startup validation', label: 'Startup Validation', desc: 'Test demand before building big.' },
  { value: 'Revenue-first business', label: 'Revenue First', desc: 'Prioritize paying customers early.' },
];

const starterProfiles = [
  {
    label: 'Full-Stack Builder',
    skills: ['Full-Stack Development', 'Cloud Computing', 'AI/ML'],
    interests: ['SaaS', 'Developer Tools', 'AI Tools'],
    preferred_industry: 'B2B SaaS',
    goal: 'Hackathon MVP',
  },
  {
    label: 'Growth Pro',
    skills: ['Marketing', 'Sales', 'Operations'],
    interests: ['Local Services', 'B2B', 'Creator Tools'],
    preferred_industry: 'B2B',
    goal: 'Revenue-first business',
  },
  {
    label: 'Design & Product',
    skills: ['UI/UX Design', 'Product Management', 'Frontend Development'],
    interests: ['SaaS', 'Marketplaces', 'EdTech'],
    preferred_industry: 'SaaS',
    goal: 'Startup validation',
  },
];

const sampleIdeas = [
  {
    label: 'Judge Quick Test',
    idea: 'An AI platform that helps students turn their skills into startup ideas, validates the market, analyzes competitors, and creates a 7-day MVP plan.',
    audience: 'College students and recent graduates',
    industry: 'EdTech',
  },
  {
    label: 'Local Business',
    idea: 'A mobile app that connects local service providers (plumbers, electricians, cleaners) with customers through instant booking, AI-powered quote estimation, and transparent reviews.',
    audience: 'Homeowners and renters aged 25-55',
    industry: 'Local Services',
  },
  {
    label: 'Creator Tool',
    idea: 'An AI-powered content repurposing platform that turns long-form videos into short clips, social posts, blog articles, and newsletters with one click.',
    audience: 'Content creators and social media managers',
    industry: 'Creator Economy',
  },
];

function ChipInput({ label, chips, setChips, suggestions, error }) {
  const [value, setValue] = useState('');

  function add(nextValue) {
    const clean = nextValue.trim();
    if (!clean || chips.some((chip) => chip.toLowerCase() === clean.toLowerCase())) return;
    setChips([...chips, clean]);
    setValue('');
  }

  function remove(index) {
    setChips(chips.filter((_, i) => i !== index));
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(value);
    }
    if (event.key === 'Backspace' && !value && chips.length) {
      remove(chips.length - 1);
    }
  }

  return (
    <div>
      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2 block">{label}</label>
      <div className={`border-2 border-[#0A0A0A] bg-white p-4 transition-colors ${error ? 'border-[#0A0A0A]' : ''}`}>
        <div className="flex flex-wrap gap-2 mb-3">
          {chips.map((chip, index) => (
            <span key={`${chip}-${index}`} className="inline-flex items-center gap-2 border-2 border-[#0A0A0A] bg-white px-2.5 py-1 text-xs font-bold text-[#0A0A0A]">
              {chip}
              <button type="button" onClick={() => remove(index)} className="text-[#C0BDB6] hover:text-[#0A0A0A] transition-colors" aria-label={`Remove ${chip}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => add(value)}
          placeholder="Type and press Enter"
          className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none"
        />
      </div>
      {error && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-[#0A0A0A] pl-2 mt-2">{error}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        {suggestions.filter((item) => !chips.includes(item)).slice(0, 18).map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => add(suggestion)}
            className="border-2 border-[#0A0A0A] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6A6A6A] hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
            + {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function VoiceInputIdea({ onResult }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      onResult(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };
  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };
  return (
    <button type="button" onClick={listening ? stopListening : startListening}
      className={`h-10 w-10 border-2 border-[#0A0A0A] flex items-center justify-center shrink-0 transition-colors ${listening ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F5F3EE]'}`}>
      {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}

export default function InputPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('skills');
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    skills: [],
    interests: [],
    experience_level: 'Intermediate',
    budget: '100',
    time_per_week: '10',
    preferred_industry: '',
    goal: '',
  });
  const [ideaForm, setIdeaForm] = useState({
    startup_idea: '',
    target_audience: '',
    industry: '',
    skills: '',
    budget_time_limit: '',
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: '' }));
  }

  function updateIdea(key, value) {
    setIdeaForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: '' }));
  }

  function applyStarter(profile) {
    setForm((current) => ({
      ...current,
      skills: profile.skills,
      interests: profile.interests,
      preferred_industry: profile.preferred_industry,
      goal: profile.goal,
    }));
    setFieldErrors({});
  }

  function applySampleIdea(sample) {
    setIdeaForm({
      startup_idea: sample.idea,
      target_audience: sample.audience,
      industry: sample.industry,
      skills: '',
      budget_time_limit: '',
    });
    setFieldErrors({});
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setStep(1);
    setDir(1);
    setError('');
    setFieldErrors({});
  }

  function validate(targetStep) {
    const nextErrors = {};
    if (mode === 'skills') {
      if (targetStep === 1) {
        if (!form.skills.length) nextErrors.skills = 'Add at least one skill.';
        if (!form.interests.length) nextErrors.interests = 'Add at least one interest.';
      }
      if (targetStep === 3 && !form.goal) nextErrors.goal = 'Choose one goal.';
    } else {
      if (!ideaForm.startup_idea.trim()) nextErrors.startup_idea = 'Describe your startup idea.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    setDir(1);
    setStep((current) => Math.min(3, current + 1));
  }

  function prev() {
    setDir(-1);
    setStep((current) => Math.max(1, current - 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (mode === 'skills') {
      if (step < 3) { next(); return; }
      if (!validate(3)) return;
      setLoading(true);
      clearGeneratedState();
      try {
        const [analysis, ideas] = await Promise.all([analyzeProfile(form), generateIdeas(form)]);
        saveValue('profile', form);
        saveValue('analysis', analysis);
        saveValue('ideas', ideas);
        navigate('/results');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (!validate()) return;
      setLoading(true);
      clearGeneratedState();
      try {
        const result = await analyzeIdea(ideaForm);
        saveValue('ideaAnalysis', result);
        saveValue('ideaForm', ideaForm);
        navigate('/analyze-idea');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="section-label mb-6">New Session</div>
          <h1 className="text-4xl font-black tracking-tight leading-none mb-3">Build Your<br />Startup Brief.</h1>
          <p className="text-sm font-medium text-[#3A3A3A] border-l-4 border-[#0A0A0A] pl-3 mb-8 max-w-xl">Choose your input mode below.</p>

          <div className="grid grid-cols-2 gap-0 border-2 border-[#0A0A0A] mb-10">
            <button type="button" onClick={() => switchMode('skills')}
              className={`py-4 text-xs font-black uppercase tracking-widest transition-colors border-r-2 border-[#0A0A0A] ${mode === 'skills' ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#0A0A0A]'}`}>
              Generate From Skills
            </button>
            <button type="button" onClick={() => switchMode('idea')}
              className={`py-4 text-xs font-black uppercase tracking-widest transition-colors ${mode === 'idea' ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#0A0A0A]'}`}>
              Analyze My Idea
            </button>
          </div>

          {mode === 'skills' && (
            <div className="grid md:grid-cols-3 gap-3 mb-10">
              {starterProfiles.map((profile) => (
                <button key={profile.label} type="button" onClick={() => applyStarter(profile)}
                  className="border-2 border-[#0A0A0A] bg-white p-4 text-left card-hover">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A] mb-2">{profile.label}</p>
                  <p className="text-xs font-medium text-[#3A3A3A]">{profile.skills.join(' / ')}</p>
                </button>
              ))}
            </div>
          )}

          {mode === 'idea' && (
            <div className="grid md:grid-cols-3 gap-3 mb-10">
              {sampleIdeas.map((sample) => (
                <button key={sample.label} type="button" onClick={() => applySampleIdea(sample)}
                  className="border-2 border-[#0A0A0A] bg-white p-4 text-left card-hover">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A] mb-2">{sample.label}</p>
                  <p className="text-xs font-medium text-[#3A3A3A] line-clamp-2">{sample.idea.substring(0, 70)}...</p>
                </button>
              ))}
            </div>
          )}

          {mode === 'skills' && (
            <div className="flex mb-10">
              {skillsSteps.map((item) => (
                <div key={item.id}
                  className={`flex-1 border-2 border-[#0A0A0A] py-3 px-4 text-[10px] font-black uppercase tracking-widest text-center transition-colors ${step === item.id ? 'bg-[#0A0A0A] text-[#F5F3EE]' : step > item.id ? 'bg-white text-[#0A0A0A]' : 'bg-white text-[#C0BDB6]'}`}>
                  {String(item.id).padStart(2, '0')} - {item.title}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-2 border-[#0A0A0A] bg-white p-6 sm:p-8">
            {mode === 'skills' ? (
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="skills" initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -24 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-xl font-black tracking-tight">Skills and interests</h2>
                    <p className="text-sm font-medium text-[#3A3A3A] border-l-4 border-[#0A0A0A] pl-3 mt-1 mb-8">Add the skills you can use and markets you care about.</p>
                    <div className="space-y-8">
                      <ChipInput label="Skills" chips={form.skills} setChips={(value) => update('skills', value)} suggestions={skillSuggestions} error={fieldErrors.skills} />
                      <ChipInput label="Interests" chips={form.interests} setChips={(value) => update('interests', value)} suggestions={interestSuggestions} error={fieldErrors.interests} />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="context" initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -24 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-xl font-black tracking-tight">Founder context</h2>
                    <p className="text-sm font-medium text-[#3A3A3A] border-l-4 border-[#0A0A0A] pl-3 mt-1 mb-8">Set constraints so the AI can generate realistic ideas.</p>
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                      {experienceOptions.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => update('experience_level', opt.value)}
                          className={`p-4 border-2 border-[#0A0A0A] text-left transition-colors w-full ${form.experience_level === opt.value ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#0A0A0A]'}`}>
                          <span className="text-sm font-bold uppercase tracking-tight">{opt.label}</span>
                          <span className={`block text-xs mt-1 ${form.experience_level === opt.value ? 'text-[#C0BDB6]' : 'text-[#6A6A6A]'}`}>{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Input label="Budget USD" icon={DollarSign} value={form.budget} onChange={(event) => update('budget', event.target.value)} placeholder="100" />
                      <Input label="Hours weekly" icon={Clock} value={form.time_per_week} onChange={(event) => update('time_per_week', event.target.value)} placeholder="10" />
                      <Input label="Industry" icon={Factory} value={form.preferred_industry} onChange={(event) => update('preferred_industry', event.target.value)} placeholder="EdTech" />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="goal" initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -24 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-xl font-black tracking-tight">Execution goal</h2>
                    <p className="text-sm font-medium text-[#3A3A3A] border-l-4 border-[#0A0A0A] pl-3 mt-1 mb-8">Choose the output style you want from the AI pipeline.</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {goalOptions.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => update('goal', opt.value)}
                          className={`p-5 border-2 border-[#0A0A0A] text-left transition-colors w-full ${form.goal === opt.value ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#0A0A0A]'}`}>
                          <p className="text-sm font-bold uppercase tracking-tight">{opt.label}</p>
                          {opt.desc && <p className={`text-xs mt-1 ${form.goal === opt.value ? 'text-[#C0BDB6]' : 'text-[#6A6A6A]'}`}>{opt.desc}</p>}
                        </button>
                      ))}
                    </div>
                    {fieldErrors.goal && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-[#0A0A0A] pl-2 mt-4">{fieldErrors.goal}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key="idea-form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-xl font-black tracking-tight">Describe your idea</h2>
                  <p className="text-sm font-medium text-[#3A3A3A] border-l-4 border-[#0A0A0A] pl-3 mt-1 mb-8">Fill in as much detail as you have. The AI handles the rest.</p>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2 block">Startup Idea *</label>
                      <div className={`border-2 border-[#0A0A0A] bg-white p-4 flex gap-3 ${fieldErrors.startup_idea ? 'border-[#0A0A0A]' : ''}`}>
                        <textarea
                          value={ideaForm.startup_idea}
                          onChange={(e) => updateIdea('startup_idea', e.target.value)}
                          placeholder="Describe your startup idea in detail..."
                          rows={4}
                          className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none resize-none"
                        />
                        <VoiceInputIdea onResult={(text) => updateIdea('startup_idea', ideaForm.startup_idea + ' ' + text)} />
                      </div>
                      {fieldErrors.startup_idea && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-[#0A0A0A] pl-2 mt-2">{fieldErrors.startup_idea}</p>}
                      <div className="flex gap-2 mt-3">
                        {sampleIdeas.map((s) => (
                          <button key={s.label} type="button" onClick={() => applySampleIdea(s)}
                            className="border-2 border-[#0A0A0A] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6A6A6A] hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                            <Wand2 className="h-3 w-3 inline-block mr-1" /> {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <Input label="Target Audience" icon={null} value={ideaForm.target_audience} onChange={(e) => updateIdea('target_audience', e.target.value)} placeholder="e.g. College students" />
                      <Input label="Industry" icon={Factory} value={ideaForm.industry} onChange={(e) => updateIdea('industry', e.target.value)} placeholder="e.g. EdTech" />
                      <Input label="Budget / Time" icon={DollarSign} value={ideaForm.budget_time_limit} onChange={(e) => updateIdea('budget_time_limit', e.target.value)} placeholder="e.g. $100, 10hrs/wk" />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2 block">Your Skills (optional)</label>
                      <div className="border-2 border-[#0A0A0A] bg-white p-4">
                        <input
                          value={ideaForm.skills}
                          onChange={(e) => updateIdea('skills', e.target.value)}
                          placeholder="Full-Stack Dev, AI/ML, Design, Marketing..."
                          className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {error && <p className="mt-8 text-xs font-black uppercase tracking-wide border-l-4 border-[#0A0A0A] pl-3">{error}</p>}

            {loading && (
              <div className="mt-8 border-2 border-[#0A0A0A] bg-[#F5F3EE] p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A] mb-3">
                  {mode === 'skills' ? 'Generation Pipeline' : 'Analyzing Your Idea'}
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {(mode === 'skills'
                    ? ['Analyzing founder fit', 'Scoring market angles', 'Drafting startup ideas']
                    : ['Understanding your idea', 'Analyzing competitors', 'Generating insights']
                  ).map((item, i) => (
                    <div key={item} className="border-2 border-[#0A0A0A] bg-white p-4">
                      <div className="h-1.5 bg-[#0A0A0A] mb-3" />
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#6A6A6A]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-8 mt-8 border-t-2 border-[#0A0A0A]">
              {mode === 'skills' && step > 1 && (
                <button type="button" onClick={prev}
                  className="h-12 px-6 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest text-[#0A0A0A] flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className={`h-12 px-8 border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50 ml-auto ${loading ? 'bg-[#C0BDB6] text-[#3A3A3A]' : 'bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A]'}`}>
                {loading ? 'Analyzing...' : mode === 'idea' ? <>Analyze Idea <Lightbulb className="h-4 w-4" /></> : step === 3 ? <>Generate My Startup <Sparkles className="h-4 w-4" /></> : <>Next Step <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
