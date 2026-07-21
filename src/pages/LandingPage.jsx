import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Code, Lightbulb, Play, Rocket, Search, Sparkles, Target, TrendingUp, Zap, Wand2 } from 'lucide-react';
import { AppNav, BrandLink } from '../components/PageShell.jsx';
import DemoVideoModal from '../components/DemoVideoModal.jsx';
import ContactModal from '../components/ContactModal.jsx';
import { analyzeProfile, generateIdeas } from '../services/api.js';
import { clearGeneratedState, saveValue } from '../services/storage.js';

const features = [
  { title: 'Founder Analysis', path: '/ai-cofounder', desc: 'Understand your strengths, gaps, and best startup categories.', icon: Brain },
  { title: 'Startup Ideas', path: '/input', desc: 'Generate structured ideas scored against opportunity and founder fit.', icon: Lightbulb },
  { title: 'Competitor Mapping', path: '/investor-tools', desc: 'See competitors, limitations, advantages, and market gaps.', icon: Search },
  { title: 'MVP Scope', path: '/development-hub', desc: 'Turn an idea into buildable v1 features and later v2 expansion.', icon: Target },
  { title: 'Revenue Models', path: '/financial-plan', desc: 'Get pricing, monetization methods, and first-customer strategy.', icon: TrendingUp },
  { title: 'Pitch Content', path: '/marketing-hub', desc: 'Create hackathon and thirty-second pitches for fast validation.', icon: Sparkles },
];

const sampleSkills = 'Full-Stack Development, AI/ML, UI/UX Design, Cloud Computing';

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [skills, setSkills] = useState('');

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [judgeMode, setJudgeMode] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showContact, setShowContact] = useState(false);

  async function handleGenerate(customProfile) {
    if (loading) return;
    setLoading(true);
    setError('');
    clearGeneratedState();
    const profile = customProfile || (skills.trim() ? {
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      interests: skills.split(',').map((s) => s.trim()).filter(Boolean),
      experience_level: 'Intermediate',
      budget: '100',
      time_per_week: '10',
      preferred_industry: '',
      goal: 'Hackathon MVP',
    } : null);
    if (!profile) { setError('Enter at least one skill.'); setLoading(false); return; }
    try {
      const [analysis, ideas] = await Promise.all([analyzeProfile(profile), generateIdeas(profile)]);
      saveValue('profile', profile);
      saveValue('analysis', analysis);
      saveValue('ideas', ideas);
      navigate('/results');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleJudgeQuickTest() {
    setJudgeMode(true);
    handleGenerate({
      skills: ['Full-Stack Development', 'AI/ML', 'UI/UX Design', 'Cloud Computing', 'Product Management'],
      interests: ['Education', 'SaaS', 'Productivity', 'AI Tools', 'EdTech'],
      experience_level: 'Intermediate',
      budget: '100',
      time_per_week: '10',
      preferred_industry: 'EdTech',
      goal: 'Hackathon MVP',
    });
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />

      <section className="pt-40 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="section-label mb-6">AI-Powered Startup Incubator</div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-[-0.03em] leading-[0.95] mb-6">
              Turn Your Skills<br />Into A Startup
            </h1>
            <p className="text-base md:text-lg font-medium text-[#3A3A3A] max-w-lg mx-auto mb-3 leading-relaxed">
              Every successful business begins with a strong foundation. startingUP helps entrepreneurs build that foundation before they invest their time, money, and effort.
            </p>
            <p className="text-sm font-medium text-[#6A6A6A] max-w-lg mx-auto mb-10 leading-relaxed">
              Enter your skills. Our AI generates personalized startup ideas, full MVP plans, competitor analysis, and pitch content in seconds.
            </p>

            <div className="max-w-2xl mx-auto mb-4">
              <div className="flex items-center gap-3 border-2 border-[#0A0A0A] bg-white p-2 pl-6 focus-within:bg-[#FAFAF8] transition-colors">
                <Code className="h-5 w-5 text-[#C0BDB6] shrink-0" />
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Enter your skills: e.g. Full-Stack Dev, AI/ML, Design, Marketing..."
                  className="flex-1 bg-transparent text-sm md:text-base font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none py-3"
                />
                <button onClick={() => handleGenerate()} disabled={loading}
                  className={`h-11 px-6 border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors shrink-0 ${loading ? 'bg-[#C0BDB6] text-[#3A3A3A]' : 'bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A]'}`}>
                  {loading ? (
                    <div className="flex items-center gap-2"><div className="h-3 w-3 border-2 border-[#F5F3EE]/40 border-t-[#F5F3EE] animate-spin" /> Generating</div>
                  ) : (
                    <><Zap className="h-4 w-4" /> Generate</>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button onClick={handleJudgeQuickTest} disabled={loading}
                className="inline-flex items-center gap-2 border-2 border-[#0A0A0A] px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                <Wand2 className="h-3.5 w-3.5" /> Quick Test
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 inline-flex flex-col items-center gap-2">
                <p className="text-xs font-black uppercase tracking-wide border-l-2 border-[#0A0A0A] pl-2 inline-block">
                  {error}
                </p>
                {error.toLowerCase().includes('upgrade') && (
                  <Link to="/pricing" className="text-xs font-black uppercase underline hover:no-underline">
                    View Plans →
                  </Link>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '04', label: 'Ideas per run' },
              { value: '10+', label: 'Scoring signals' },
              { value: '01', label: 'MVP roadmap' },
              { value: '02', label: 'Pitch formats' },
            ].map((item) => (
              <div key={item.label} className="border-2 border-[#0A0A0A] bg-white p-4">
                <p className="text-2xl font-black text-[#0A0A0A]">{item.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mt-1">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="border-y-2 border-[#0A0A0A] py-14">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] text-center mb-8">How It Works</p>
          <div className="flex items-center justify-center gap-0 flex-wrap">
            {[
              { label: 'Your Skills', icon: Code },
              { label: 'AI Analysis', icon: Brain },
              { label: 'Startup Ideas', icon: Lightbulb },
              { label: 'Launch Plan', icon: Rocket },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex items-center gap-3 px-6 py-4 border-2 border-[#0A0A0A] bg-white">
                  <step.icon className="h-4 w-4 text-[#0A0A0A]" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]">{step.label}</span>
                </div>
                {i < 3 && <ArrowRight className="h-4 w-4 text-[#6A6A6A] mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="section-label mb-4">Why This Matters</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.02em] leading-none mb-4">Built for students, by builders</h2>
            <p className="text-sm font-medium text-[#3A3A3A] leading-relaxed">startingUP bridges the gap between having skills and knowing what to build.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { title: 'For Students', desc: 'Turns academic skills into actionable startup concepts. No business experience needed.' },
              { title: 'Hackathon Ready', desc: 'Generate a full pitch, MVP scope, and execution plan in under 60 seconds.' },
              { title: 'No-Code Setup', desc: 'Works directly from your browser. No installations, no config, no cost.' },
              { title: 'AI Powered', desc: 'Multi-agent evaluation simulates real investor feedback on your idea.' },
            ].map((item) => (
              <div key={item.title} className="border-2 border-[#0A0A0A] bg-white p-6 card-hover">
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">{item.title}</h3>
                <p className="text-xs font-medium text-[#3A3A3A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-t-2 border-[#0A0A0A] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="section-label mb-4">Features</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.02em] leading-none mb-4">Everything you need to launch</h2>
            <p className="text-sm font-medium text-[#3A3A3A] leading-relaxed">AI-powered tools that cover the entire startup journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <Link key={f.title} to={f.path}
                className="block border-2 border-[#0A0A0A] bg-white p-6 card-hover cursor-pointer hover:bg-[#F0EEE9] transition-colors">
                <div className="w-10 h-10 border-2 border-[#0A0A0A] flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-[#0A0A0A]" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-[#0A0A0A] mb-2">{f.title}</h3>
                <p className="text-xs font-medium text-[#3A3A3A] leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t-2 border-[#0A0A0A] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="section-label mb-4">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.02em] leading-none mb-4">Common questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'How does startingUP work?', a: 'Enter your skills and our AI generates personalized startup ideas, competitor analysis, MVP scope, revenue models, and pitch content in seconds.' },
              { q: 'Do I need a business background?', a: 'No. startingUP is designed for students and builders with technical skills but no business experience.' },
              { q: 'Is it free to use?', a: 'Yes. You can generate startup ideas and explore all features without any cost.' },
            ].map((faq) => (
              <div key={faq.q} className="border-2 border-[#0A0A0A] bg-white p-6">
                <h3 className="text-sm font-bold uppercase tracking-tight mb-2">{faq.q}</h3>
                <p className="text-xs font-medium text-[#3A3A3A] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-2 border-[#0A0A0A] py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-4">Ready to find your startup?</h2>
          <p className="text-sm font-medium text-[#3A3A3A] max-w-md mx-auto mb-8 leading-relaxed">Enter your skills and let AI generate personalized startup opportunities with full execution plans.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleJudgeQuickTest}
              className="h-12 px-8 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-[#0A0A0A] transition-colors">
              Quick Test <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/signin" className="h-12 px-8 border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-[#0A0A0A] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandLink />
          <nav className="flex items-center gap-8">
            {['Features', 'Dashboard', 'Sign In'].map((label) => (
              <Link key={label} to={label === 'Dashboard' ? '/dashboard' : label === 'Sign In' ? '/signin' : '/#' + label.toLowerCase()}
                className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A] hover:text-[#0A0A0A] transition-colors">
                {label}
              </Link>
            ))}
            <button onClick={() => setShowContact(true)}
              className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A] hover:text-[#0A0A0A] transition-colors">
              Contact
            </button>
          </nav>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A]">&copy; 2026 startingUP</p>
        </div>
      </footer>
      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
      <DemoVideoModal open={showDemo} onClose={() => setShowDemo(false)} />
    </main>
  );
}
