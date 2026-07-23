import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Check, Download, Rocket, Save, Sparkles, Users, Lightbulb } from 'lucide-react';
import { AppNav } from '../components/PageShell.jsx';
import { generateIdeas, generatePlan, savePlan, createSavedIdea } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';

function Score({ label, value }) {
  const pct = Math.max(0, Math.min(100, Number(value || 0) * 10));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">{label}</span>
        <span className="text-[10px] font-black text-[#0A0A0A]">{Number(value || 0).toFixed(1)}</span>
      </div>
      <div className="h-2 border border-[#0A0A0A] bg-[#F5F3EE]">
        <div className="h-full bg-[#0A0A0A]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ListBlock({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="border-2 border-[#0A0A0A] p-5 bg-white">
      <h3 className="text-xs font-black uppercase tracking-widest mb-4">{title}</h3>
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

function LoadingSkeleton({ title, items }) {
  return (
    <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-4 mb-4">
      <p className="text-[10px] font-black uppercase tracking-widest mb-3">{title}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {items.map((item) => (
          <div key={item} className="border-2 border-[#0A0A0A] bg-white p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wide">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const profile = readValue('profile');
  const analysis = readValue('analysis');
  const [ideas, setIdeas] = useState(readValue('ideas', []));
  const cachedPlan = readValue('plan');
  const [selectedIdea, setSelectedIdea] = useState(readValue('selectedIdea', ideas[0] || null));
  const [plan, setPlan] = useState(cachedPlan);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [savingIdea, setSavingIdea] = useState(false);
  const topIdea = useMemo(() => {
    return [...ideas].sort((a, b) => Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0))[0];
  }, [ideas]);
  const averageScore = useMemo(() => {
    if (!ideas.length) return 0;
    return ideas.reduce((sum, idea) => sum + Number(idea.opportunity_score || 0), 0) / ideas.length;
  }, [ideas]);

  const planText = useMemo(() => (plan ? JSON.stringify(plan, null, 2) : ''), [plan]);
  const markdownText = useMemo(() => {
    if (!plan) return '';
    const lines = [
      `# ${plan.startup_name}`,
      '',
      `**Pitch:** ${plan.pitch}`,
      '',
      '## Problem',
      plan.problem,
      '',
      '## Solution',
      plan.solution,
      '',
      '## MVP Features',
      ...(plan.mvp_features || []).map((item) => `- ${item}`),
      '',
      '## Roadmap',
      ...(plan.roadmap || []).map((item) => `- Week ${item.week}: ${item.title} - ${(item.tasks || []).join(', ')}`),
      '',
      '## Revenue Model',
      JSON.stringify(plan.revenue_model || {}, null, 2),
      '',
      '## Risks',
      ...(plan.risks || []).map((item) => `- ${item}`),
    ];
    return lines.join('\n');
  }, [plan]);

  if (!profile || !ideas.length) {
    return (
      <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
        <AppNav />
        <section className="pt-32 px-6 max-w-3xl mx-auto">
          <div className="border-2 border-[#0A0A0A] bg-white p-8">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-3">No Results</p>
            <h1 className="text-4xl font-black uppercase leading-none mb-4">Generate ideas first.</h1>
            <Link to="/input" className="h-12 px-8 inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F5F3EE] border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] transition-colors">
              Start Form <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  async function handlePlan() {
    setError('');
    setNotice('');
    setLoadingPlan(true);
    try {
      const nextPlan = await generatePlan(profile, selectedIdea);
      setPlan(nextPlan);
      saveValue('selectedIdea', selectedIdea);
      saveValue('plan', nextPlan);
      setNotice('Full startup plan generated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingPlan(false);
    }
  }

  async function handleSave() {
    if (!plan) return;
    setError('');
    setNotice('');
    if (!getSession()?.token) {
      setError('Sign in to save this plan to your dashboard.');
      return;
    }
    setSaving(true);
    try {
      const result = await savePlan(profile, plan);
      setNotice(result.message || 'Plan saved.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveToIdeas() {
    if (!selectedIdea) return;
    setError('');
    setNotice('');
    if (!getSession()?.token) {
      setError('Sign in to save this idea.');
      return;
    }
    setSavingIdea(true);
    try {
      await createSavedIdea({
        title: selectedIdea.startup_name || 'Untitled Idea',
        description: selectedIdea.pitch || '',
        idea_data: selectedIdea,
        analysis: analysis || {},
        plan: plan || {},
        profile: profile || {},
      });
      setNotice('Idea saved! Access it from any feature page.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingIdea(false);
    }
  }

  async function handleRegenerateIdeas() {
    setError('');
    setNotice('');
    setRegenerating(true);
    try {
      const nextIdeas = await generateIdeas(profile);
      setIdeas(nextIdeas);
      setSelectedIdea(nextIdeas[0] || null);
      setPlan(null);
      saveValue('ideas', nextIdeas);
      saveValue('selectedIdea', nextIdeas[0] || null);
      saveValue('plan', null);
      setNotice('Startup ideas regenerated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRegenerating(false);
    }
  }

  function handleDownload(format = 'json') {
    const content = format === 'md' ? markdownText : planText;
    if (!content) return;
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.startup_name || 'startup-plan'}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="section-label mb-4">AI Results</p>
              <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight">Startup<br />Opportunities.</h1>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleRegenerateIdeas} disabled={regenerating} className="h-12 px-6 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center justify-center hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
                {regenerating ? 'Regenerating' : 'Regenerate Ideas'}
              </button>
              <Link to="/input" className="h-12 px-6 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center justify-center hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">Edit Inputs</Link>
            </div>
          </div>

          {analysis && (
            <div className="grid lg:grid-cols-4 border-2 border-[#0A0A0A] bg-white mb-10">
              <div className="p-5 border-b-2 lg:border-b-0 lg:border-r-2 border-[#0A0A0A]">
                <Brain className="h-5 w-5 mb-3" />
                <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Founder Type</p>
                <h2 className="text-lg font-black uppercase leading-tight">{analysis.founder_type}</h2>
              </div>
              <ListBlock title="Strengths" items={analysis.strengths} />
              <ListBlock title="Weaknesses" items={analysis.weaknesses} />
              <ListBlock title="Categories" items={analysis.best_startup_categories} />
            </div>
          )}

          <div className="grid md:grid-cols-3 border-2 border-[#0A0A0A] bg-white mb-10">
            <div className="p-5 border-b-2 md:border-b-0 md:border-r-2 border-[#0A0A0A]">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Best Candidate</p>
              <h2 className="text-lg font-black uppercase leading-tight">{topIdea?.startup_name || 'No idea'}</h2>
            </div>
            <div className="p-5 border-b-2 md:border-b-0 md:border-r-2 border-[#0A0A0A]">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Average Score</p>
              <p className="text-4xl font-black leading-none">{averageScore.toFixed(1)}</p>
            </div>
            <div className="p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Next Move</p>
              <p className="text-sm text-[#3A3A3A] leading-relaxed">Pick the strongest idea, generate a full plan, then save it to your dashboard before regenerating.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <h2 className="text-xs font-black uppercase tracking-widest mb-4">Generated Ideas</h2>
              <div className="space-y-[-2px]">
                {ideas.map((idea) => (
                  <button
                    key={idea.startup_name}
                    type="button"
                    onClick={() => {
                      setSelectedIdea(idea);
                      setPlan(null);
                      saveValue('selectedIdea', idea);
                      saveValue('plan', null);
                    }}
                    className={`w-full text-left border-2 border-[#0A0A0A] p-5 transition-colors ${selectedIdea?.startup_name === idea.startup_name ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white hover:bg-[#F5F3EE]'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`text-lg font-black uppercase tracking-tight ${selectedIdea?.startup_name === idea.startup_name ? 'text-[#F5F3EE]' : 'text-[#0A0A0A]'}`}>{idea.startup_name}</h3>
                        <p className={`text-sm leading-relaxed mt-2 ${selectedIdea?.startup_name === idea.startup_name ? 'text-[#F5F3EE]/70' : 'text-[#6A6A6A]'}`}>{idea.pitch}</p>
                      </div>
                      <span className={`text-sm font-black border-2 px-2 py-1 ${selectedIdea?.startup_name === idea.startup_name ? 'border-[#F5F3EE]' : 'border-[#0A0A0A]'}`}>{Number(idea.opportunity_score || 0).toFixed(1)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="border-2 border-[#0A0A0A] bg-white p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b-2 border-[#0A0A0A] pb-5 mb-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Selected Idea</p>
                    <h2 className="text-2xl font-black uppercase leading-none">{selectedIdea?.startup_name}</h2>
                    <p className="text-sm text-[#3A3A3A] mt-3 leading-relaxed">{selectedIdea?.solution}</p>
                  </div>
                  <button onClick={handlePlan} disabled={loadingPlan} className="h-12 px-6 bg-[#0A0A0A] text-[#F5F3EE] border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50">
                    {loadingPlan ? 'Generating...' : <>Full Plan <Sparkles className="h-4 w-4" /></>}
                  </button>
                </div>

                {loadingPlan && <LoadingSkeleton title="Building Your Startup Plan" items={["MVP Features", "Revenue Model", "Launch Strategy", "Roadmap"]} />}

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <Score label="Feasibility" value={selectedIdea?.feasibility_score} />
                  <Score label="Demand" value={selectedIdea?.demand_score} />
                  <Score label="Monetization" value={selectedIdea?.monetization_score} />
                  <Score label="Founder Fit" value={selectedIdea?.founder_fit_score} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <ListBlock title="Target Users" items={selectedIdea?.target_users} />
                  <ListBlock title="Why Now" items={selectedIdea?.why_now ? [selectedIdea.why_now] : []} />
                </div>

                {notice && <p className="text-xs font-black uppercase tracking-wide border-l-4 border-[#0A0A0A] pl-3 mb-4">{notice}</p>}
                {error && <p className="text-xs font-black uppercase tracking-wide border-l-4 border-red-500 text-red-600 pl-3 mb-4">{error}</p>}

                {plan && (
                  <div className="border-t-2 border-[#0A0A0A] pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <h3 className="text-xl font-black uppercase leading-none">{plan.startup_name} Plan</h3>
                      <div className="flex gap-3">
                        <button onClick={handleSave} disabled={saving} className="h-10 px-4 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-all duration-200 disabled:opacity-50">
                          <Save className="h-4 w-4" /> {saving ? 'Saving' : 'Save'}
                        </button>
                        <button onClick={handleSaveToIdeas} disabled={savingIdea}
                          className="h-10 px-5 bg-[#0A0A0A] text-[#F5F3EE] border-2 border-[#0A0A0A] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-[#0A0A0A] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_0_rgba(10,10,10,1)] hover:shadow-none">
                          <Lightbulb className="h-4 w-4" /> {savingIdea ? 'Saving...' : 'Save to Ideas'}
                        </button>
                        <button onClick={() => handleDownload('json')} className="h-10 px-4 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                          <Download className="h-4 w-4" /> JSON
                        </button>
                        <button onClick={() => handleDownload('md')} className="h-10 px-4 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                          <Download className="h-4 w-4" /> MD
                        </button>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <ListBlock title="MVP Features" items={plan.mvp_features} />
                      <ListBlock title="Advantages" items={plan.our_advantages} />
                      <ListBlock title="Risks" items={plan.risks} />
                      <ListBlock title="Pitch" items={[plan.thirty_second_pitch]} />
                    </div>
                    <div className="mt-4 border-2 border-[#0A0A0A] bg-[#F5F3EE] p-5">
                      <h4 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2"><Rocket className="h-4 w-4" /> Roadmap</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {plan.roadmap?.map((item) => (
                          <div key={`${item.week}-${item.title}`} className="border-2 border-[#0A0A0A] bg-white p-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Week {item.week}</p>
                            <h5 className="text-sm font-black uppercase my-2">{item.title}</h5>
                            <ul className="text-xs text-[#3A3A3A] space-y-1">
                              {item.tasks?.map((task) => <li key={task}>{task}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
