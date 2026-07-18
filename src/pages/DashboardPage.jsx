import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, RefreshCcw, Trash2, BarChart3, Lightbulb, Target } from 'lucide-react';
import { AppNav } from '../components/PageShell.jsx';
import { deletePlan, getSavedPlans, getSavedAnalyses, deleteSavedAnalysis } from '../services/api.js';
import { getSession } from '../services/storage.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const session = getSession();
  const totalMvpItems = plans.reduce((sum, entry) => sum + Number((entry.plan || entry).mvp_features?.length || 0), 0);
  const avgScore = plans.length
    ? plans.reduce((sum, entry) => sum + Number((entry.plan || entry).opportunity_score || 0), 0) / plans.length
    : 0;

  async function loadData() {
    if (!getSession()?.token) {
      setLoading(false);
      setError('Sign in to view your saved plans.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [plansData, analysesData] = await Promise.all([getSavedPlans(), getSavedAnalyses()]);
      setPlans(plansData);
      setAnalyses(analysesData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePlan(planId) {
    if (!planId || deleting) return;
    setDeleting(planId);
    setError('');
    try {
      await deletePlan(planId);
      setPlans((current) => current.filter((plan) => (plan._id || plan.id) !== planId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleDeleteAnalysis(analysisId) {
    if (!analysisId || deleting) return;
    setDeleting(analysisId);
    setError('');
    try {
      await deleteSavedAnalysis(analysisId);
      setAnalyses((current) => current.filter((a) => a._id !== analysisId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="section-label mb-4">{session?.user ? session.user.name : 'Workspace'}</p>
              <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight">Saved<br />Startup Plans.</h1>
            </div>
            <div className="flex gap-3">
              <button onClick={loadData} disabled={loading} className="h-12 px-5 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <Link to="/analytics" className="h-12 px-5 border-2 border-[#0A0A0A] bg-white text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                <BarChart3 className="h-4 w-4" /> Analytics
              </Link>
              <Link to="/input" className="h-12 px-6 bg-[#0A0A0A] text-[#F5F3EE] border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 hover:bg-white hover:text-[#0A0A0A] transition-colors">
                New Plan <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {error && <p className="text-xs font-black uppercase tracking-wide border-l-4 border-[#0A0A0A] pl-3 mb-6">{error}</p>}

          {!loading && (plans.length > 0 || analyses.length > 0) && (
            <>
              <div className="grid sm:grid-cols-3 border-2 border-[#0A0A0A] bg-white mb-8">
                {[
                  { label: 'Saved Plans', value: plans.length },
                  { label: 'Avg Score', value: avgScore.toFixed(1) },
                  { label: 'MVP Items', value: totalMvpItems },
                ].map((item, index) => (
                  <div key={item.label} className={`p-5 ${index > 0 ? 'sm:border-l-2 border-[#0A0A0A]' : ''}`}>
                    <p className="text-4xl font-black leading-none">{item.value}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mt-2">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-0 border-2 border-[#0A0A0A] mb-8">
                {['all', 'analyses', 'plans'].map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${tab === t ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#0A0A0A]'} ${t !== 'all' ? 'border-l-2 border-[#0A0A0A]' : ''}`}>
                    {t === 'all' ? `All (${analyses.length + plans.length})` : t === 'analyses' ? `Analyses (${analyses.length})` : `Plans (${plans.length})`}
                  </button>
                ))}
              </div>
            </>
          )}

          {loading ? (
            <div className="border-2 border-[#0A0A0A] bg-white p-8 text-sm font-black uppercase tracking-widest">Loading...</div>
          ) : (
            <>
              {(tab === 'all' || tab === 'analyses') && analyses.length > 0 && (
                <div className="mb-10">
                  {tab === 'all' && <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Idea Analyses</h2>}
                  <div className="grid md:grid-cols-2 xl:grid-cols-3">
                    {analyses.map((entry, index) => {
                      const analysis = entry.analysis || entry;
                      const id = entry._id;
                      return (
                        <article key={id || index} className={`border-2 border-[#0A0A0A] bg-white p-6 ${index % 3 !== 0 && tab !== 'analyses' ? 'xl:border-l-0' : ''}`}>
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Idea Analysis</p>
                              <h2 className="text-base font-black uppercase leading-tight">{analysis.refined_idea?.substring(0, 60) || 'Untitled Analysis'}</h2>
                            </div>
                            {id && (
                              <button onClick={() => handleDeleteAnalysis(id)} disabled={deleting === id} className="h-9 w-9 border-2 border-[#0A0A0A] flex items-center justify-center shrink-0 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-30" aria-label="Delete analysis">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-[#3A3A3A] border-l-2 border-[#0A0A0A] pl-3 mb-5 leading-relaxed">{analysis.problem_statement?.substring(0, 100) || 'No problem statement.'}</p>
                          <div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-wide mb-3">
                            <span className="border border-[#0A0A0A] p-2 text-center">Mkt {Number(analysis.market_demand_score || 0).toFixed(1)}</span>
                            <span className="border border-[#0A0A0A] p-2 text-center">Uniq {Number(analysis.uniqueness_score || 0).toFixed(1)}</span>
                            <span className="border border-[#0A0A0A] p-2 text-center">Rev {Number(analysis.revenue_potential_score || 0).toFixed(1)}</span>
                          </div>
                          <button type="button" onClick={() => navigate('/analyze-idea')} className="h-10 w-full border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                            <Eye className="h-4 w-4" /> View
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              {(tab === 'all' || tab === 'plans') && plans.length > 0 && (
                <div>
                  {tab === 'all' && <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="h-4 w-4" /> Startup Plans</h2>}
                  <div className="grid md:grid-cols-2 xl:grid-cols-3">
                    {plans.map((entry, index) => {
                      const plan = entry.plan || entry;
                      const id = entry._id || entry.id;
                      return (
                        <article key={id || `${plan.startup_name}-${index}`} className={`border-2 border-[#0A0A0A] bg-white p-6 ${index % 3 !== 0 && tab !== 'plans' ? 'xl:border-l-0' : ''}`}>
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Saved Plan</p>
                              <h2 className="text-xl font-black uppercase leading-tight">{plan.startup_name || 'Untitled Plan'}</h2>
                            </div>
                            {id && (
                              <button onClick={() => handleDeletePlan(id)} disabled={deleting === id} className="h-9 w-9 border-2 border-[#0A0A0A] flex items-center justify-center shrink-0 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-30" aria-label="Delete plan">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-[#3A3A3A] border-l-2 border-[#0A0A0A] pl-3 mb-5 leading-relaxed">{plan.pitch || plan.problem || 'No pitch saved.'}</p>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wide">
                            <span className="border border-[#0A0A0A] p-2">Score {Number(plan.opportunity_score || 0).toFixed(1)}</span>
                            <span className="border border-[#0A0A0A] p-2">{plan.mvp_features?.length || 0} MVP Items</span>
                          </div>
                          <button type="button" onClick={() => navigate(`/startups/${id}`)} className="mt-4 h-10 w-full border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                            <Eye className="h-4 w-4" /> View Detail
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              {analyses.length === 0 && plans.length === 0 && (
                <div className="border-2 border-[#0A0A0A] bg-white p-8">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-3">Empty</p>
                  <h2 className="text-3xl font-black uppercase leading-none mb-4">No saved items yet.</h2>
                  <p className="text-sm text-[#6A6A6A] mb-6">Analyze an idea or generate a plan, then save your progress.</p>
                  <Link to="/input" className="h-12 px-8 inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F5F3EE] border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] transition-colors">Start Now <ArrowRight className="h-4 w-4" /></Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
