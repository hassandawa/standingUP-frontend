import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, Copy, CheckCheck, TrendingUp, Target, Zap, Users, Lightbulb, Calendar } from 'lucide-react';
import { generateGrowthHub, saveGrowthHub } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

const TABS = [
  { key: 'plan', label: 'Growth Plan', icon: Calendar },
  { key: 'kpis', label: 'KPI Dashboard', icon: TrendingUp },
  { key: 'north_star', label: 'North Star', icon: Target },
  { key: 'acquisition', label: 'Acquisition', icon: Users },
  { key: 'hacks', label: 'Growth Hacks', icon: Zap },
];

function PriorityBadge({ priority }) {
  const colors = { P0: 'bg-red-600 text-white', P1: 'bg-orange-600 text-white', P2: 'bg-blue-600 text-white' };
  return <Badge label={priority} color={colors[priority] || 'bg-[#6A6A6A] text-white'} />;
}

export default function GrowthHubPage() {
  const { selectedIdea: savedIdea } = useIdea();
  const [activeTab, setActiveTab] = useState('plan');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const profile = readValue('profile');
  const selectedIdea = savedIdea?.idea_data || readValue('selectedIdea');
  const plan = readValue('plan');
  const analysis = readValue('ideaAnalysis');

  async function handleGenerate() {
    if (!selectedIdea) return;
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const planData = plan || {};
      const data = {
        startup_name: selectedIdea.startup_name,
        pitch: selectedIdea.pitch,
        problem: selectedIdea.problem,
        solution: selectedIdea.solution,
        target_users: Array.isArray(selectedIdea.target_users) ? selectedIdea.target_users.join(', ') : (selectedIdea.target_users || ''),
        industry: profile?.preferred_industry || '',
        location: '',
        business_model: planData.revenue_model?.pricing_model || analysis?.monetization_model || '',
        mvp_features: Array.isArray(planData.mvp_features || selectedIdea.mvp_features) ? (planData.mvp_features || selectedIdea.mvp_features).join(', ') : (planData.mvp_features || selectedIdea.mvp_features || ''),
        competitors: Array.isArray(planData.competitors || selectedIdea.competitors) ? (planData.competitors || selectedIdea.competitors).join(', ') : (planData.competitors || selectedIdea.competitors || ''),
        market_demand: Number(analysis?.market_demand_score || 0),
        uniqueness: Number(analysis?.uniqueness_score || 0),
        feasibility: Number(analysis?.feasibility_score || 0),
        risks: Array.isArray(planData.risks || analysis?.risks) ? (planData.risks || analysis?.risks).join(', ') : (planData.risks || analysis?.risks || ''),
        monetization_model: analysis?.monetization_model || '',
      };
      const res = await generateGrowthHub(data);
      setResult(res);
      saveValue('growthHub', res);
      setNotice('Growth hub generated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result || !selectedIdea) return;
    setError('');
    setNotice('');
    if (!getSession()?.token) { setError('Sign in to save to your dashboard.'); return; }
    setSaving(true);
    try {
      const ideaContext = { startup_name: selectedIdea.startup_name, pitch: selectedIdea.pitch, industry: profile?.preferred_industry || '' };
      const res = await saveGrowthHub(result, ideaContext);
      setNotice(res.message || 'Saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  const growthPlan = result?.growth_plan || {};
  const kpiDash = result?.kpi_dashboard || {};
  const northStar = result?.north_star_metric || {};
  const acquisition = result?.user_acquisition || {};
  const hacks = result?.growth_hacks || [];

  function renderPhase(phase, icon) {
    if (!phase?.title) return null;
    return (
      <div className="border-2 border-[#0A0A0A] bg-white">
        <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 flex items-center gap-2">
          {icon}<span className="text-xs font-black uppercase tracking-widest">{phase.title}</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#6A6A6A] italic">{phase.focus}</p>
          <div className="flex flex-wrap gap-1">
            {(phase.goals || []).map((g, i) => <Badge key={i} label={g} />)}
          </div>
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Day</th><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Action</th><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Owner</th><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Metrics</th><th className="text-center px-2 py-1 border-b border-[#0A0A0A]">Priority</th></tr></thead>
            <tbody>
              {(phase.actions || []).map((a, i) => (
                <tr key={i} className="border-b border-[#0A0A0A]/10">
                  <td className="px-2 py-1 font-bold">Day {a.day}</td>
                  <td className="px-2 py-1">{a.action}</td>
                  <td className="px-2 py-1 text-[#6A6A6A]">{a.owner}</td>
                  <td className="px-2 py-1 text-[#6A6A6A]">{a.metrics}</td>
                  <td className="px-2 py-1 text-center"><PriorityBadge priority={a.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pt-2 border-t border-[#0A0A0A]/10">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Success:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {(phase.success_criteria || []).map((sc, i) => <Badge key={i} label={sc} color="bg-green-600 text-white" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <AppNav />
      <main className="pt-[104px] pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">Growth Hub</h1>
            <p className="text-sm text-[#6A6A6A] mt-1">30/60/90-day plan, KPIs, North Star metric, acquisition strategy & growth hacks for {selectedIdea?.startup_name || 'your startup'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleGenerate} disabled={loading || !selectedIdea} className="h-11 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors disabled:opacity-40">
              <Sparkles className="h-4 w-4" />
              {loading ? 'Generating...' : result ? 'Regenerate' : 'Generate'}
            </button>
            {result && (
              <button onClick={handleSave} disabled={saving} className="h-11 px-6 border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-40">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>

        <IdeaSelector />

        {error && <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold uppercase">{error}</div>}
        {notice && <div className="mb-6 p-4 bg-green-50 border-2 border-green-600 text-green-800 text-xs font-bold uppercase">{notice}</div>}

        {!selectedIdea && (
          <div className="p-12 border-2 border-[#0A0A0A] text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Select a startup idea on the dashboard first</p>
            <Link to="/dashboard" className="mt-4 inline-block h-10 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest leading-10">Go to Dashboard</Link>
          </div>
        )}

        {loading && (
          <div className="p-12 border-2 border-[#0A0A0A] text-center animate-pulse">
            <TrendingUp className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Generating Growth Hub...</p>
          </div>
        )}

        {result && !loading && (
          <>
            <div className="flex border-b-2 border-[#0A0A0A] mb-8 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest border-r-2 border-[#0A0A0A] transition-colors ${activeTab === tab.key ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'text-[#0A0A0A] hover:bg-[#E8E6E1]'}`}>
                    <Icon className="h-3.5 w-3.5" /> {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'plan' && (
              <div className="space-y-6">
                {growthPlan.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{growthPlan.overview}</p>}
                <div className="grid gap-6">
                  {renderPhase(growthPlan.phase_1_30_days, <Calendar className="h-4 w-4" />)}
                  {renderPhase(growthPlan.phase_2_60_days, <TrendingUp className="h-4 w-4" />)}
                  {renderPhase(growthPlan.phase_3_90_days, <Target className="h-4 w-4" />)}
                </div>
                {(growthPlan.key_milestones || []).length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-3">Key Milestones</h3>
                    <div className="grid gap-3">
                      {growthPlan.key_milestones.map((m, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <div className="h-8 w-8 bg-[#0A0A0A] text-[#F5F3EE] flex items-center justify-center text-xs font-black">{m.deadline}</div>
                          <div>
                            <p className="text-xs font-bold">{m.title}</p>
                            <p className="text-[10px] text-[#6A6A6A]">{m.description}</p>
                            <p className="text-[10px] text-blue-600 mt-0.5">Verify: {m.verification}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'kpis' && (
              <div className="space-y-4">
                {kpiDash.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{kpiDash.overview}</p>}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(kpiDash.kpis || []).map((kpi, i) => (
                    <div key={i} className="border-2 border-[#0A0A0A] bg-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest">{kpi.name}</h3>
                        <Badge label={kpi.category} color="bg-[#0A0A0A] text-white" />
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-[#6A6A6A]">Current:</span><span className="font-bold">{kpi.current_estimate}</span></div>
                        <div className="flex justify-between"><span className="text-[#6A6A6A]">30d:</span><span className="font-bold text-blue-600">{kpi.day_30_target}</span></div>
                        <div className="flex justify-between"><span className="text-[#6A6A6A]">60d:</span><span className="font-bold text-orange-600">{kpi.day_60_target}</span></div>
                        <div className="flex justify-between"><span className="text-[#6A6A6A]">90d:</span><span className="font-bold text-green-600">{kpi.day_90_target}</span></div>
                        <div className="flex justify-between"><span className="text-[#6A6A6A]">Frequency:</span><span>{kpi.measurement_frequency}</span></div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#0A0A0A]/10">
                        <p className="text-[10px] text-[#6A6A6A]">{kpi.why_it_matters}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Leading Indicators</h3>
                    <ul className="list-disc list-inside">{(kpiDash.leading_indicators || []).map((li, i) => <li key={i} className="text-xs text-[#6A6A6A]">{li}</li>)}</ul>
                  </div>
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Lagging Indicators</h3>
                    <ul className="list-disc list-inside">{(kpiDash.lagging_indicators || []).map((li, i) => <li key={i} className="text-xs text-[#6A6A6A]">{li}</li>)}</ul>
                  </div>
                </div>
                {kpiDash.review_cadence && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <span className="text-xs font-black uppercase tracking-widest">Review Cadence: </span>
                    <span className="text-xs text-[#6A6A6A]">{kpiDash.review_cadence}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'north_star' && (
              <div className="space-y-4">
                <div className="border-2 border-[#0A0A0A] bg-white p-6 text-center">
                  <Target className="h-10 w-10 mx-auto mb-3 text-[#0A0A0A]" />
                  <h2 className="text-xl font-black uppercase tracking-tight text-[#0A0A0A]">{northStar.metric_name}</h2>
                  <p className="text-sm text-[#6A6A6A] mt-2 max-w-2xl mx-auto">{northStar.why_this_metric}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Definition</h3>
                    <p className="text-xs text-[#6A6A6A]">{northStar.definition}</p>
                    <div className="mt-3 p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Formula:</span>
                      <p className="text-xs font-mono mt-0.5">{northStar.formula}</p>
                    </div>
                    <div className="mt-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Year 1 Target:</span>
                      <p className="text-lg font-black text-green-600">{northStar.target}</p>
                    </div>
                  </div>
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Input Metrics</h3>
                    <div className="space-y-2">
                      {(northStar.input_metrics || []).map((im, i) => (
                        <div key={i} className="p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <p className="text-xs font-bold">{im.name}</p>
                          <p className="text-[10px] text-[#6A6A6A]">Lever: {im.lever}</p>
                          <p className="text-[10px] text-[#6A6A6A]">Current: {im.current_estimate}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {(northStar.alignment_questions || []).length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Alignment Questions</h3>
                    <ul className="list-disc list-inside">
                      {northStar.alignment_questions.map((q, i) => <li key={i} className="text-xs text-[#6A6A6A]">{q}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'acquisition' && (
              <div className="space-y-4">
                {acquisition.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{acquisition.overview}</p>}
                <div className="grid gap-4">
                  {(acquisition.channels || []).map((ch, i) => (
                    <div key={i} className="border-2 border-[#0A0A0A] bg-white">
                      <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest">{ch.name}</span>
                        <div className="flex gap-1">
                          <Badge label={`Effort: ${ch.effort}`} color="bg-blue-600 text-white" />
                          <Badge label={`Impact: ${ch.impact}`} color="bg-green-600 text-white" />
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-xs text-[#6A6A6A]">{ch.strategy}</p>
                        <div className="flex gap-4 text-xs">
                          <span><span className="text-[#6A6A6A]">CAC:</span> <span className="font-bold">{ch.estimated_cac}</span></span>
                          <span><span className="text-[#6A6A6A]">LTV:</span> <span className="font-bold">{ch.estimated_ltv}</span></span>
                          <span><span className="text-[#6A6A6A]">ROI:</span> <span>{ch.timeline_to_roi}</span></span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(ch.tactics || []).map((t, j) => <Badge key={j} label={t} color="bg-[#E8E6E1] text-[#0A0A0A]" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {(acquisition.recommended_budget_split || []).length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-3">Recommended Budget Split</h3>
                    <div className="space-y-2">
                      {acquisition.recommended_budget_split.map((bs, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-bold w-40">{bs.channel}</span>
                          <div className="flex-1 bg-[#E8E6E1] h-5 border border-[#0A0A0A]">
                            <div className="bg-[#0A0A0A] h-full" style={{ width: `${bs.percentage}%` }} />
                          </div>
                          <span className="text-xs font-black w-12">{bs.percentage}%</span>
                          <span className="text-[10px] text-[#6A6A6A] flex-1">{bs.rationale}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {acquisition.viral_loop && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Viral Loop</h3>
                    <p className="text-xs text-[#6A6A6A]">{acquisition.viral_loop}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hacks' && (
              <div className="space-y-4">
                {hacks.length === 0 && <p className="text-xs text-[#6A6A6A]">No growth hacks generated.</p>}
                {hacks.map((hack, i) => (
                  <div key={i} className="border-2 border-[#0A0A0A] bg-white">
                    <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest">{hack.title}</span>
                      <div className="flex gap-1">
                        <Badge label={hack.expected_impact} color={
                          hack.expected_impact === 'Very High' ? 'bg-purple-600 text-white' :
                          hack.expected_impact === 'High' ? 'bg-green-600 text-white' :
                          hack.expected_impact === 'Medium' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                        } />
                        <Badge label={hack.time_to_implement} color="bg-[#E8E6E1] text-[#0A0A0A]" />
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-xs text-[#6A6A6A]">{hack.description}</p>
                      <p className="text-xs"><span className="font-bold">Implementation:</span> {hack.implementation}</p>
                      <div className="flex flex-wrap gap-1">
                        {(hack.resources_needed || []).map((r, j) => <Badge key={j} label={r} color="bg-[#E8E6E1] text-[#0A0A0A]" />)}
                      </div>
                      {hack.success_metric && (
                        <div className="pt-2 border-t border-[#0A0A0A]/10">
                          <span className="text-[9px] font-black uppercase tracking-widest text-green-600">Success: </span>
                          <span className="text-xs">{hack.success_metric}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}