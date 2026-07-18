import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, Copy, CheckCheck, Wallet, TrendingDown, Activity, BarChart3, DollarSign } from 'lucide-react';
import { generateFinancialPlan, saveFinancialPlan } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

const TABS = [
  { key: 'budget', label: 'Budget Planner', icon: Wallet },
  { key: 'burn_rate', label: 'Burn Rate', icon: TrendingDown },
  { key: 'break_even', label: 'Break-Even', icon: Activity },
  { key: 'revenue', label: 'Revenue Projection', icon: BarChart3 },
  { key: 'profit', label: 'Profit Estimator', icon: DollarSign },
];

function StatusBadge({ status }) {
  const colors = { 'On Track': 'bg-green-600 text-white', 'Needs Improvement': 'bg-orange-600 text-white' };
  return <Badge label={status || ''} color={colors[status] || 'bg-[#6A6A6A] text-white'} />;
}

export default function FinancialPlanPage() {
  const { selectedIdea: savedIdea } = useIdea();
  const [activeTab, setActiveTab] = useState('budget');
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
        monetization_model: analysis?.monetization_model || '',
      };
      const res = await generateFinancialPlan(data);
      setResult(res);
      saveValue('financialPlan', res);
      setNotice('Financial plan generated.');
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
      const res = await saveFinancialPlan(result, ideaContext);
      setNotice(res.message || 'Saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  const budget = result?.budget_planner || {};
  const burnRate = result?.burn_rate || {};
  const breakEven = result?.break_even || {};
  const revenue = result?.revenue_projection || {};
  const profit = result?.profit_estimator || {};

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <AppNav />
      <main className="pt-[104px] pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">Financial Planning Hub</h1>
            <p className="text-sm text-[#6A6A6A] mt-1">Budget planning, burn rate, break-even, revenue projections & profit estimates for {selectedIdea?.startup_name || 'your startup'}</p>
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
            <DollarSign className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Generating Financial Plan...</p>
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

            {activeTab === 'budget' && (
              <div className="space-y-6">
                {budget.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{budget.overview}</p>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Monthly Budget</p>
                    <p className="text-2xl font-black">{budget.currency} {budget.monthly_budget?.total?.toLocaleString() || '—'}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Annual Budget</p>
                    <p className="text-2xl font-black">{budget.currency} {budget.annual_budget_total?.toLocaleString() || '—'}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Categories</p>
                    <p className="text-2xl font-black">{budget.monthly_budget?.categories?.length || 0}</p>
                  </div>
                </div>

                <div className="border-2 border-[#0A0A0A] bg-white">
                  <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 text-xs font-black uppercase tracking-widest">Monthly Budget Breakdown</div>
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-3 py-2 border-b border-[#0A0A0A]">Category</th><th className="text-right px-3 py-2 border-b border-[#0A0A0A]">Amount</th><th className="text-right px-3 py-2 border-b border-[#0A0A0A]">%</th><th className="text-left px-3 py-2 border-b border-[#0A0A0A]">Notes</th></tr></thead>
                    <tbody>
                      {(budget.monthly_budget?.categories || []).map((cat, i) => (
                        <tr key={i} className="border-b border-[#0A0A0A]/10">
                          <td className="px-3 py-2 font-bold">{cat.name}</td>
                          <td className="px-3 py-2 text-right font-mono">${cat.amount?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">{cat.percentage}%</td>
                          <td className="px-3 py-2 text-[#6A6A6A]">{cat.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 bg-[#F5F3EE]">
                    <div className="flex h-4 border border-[#0A0A0A] overflow-hidden">
                      {(budget.monthly_budget?.categories || []).map((cat, i) => (
                        <div key={i} className="h-full" style={{ width: `${cat.percentage}%`, backgroundColor: ['#0A0A0A', '#333', '#555', '#777', '#999', '#BBB'][i % 6] }} title={`${cat.name}: ${cat.percentage}%`} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(budget.monthly_budget?.categories || []).map((cat, i) => (
                        <span key={i} className="text-[9px] flex items-center gap-1">
                          <span className="inline-block h-2 w-2" style={{ backgroundColor: ['#0A0A0A', '#333', '#555', '#777', '#999', '#BBB'][i % 6] }} />
                          {cat.name} ({cat.percentage}%)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {budget.budget_assumptions?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Assumptions</h3>
                    <ul className="list-disc list-inside">{(budget.budget_assumptions || []).map((a, i) => <li key={i} className="text-xs text-[#6A6A6A]">{a}</li>)}</ul>
                  </div>
                )}

                {budget.cost_optimization_tips?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Cost Optimization Tips</h3>
                    <ul className="list-disc list-inside">{(budget.cost_optimization_tips || []).map((t, i) => <li key={i} className="text-xs text-[#6A6A6A]">{t}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'burn_rate' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Monthly Burn</p>
                    <p className="text-xl font-black text-red-600">${burnRate.monthly_burn_rate?.toLocaleString() || '—'}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Annual Burn</p>
                    <p className="text-xl font-black">${burnRate.annual_burn_rate?.toLocaleString() || '—'}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Runway</p>
                    <p className="text-xl font-black text-green-600">{burnRate.current_runway_months || '—'} months</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Total Raised</p>
                    <p className="text-xl font-black">${burnRate.total_funding_raised?.toLocaleString() || '—'}</p>
                  </div>
                </div>

                <div className="border-2 border-[#0A0A0A] bg-white">
                  <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 text-xs font-black uppercase tracking-widest">Burn Rate by Category</div>
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-3 py-2 border-b">Category</th><th className="text-right px-3 py-2 border-b">Monthly</th><th className="text-right px-3 py-2 border-b">Annual</th><th className="text-right px-3 py-2 border-b">%</th></tr></thead>
                    <tbody>
                      {(burnRate.burn_rate_by_category || []).map((bc, i) => (
                        <tr key={i} className="border-b border-[#0A0A0A]/10">
                          <td className="px-3 py-2 font-bold">{bc.category}</td>
                          <td className="px-3 py-2 text-right font-mono">${bc.monthly?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono">${bc.annual?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">{bc.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(burnRate.runway_scenarios || []).map((rs, i) => (
                    <div key={i} className="border-2 border-[#0A0A0A] bg-white p-4">
                      <Badge label={rs.scenario} color={
                        rs.scenario?.includes('Optimistic') ? 'bg-green-600 text-white' :
                        rs.scenario?.includes('Conservative') ? 'bg-red-600 text-white' : 'bg-[#0A0A0A] text-white'
                      } />
                      <p className="text-2xl font-black mt-2">{rs.runway_months}m</p>
                      <p className="text-xs text-[#6A6A6A] mt-1">{rs.description}</p>
                    </div>
                  ))}
                </div>

                {burnRate.burn_rate_assumptions?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Assumptions</h3>
                    <ul className="list-disc list-inside">{(burnRate.burn_rate_assumptions || []).map((a, i) => <li key={i} className="text-xs text-[#6A6A6A]">{a}</li>)}</ul>
                  </div>
                )}

                {burnRate.reduction_strategies?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Reduction Strategies</h3>
                    <ul className="list-disc list-inside">{(burnRate.reduction_strategies || []).map((s, i) => <li key={i} className="text-xs text-blue-600">{s}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'break_even' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">BE Units/Month</p>
                    <p className="text-xl font-black">{breakEven.break_even_units_monthly?.toLocaleString() || '—'}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">BE Revenue/Month</p>
                    <p className="text-xl font-black">${breakEven.break_even_revenue_monthly?.toLocaleString() || '—'}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Breakeven In</p>
                    <p className="text-xl font-black text-green-600">{breakEven.months_to_break_even || '—'} months</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Contribution Margin</p>
                    <p className="text-xl font-black">${breakEven.contribution_margin || '—'}</p>
                  </div>
                </div>

                <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-3">Breakeven Chart</h3>
                  <div className="space-y-1">
                    {(breakEven.break_even_chart || []).map((pt, i) => {
                      const maxVal = Math.max(...(breakEven.break_even_chart || []).map(p => Math.max(p.revenue || 0, p.costs || 0)), 1);
                      const revPct = (pt.revenue / maxVal) * 100;
                      const costPct = (pt.costs / maxVal) * 100;
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="font-mono w-12 font-bold">M{pt.month}</span>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-green-600 w-8">Rev</span>
                              <div className="flex-1 bg-[#E8E6E1] h-3 border border-[#0A0A0A]">
                                <div className="bg-green-600 h-full" style={{ width: `${revPct}%` }} />
                              </div>
                              <span className="font-mono w-16 text-right">${pt.revenue?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-red-600 w-8">Cost</span>
                              <div className="flex-1 bg-[#E8E6E1] h-3 border border-[#0A0A0A]">
                                <div className="bg-red-600 h-full" style={{ width: `${costPct}%` }} />
                              </div>
                              <span className="font-mono w-16 text-right">${pt.costs?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Key Metrics</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span>Fixed Costs/Month:</span><span className="font-bold">${breakEven.fixed_costs_monthly?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Variable Cost/Unit:</span><span className="font-bold">${breakEven.variable_costs_per_unit}</span></div>
                      <div className="flex justify-between"><span>Avg Revenue/Unit:</span><span className="font-bold">${breakEven.average_revenue_per_unit}</span></div>
                    </div>
                  </div>
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Sensitivity Analysis</h3>
                    <div className="space-y-2">
                      {(breakEven.sensitivity_analysis || []).map((sa, i) => (
                        <div key={i} className="p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <p className="text-xs font-bold">{sa.variable}</p>
                          <p className="text-[10px] text-[#6A6A6A]">{sa.impact}</p>
                          <p className="text-[10px] text-blue-600">{sa.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {(breakEven.assumptions || []).length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Assumptions</h3>
                    <ul className="list-disc list-inside">{(breakEven.assumptions || []).map((a, i) => <li key={i} className="text-xs text-[#6A6A6A]">{a}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="space-y-6">
                {revenue.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{revenue.overview}</p>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Year 1 Revenue</p>
                    <p className="text-xl font-black">${revenue.yearly_summary?.[0]?.total_revenue?.toLocaleString() || '—'}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Year 2 Revenue</p>
                    <p className="text-xl font-black">${revenue.yearly_summary?.[1]?.total_revenue?.toLocaleString() || '—'}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Year 3 Revenue</p>
                    <p className="text-xl font-black">${revenue.yearly_summary?.[2]?.total_revenue?.toLocaleString() || '—'}</p>
                  </div>
                </div>

                <div className="border-2 border-[#0A0A0A] bg-white">
                  <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 text-xs font-black uppercase tracking-widest">Monthly Projections</div>
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-3 py-2 border-b">Month</th><th className="text-right px-3 py-2 border-b">Users</th><th className="text-right px-3 py-2 border-b">Revenue</th><th className="text-left px-3 py-2 border-b">Growth</th><th className="text-left px-3 py-2 border-b">Notes</th></tr></thead>
                    <tbody>
                      {(revenue.monthly_projections || []).map((mp, i) => (
                        <tr key={i} className="border-b border-[#0A0A0A]/10">
                          <td className="px-3 py-2 font-bold">{mp.month === 1 ? 'Launch' : `M${mp.month}`}</td>
                          <td className="px-3 py-2 text-right">{mp.users?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono">${mp.revenue?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-[#6A6A6A]">{mp.growth_rate}</td>
                          <td className="px-3 py-2 text-[#6A6A6A]">{mp.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-[#0A0A0A] bg-white">
                    <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 text-xs font-black uppercase tracking-widest">Yearly Summary</div>
                    <table className="w-full text-xs border-collapse">
                      <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-3 py-2 border-b">Year</th><th className="text-right px-3 py-2 border-b">Revenue</th><th className="text-right px-3 py-2 border-b">Costs</th><th className="text-right px-3 py-2 border-b">Profit</th><th className="text-right px-3 py-2 border-b">Users</th></tr></thead>
                      <tbody>
                        {(revenue.yearly_summary || []).map((ys, i) => (
                          <tr key={i} className="border-b border-[#0A0A0A]/10">
                            <td className="px-3 py-2 font-bold">Y{ys.year}</td>
                            <td className="px-3 py-2 text-right font-mono">${ys.total_revenue?.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right font-mono">${ys.total_costs?.toLocaleString()}</td>
                            <td className={`px-3 py-2 text-right font-mono ${ys.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${ys.net_profit?.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right">{ys.total_users?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-2 border-[#0A0A0A] bg-white p-4">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-3">Revenue Streams</h3>
                    <div className="space-y-2">
                      {(revenue.revenue_streams || []).map((rs, i) => (
                        <div key={i} className="p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{rs.name}</span>
                            <Badge label={`${rs.percentage}%`} color="bg-[#0A0A0A] text-white" />
                          </div>
                          <div className="flex gap-4 text-[10px] text-[#6A6A6A] mt-1">
                            <span>Y1: ${rs.monthly_projection_year_1?.toLocaleString()}/mo</span>
                            <span>Y2: ${rs.monthly_projection_year_2?.toLocaleString()}/mo</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {(revenue.assumptions || []).length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Assumptions</h3>
                    <ul className="list-disc list-inside">{(revenue.assumptions || []).map((a, i) => <li key={i} className="text-xs text-[#6A6A6A]">{a}</li>)}</ul>
                  </div>
                )}

                {(revenue.risks_and_mitigations || []).length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Risks & Mitigations</h3>
                    <div className="space-y-2">
                      {(revenue.risks_and_mitigations || []).map((rm, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <Badge label={rm.impact} color={
                            rm.impact === 'High' ? 'bg-red-600 text-white' :
                            rm.impact === 'Medium' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                          } />
                          <span className="text-xs">{rm.risk}</span>
                          <span className="text-[10px] text-green-600">→ {rm.mitigation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profit' && (
              <div className="space-y-6">
                {profit.overview && <p className="text-sm text-[#6A6A6A] italic mb-2">{profit.overview}</p>}
                <div className="border-2 border-[#0A0A0A] bg-white">
                  <div className="bg-[#0A0A0A] text-[#F5F3EE] px-4 py-3 text-xs font-black uppercase tracking-widest">Monthly Profit Estimates</div>
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-[#E8E6E1]"><th className="text-left px-3 py-2 border-b">Month</th><th className="text-right px-3 py-2 border-b">Revenue</th><th className="text-right px-3 py-2 border-b">COGS</th><th className="text-right px-3 py-2 border-b">Gross Profit</th><th className="text-right px-3 py-2 border-b">OpEx</th><th className="text-right px-3 py-2 border-b">Net Profit</th><th className="text-right px-3 py-2 border-b">Margin</th></tr></thead>
                    <tbody>
                      {(profit.monthly_estimates || []).map((pe, i) => (
                        <tr key={i} className="border-b border-[#0A0A0A]/10">
                          <td className="px-3 py-2 font-bold">{pe.month === 1 ? 'Launch' : `M${pe.month}`}</td>
                          <td className="px-3 py-2 text-right font-mono">${pe.revenue?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono">${pe.cogs?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono text-green-600">${pe.gross_profit?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono">${pe.operating_expenses?.toLocaleString()}</td>
                          <td className={`px-3 py-2 text-right font-mono ${pe.net_profit >= 0 ? 'text-green-600 font-black' : 'text-red-600'}`}>${pe.net_profit?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">{pe.margin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-3">Key Ratios</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(profit.key_ratios || []).map((kr, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#F5F3EE] border border-[#0A0A0A]">
                        <div>
                          <p className="text-xs font-bold">{kr.name}</p>
                          <p className="text-[10px] text-[#6A6A6A]">Industry: {kr.industry_benchmark}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black">{kr.value}</p>
                          <StatusBadge status={kr.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {profit.profitability_timeline && (
                  <div className="p-4 border-2 border-green-600 bg-green-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-green-800 mb-1">Profitability Timeline</h3>
                    <p className="text-xs text-green-700">{profit.profitability_timeline}</p>
                  </div>
                )}

                {profit.optimization_levers?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Optimization Levers</h3>
                    <ul className="list-disc list-inside">{(profit.optimization_levers || []).map((l, i) => <li key={i} className="text-xs text-blue-600">{l}</li>)}</ul>
                  </div>
                )}

                {(profit.assumptions || []).length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Assumptions</h3>
                    <ul className="list-disc list-inside">{(profit.assumptions || []).map((a, i) => <li key={i} className="text-xs text-[#6A6A6A]">{a}</li>)}</ul>
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