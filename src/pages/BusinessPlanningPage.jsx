import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, Copy, CheckCheck, Briefcase, DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { generateBusinessPlan, saveBusinessPlan } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

const TABS = [
  { key: 'bmc', label: 'Business Model Canvas', icon: Briefcase },
  { key: 'lean', label: 'Lean Canvas', icon: PieChart },
  { key: 'revenue', label: 'Revenue Forecast', icon: TrendingUp },
  { key: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
];

export default function BusinessPlanningPage() {
  const { selectedIdea: savedIdea } = useIdea();
  const [activeTab, setActiveTab] = useState('bmc');
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
        target_users: Array.isArray(selectedIdea.target_users) ? selectedIdea.target_users : (selectedIdea.target_users ? [selectedIdea.target_users] : []),
        industry: profile?.preferred_industry || '',
        mvp_features: Array.isArray(planData.mvp_features || selectedIdea.mvp_features) ? (planData.mvp_features || selectedIdea.mvp_features) : ((planData.mvp_features || selectedIdea.mvp_features) ? [(planData.mvp_features || selectedIdea.mvp_features)] : []),
        competitors: Array.isArray(planData.competitors || selectedIdea.competitors) ? (planData.competitors || selectedIdea.competitors) : ((planData.competitors || selectedIdea.competitors) ? [(planData.competitors || selectedIdea.competitors)] : []),
        risks: Array.isArray(planData.risks || selectedIdea.risks) ? (planData.risks || selectedIdea.risks) : ((planData.risks || selectedIdea.risks) ? [(planData.risks || selectedIdea.risks)] : []),
        market_demand: analysis?.market_demand_score || 5,
        uniqueness: analysis?.uniqueness_score || 5,
        feasibility: analysis?.feasibility_score || 5,
        revenue_potential: analysis?.revenue_potential_score || 5,
        monetization_model: analysis?.monetization_model || '',
        revenue_model_type: planData.revenue_model?.pricing_model || '',
      };
      const res = await generateBusinessPlan(data);
      setResult(res);
      saveValue('businessPlan', res);
      setNotice('Business plan generated.');
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
      const res = await saveBusinessPlan(result, ideaContext);
      setNotice(res.message || 'Saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  const bmc = result?.business_model_canvas;
  const lean = result?.lean_canvas;
  const revenue = result?.revenue_forecast;
  const pricing = result?.pricing_strategy;

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <AppNav />
      <main className="pt-[104px] pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">Business Planning</h1>
            <p className="text-sm text-[#6A6A6A] mt-1">Business Model Canvas, Lean Canvas & revenue projections for {selectedIdea?.startup_name || 'your startup'}</p>
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
            <Briefcase className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Generating business plan...</p>
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

            {activeTab === 'bmc' && bmc && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(bmc).filter(([k]) => k !== 'customer_segments' || true).map(([key, value]) => (
                  <div key={key} className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">{key.replace(/_/g, ' ')}</h3>
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {value.map((item, i) => <li key={i} className="text-xs text-[#0A0A0A]">{item}</li>)}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#0A0A0A]">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'lean' && lean && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(lean).map(([key, value]) => (
                  <div key={key} className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">{key.replace(/_/g, ' ')}</h3>
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {value.map((item, i) => <li key={i} className="text-xs text-[#0A0A0A]">{item}</li>)}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#0A0A0A]">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'revenue' && revenue && (
              <div className="space-y-6">
                {['year_1', 'year_2', 'year_3'].map((year) => {
                  const yr = revenue[year];
                  if (!yr) return null;
                  return (
                    <div key={year} className="p-4 border-2 border-[#0A0A0A] bg-white">
                      <h3 className="text-sm font-black uppercase tracking-widest mb-3">{year.replace('_', ' ')}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Revenue</span>
                          <p className="text-lg font-black">${yr.total_revenue?.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Customers</span>
                          <p className="text-lg font-black">{yr.estimated_customers}</p>
                        </div>
                        <div className="p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Avg Revenue</span>
                          <p className="text-lg font-black">${yr.avg_revenue_per_customer}</p>
                        </div>
                        <div className="p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Growth</span>
                          <p className="text-lg font-black">{yr.growth_rate}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {revenue.growth_assumptions?.length > 0 && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-2">Growth Assumptions</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {revenue.growth_assumptions.map((a, i) => <li key={i} className="text-xs text-[#6A6A6A]">{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pricing' && pricing && (
              <div className="space-y-6">
                {pricing.recommended_model && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-2">Recommended Model</h3>
                    <Badge label={pricing.recommended_model} />
                  </div>
                )}
                {pricing.tiers?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pricing.tiers.map((tier, i) => (
                      <div key={i} className="p-4 border-2 border-[#0A0A0A] bg-white">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-2">{tier.name}</h3>
                        <p className="text-2xl font-black mb-2">${tier.price}</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {tier.features.map((f, j) => <li key={j} className="text-[10px] text-[#6A6A6A]">{f}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {pricing.justification && (
                  <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-2">Justification</h3>
                    <p className="text-xs text-[#6A6A6A]">{pricing.justification}</p>
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
