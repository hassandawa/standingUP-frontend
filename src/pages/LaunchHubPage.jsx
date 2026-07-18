import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, Copy, CheckCheck, Rocket, Smartphone, FlaskConical, Users, CheckSquare, Square, Clock, Target } from 'lucide-react';
import { generateLaunchHub, saveLaunchHub, updateLaunchHubChecks } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

const TABS = [
  { key: 'product_hunt', label: 'Product Hunt', icon: Rocket },
  { key: 'app_store', label: 'App Store', icon: Smartphone },
  { key: 'beta', label: 'Beta Launch', icon: FlaskConical },
  { key: 'customers', label: 'First 100', icon: Users },
];

function PriorityBadge({ priority }) {
  const colors = { P0: 'bg-red-600 text-white', P1: 'bg-orange-600 text-white', P2: 'bg-blue-600 text-white' };
  return <Badge label={priority} color={colors[priority] || 'bg-[#6A6A6A] text-white'} />;
}

function ChecklistItem({ item, checked, onToggle }) {
  return (
    <div className={`flex items-start gap-3 p-3 border border-[#0A0A0A] transition-colors ${checked ? 'bg-green-50 border-green-600' : 'bg-white hover:bg-[#F5F3EE]'}`}>
      <button onClick={onToggle} className="mt-0.5 flex-shrink-0">
        {checked ? <CheckSquare className="h-5 w-5 text-green-600" /> : <Square className="h-5 w-5 text-[#6A6A6A]" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <PriorityBadge priority={item.priority} />
          <Badge label={item.category} color="bg-[#E8E6E1] text-[#0A0A0A]" />
          <span className="text-[9px] text-[#6A6A6A] flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{item.estimated_time}</span>
        </div>
        <p className={`text-xs ${checked ? 'line-through text-green-700' : 'text-[#0A0A0A]'}`}>{item.text}</p>
        <p className="text-[10px] text-[#6A6A6A] mt-0.5">{item.details}</p>
      </div>
    </div>
  );
}

export default function LaunchHubPage() {
  const { selectedIdea: savedIdea } = useIdea();
  const [activeTab, setActiveTab] = useState('product_hunt');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [checkedItems, setCheckedItems] = useState({});
  const [savedReportId, setSavedReportId] = useState(null);
  const profile = readValue('profile');
  const selectedIdea = savedIdea?.idea_data || readValue('selectedIdea');
  const plan = readValue('plan');
  const analysis = readValue('ideaAnalysis');

  async function handleGenerate() {
    if (!selectedIdea) return;
    setError('');
    setNotice('');
    setLoading(true);
    setCheckedItems({});
    setSavedReportId(null);
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
        monetization_model: analysis?.monetization_model || '',
        risks: Array.isArray(planData.risks || analysis?.risks) ? (planData.risks || analysis?.risks).join(', ') : (planData.risks || analysis?.risks || ''),
      };
      const res = await generateLaunchHub(data);
      setResult(res);
      saveValue('launchHub', res);
      setNotice('Launch hub generated.');
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!result || !selectedIdea) return;
    setError('');
    setNotice('');
    if (!getSession()?.token) { setError('Sign in to save to your dashboard.'); return; }
    setSaving(true);
    try {
      const allIds = getAllItemIds();
      const checkedIds = allIds.filter(id => checkedItems[id]);
      const ideaContext = { startup_name: selectedIdea.startup_name, pitch: selectedIdea.pitch, industry: profile?.preferred_industry || '' };
      const res = await saveLaunchHub(result, checkedIds, ideaContext);
      setSavedReportId(res.report_id);
      setNotice(res.message || 'Saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  function getAllItemIds() {
    const ids = [];
    if (result?.product_hunt_checklist?.items) ids.push(...result.product_hunt_checklist.items.map(i => i.id));
    if (result?.app_store_checklist?.items) ids.push(...result.app_store_checklist.items.map(i => i.id));
    return ids;
  }

  function toggleItem(id) {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function getProgress(items) {
    if (!items?.length) return 0;
    const total = items.length;
    const done = items.filter(i => checkedItems[i.id]).length;
    return Math.round((done / total) * 100);
  }

  const ph = result?.product_hunt_checklist || {};
  const as = result?.app_store_checklist || {};
  const beta = result?.beta_launch_plan || {};
  const f100 = result?.first_100_customers || {};

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <AppNav />
      <main className="pt-[104px] pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">Launch Hub</h1>
            <p className="text-sm text-[#6A6A6A] mt-1">Product Hunt, App Store, beta launch & first 100 customers for {selectedIdea?.startup_name || 'your startup'}</p>
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
            <Rocket className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Generating Launch Hub...</p>
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

            {activeTab === 'product_hunt' && (
              <div className="space-y-6">
                {ph.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{ph.overview}</p>}
                <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-black uppercase tracking-widest">Checklist</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold">{getProgress(ph.items)}% complete</span>
                      <div className="w-32 h-2 bg-[#E8E6E1] border border-[#0A0A0A]">
                        <div className="h-full bg-green-600 transition-all" style={{ width: `${getProgress(ph.items)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(ph.items || []).map(item => (
                      <ChecklistItem key={item.id} item={item} checked={!!checkedItems[item.id]} onToggle={() => toggleItem(item.id)} />
                    ))}
                  </div>
                </div>

                {ph.launch_day_timeline && Object.keys(ph.launch_day_timeline).length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-3">Launch Day Timeline</h2>
                    <div className="space-y-1">
                      {Object.entries(ph.launch_day_timeline).map(([time, desc]) => (
                        <div key={time} className="flex items-start gap-3 text-xs p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <Badge label={time.replace('_', ':')} color="bg-[#0A0A0A] text-white" />
                          <span>{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ph.tips?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Tips</h3>
                    <ul className="list-disc list-inside">{(ph.tips || []).map((t, i) => <li key={i} className="text-xs text-[#6A6A6A]">{t}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'app_store' && (
              <div className="space-y-6">
                {as.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{as.overview}</p>}
                <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-black uppercase tracking-widest">Checklist</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold">{getProgress(as.items)}% complete</span>
                      <div className="w-32 h-2 bg-[#E8E6E1] border border-[#0A0A0A]">
                        <div className="h-full bg-green-600 transition-all" style={{ width: `${getProgress(as.items)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(as.items || []).map(item => (
                      <ChecklistItem key={item.id} item={item} checked={!!checkedItems[item.id]} onToggle={() => toggleItem(item.id)} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {as.review_time_estimate && (
                    <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-2">Review Time</h3>
                      <p className="text-xs">{as.review_time_estimate}</p>
                    </div>
                  )}
                  {as.aso_tips?.length > 0 && (
                    <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-2">ASO Tips</h3>
                      <ul className="list-disc list-inside">{(as.aso_tips || []).map((t, i) => <li key={i} className="text-xs text-[#6A6A6A]">{t}</li>)}</ul>
                    </div>
                  )}
                </div>

                {as.tips?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Tips</h3>
                    <ul className="list-disc list-inside">{(as.tips || []).map((t, i) => <li key={i} className="text-xs text-[#6A6A6A]">{t}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'beta' && (
              <div className="space-y-6">
                {beta.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{beta.overview}</p>}
                <div className="grid gap-6">
                  {(beta.phases || []).map((phase, i) => (
                    <div key={i} className="border-2 border-[#0A0A0A] bg-white">
                      <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest">{phase.phase}</span>
                        <Badge label={phase.duration} color="bg-[#E8E6E1] text-[#0A0A0A]" />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {(phase.goals || []).map((g, j) => <Badge key={j} label={g} />)}
                        </div>
                        <table className="w-full text-xs border-collapse">
                          <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Day</th><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Action</th><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Owner</th><th className="text-left px-2 py-1 border-b border-[#0A0A0A]">Details</th></tr></thead>
                          <tbody>
                            {(phase.actions || []).map((a, j) => (
                              <tr key={j} className="border-b border-[#0A0A0A]/10">
                                <td className="px-2 py-1 font-bold">D{a.day > 0 ? '+' : ''}{a.day}</td>
                                <td className="px-2 py-1">{a.action}</td>
                                <td className="px-2 py-1 text-[#6A6A6A]">{a.owner}</td>
                                <td className="px-2 py-1 text-[#6A6A6A]">{a.details}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {beta.beta_tester_criteria?.length > 0 && (
                    <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-2">Tester Criteria</h3>
                      <ul className="list-disc list-inside">{(beta.beta_tester_criteria || []).map((c, i) => <li key={i} className="text-xs text-[#6A6A6A]">{c}</li>)}</ul>
                    </div>
                  )}
                  {beta.feedback_collection && (
                    <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-2">Feedback Collection</h3>
                      <p className="text-xs text-[#6A6A6A]">{beta.feedback_collection}</p>
                    </div>
                  )}
                </div>

                {beta.success_metrics?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Success Metrics</h3>
                    <div className="flex flex-wrap gap-1">{(beta.success_metrics || []).map((m, i) => <Badge key={i} label={m} color="bg-green-600 text-white" />)}</div>
                  </div>
                )}

                {beta.tips?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Tips</h3>
                    <ul className="list-disc list-inside">{(beta.tips || []).map((t, i) => <li key={i} className="text-xs text-[#6A6A6A]">{t}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-6">
                {f100.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{f100.overview}</p>}

                {f100.target_segment && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-1">Target Segment</h3>
                    <p className="text-xs text-[#6A6A6A]">{f100.target_segment}</p>
                  </div>
                )}

                <div className="grid gap-4">
                  {(f100.channels || []).map((ch, i) => (
                    <div key={i} className="border-2 border-[#0A0A0A] bg-white p-4">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-2">{ch.name}</h3>
                      <p className="text-xs text-[#6A6A6A] mb-2">{ch.tactic}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-[#6A6A6A]">
                        <span><Target className="h-3 w-3 inline" /> Reach: {ch.estimated_reach}</span>
                        <span><Users className="h-3 w-3 inline" /> Conversions: {ch.estimated_conversions}</span>
                        <span>Cost: {ch.cost}</span>
                        <span>Timeline: {ch.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-2 border-[#0A0A0A] bg-white">
                  <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 text-xs font-black uppercase tracking-widest">Weekly Targets</div>
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-3 py-2 border-b">Week</th><th className="text-right px-3 py-2 border-b">Target</th><th className="text-left px-3 py-2 border-b">Actions</th><th className="text-left px-3 py-2 border-b">Source</th></tr></thead>
                    <tbody>
                      {(f100.weekly_targets || []).map((wt, i) => (
                        <tr key={i} className="border-b border-[#0A0A0A]/10">
                          <td className="px-3 py-2 font-bold">{wt.week}</td>
                          <td className="px-3 py-2 text-right font-bold text-green-600">{wt.target}</td>
                          <td className="px-3 py-2">{(wt.actions || []).map(a => <Badge key={a} label={a} color="bg-[#E8E6E1] text-[#0A0A0A] mr-1" />)}</td>
                          <td className="px-3 py-2 text-[#6A6A6A]">{wt.expected_source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Incentive Strategy</h3>
                    <p className="text-xs text-[#6A6A6A]">{f100.incentive_strategy}</p>
                  </div>
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Referral Program</h3>
                    <p className="text-xs text-[#6A6A6A]">{f100.referral_program}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(f100.milestones || []).map((ms, i) => (
                    <div key={i} className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                      <p className="text-3xl font-black text-green-600">{ms.customers}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mt-1">Customers</p>
                      <p className="text-xs mt-2">{ms.celebration}</p>
                      <p className="text-[10px] text-blue-600 mt-1">{ms.signal}</p>
                    </div>
                  ))}
                </div>

                {f100.tips?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Tips</h3>
                    <ul className="list-disc list-inside">{(f100.tips || []).map((t, i) => <li key={i} className="text-xs text-[#6A6A6A]">{t}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}