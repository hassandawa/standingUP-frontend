import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { AppNav } from '../components/PageShell.jsx';
import { deletePlan, getSavedPlans } from '../services/api.js';
import { getSession } from '../services/storage.js';

function Block({ title, children }) {
  return (
    <section className="border-2 border-[#0A0A0A] bg-white p-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-[#0A0A0A] mb-4">{title}</h2>
      {children}
    </section>
  );
}

function List({ items = [] }) {
  return (
    <ul className="space-y-2 text-sm text-[#3A3A3A]">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="border-l-2 border-[#0A0A0A] pl-3">{item}</li>
      ))}
    </ul>
  );
}

export default function StartupDetailPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const plan = entry?.plan || entry;

  const markdown = useMemo(() => {
    if (!plan) return '';
    return [
      `# ${plan.startup_name}`,
      '',
      `Pitch: ${plan.pitch}`,
      '',
      `Problem: ${plan.problem}`,
      '',
      `Solution: ${plan.solution}`,
      '',
      '## MVP Features',
      ...(plan.mvp_features || []).map((item) => `- ${item}`),
      '',
      '## Roadmap',
      ...(plan.roadmap || []).map((item) => `- Week ${item.week}: ${item.title} - ${(item.tasks || []).join(', ')}`),
      '',
      '## Hackathon Pitch',
      plan.hackathon_pitch || '',
    ].join('\n');
  }, [plan]);

  useEffect(() => {
    async function load() {
      if (!getSession()?.token) {
        setError('Sign in to view saved plan details.');
        setLoading(false);
        return;
      }
      try {
        const plans = await getSavedPlans();
        const found = plans.find((item) => (item._id || item.id) === planId);
        if (!found) {
          setError('Saved plan not found.');
        } else {
          setEntry(found);
        }
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [planId]);

  function download(format) {
    if (!plan) return;
    const content = format === 'md' ? markdown : JSON.stringify(plan, null, 2);
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.startup_name || 'startup-plan'}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function remove() {
    try {
      await deletePlan(planId);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          {loading ? (
            <div className="border-2 border-[#0A0A0A] bg-white p-8 text-sm font-black uppercase tracking-widest">Loading plan...</div>
          ) : error ? (
            <div className="border-2 border-[#0A0A0A] bg-white p-8">
              <p className="text-xs font-black uppercase tracking-widest border-l-4 border-[#0A0A0A] pl-3">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div>
                  <p className="section-label mb-4">Saved Plan</p>
                  <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight">{plan.startup_name}</h1>
                  <p className="text-sm text-[#3A3A3A] border-l-2 border-[#0A0A0A] pl-3 mt-5 max-w-2xl">{plan.pitch}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => download('json')} className="h-11 px-5 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                    <Download className="h-4 w-4" /> JSON
                  </button>
                  <button onClick={() => download('md')} className="h-11 px-5 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                    <Download className="h-4 w-4" /> Markdown
                  </button>
                  <button onClick={remove} className="h-11 px-5 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-[#0A0A0A] transition-colors">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <Block title="Problem"><p className="text-sm text-[#3A3A3A] leading-relaxed">{plan.problem}</p></Block>
                <Block title="Solution"><p className="text-sm text-[#3A3A3A] leading-relaxed">{plan.solution}</p></Block>
                <Block title="MVP Features"><List items={plan.mvp_features} /></Block>
                <Block title="Advantages"><List items={plan.our_advantages} /></Block>
                <Block title="Market Gaps"><List items={plan.market_gaps} /></Block>
                <Block title="Risks"><List items={plan.risks} /></Block>
              </div>

              <Block title="Roadmap">
                <div className="grid md:grid-cols-2 gap-3">
                  {plan.roadmap?.map((item) => (
                    <div key={`${item.week}-${item.title}`} className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Week {item.week}</p>
                      <h3 className="text-sm font-black uppercase my-2">{item.title}</h3>
                      <List items={item.tasks} />
                    </div>
                  ))}
                </div>
              </Block>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
