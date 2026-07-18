import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, Copy, CheckCheck, Globe, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { generateMarketIntelligence, saveMarketIntelligence } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

export default function MarketIntelligencePage() {
  const { selectedIdea: savedIdea } = useIdea();
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
        location: '',
        business_model: planData.revenue_model?.pricing_model || analysis?.monetization_model || '',
        mvp_features: Array.isArray(planData.mvp_features || selectedIdea.mvp_features) ? (planData.mvp_features || selectedIdea.mvp_features) : ((planData.mvp_features || selectedIdea.mvp_features) ? [(planData.mvp_features || selectedIdea.mvp_features)] : []),
        competitors: Array.isArray(planData.competitors || selectedIdea.competitors) ? (planData.competitors || selectedIdea.competitors) : ((planData.competitors || selectedIdea.competitors) ? [(planData.competitors || selectedIdea.competitors)] : []),
        risks: Array.isArray(planData.risks || selectedIdea.risks) ? (planData.risks || selectedIdea.risks) : ((planData.risks || selectedIdea.risks) ? [(planData.risks || selectedIdea.risks)] : []),
        market_demand: analysis?.market_demand_score || 5,
        uniqueness: analysis?.uniqueness_score || 5,
        monetization_model: analysis?.monetization_model || '',
      };
      const res = await generateMarketIntelligence(data);
      setResult(res);
      saveValue('marketIntelligence', res);
      setNotice('Market intelligence report generated.');
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
      const res = await saveMarketIntelligence(result, ideaContext);
      setNotice(res.message || 'Saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  const marketSize = result?.market_size;
  const trends = result?.market_trends || [];
  const growth = result?.industry_growth;
  const opportunities = result?.emerging_opportunities || [];
  const competitors = result?.competitor_comparison || [];

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <AppNav />
      <main className="pt-[104px] pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">Market Intelligence</h1>
            <p className="text-sm text-[#6A6A6A] mt-1">Market size, trends & competition for {selectedIdea?.startup_name || 'your startup'}</p>
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
            <Globe className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Generating market intelligence...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8">
            {marketSize && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest">Market Size (TAM / SAM / SOM)</h2>
                  <CopyButton text={JSON.stringify(marketSize, null, 2)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['tam', 'sam', 'som'].map((key) => {
                    const size = marketSize[key];
                    if (!size) return null;
                    return (
                      <div key={key} className="border border-[#0A0A0A] p-4">
                        <Badge label={key.toUpperCase()} />
                        <p className="text-2xl font-black mt-2">{size.value}</p>
                        <p className="text-[10px] text-[#6A6A6A] mt-1">{size.description}</p>
                        {size.assumptions?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Assumptions:</span>
                            <ul className="list-disc list-inside mt-1">{size.assumptions.map((a, i) => <li key={i} className="text-[10px] text-[#6A6A6A]">{a}</li>)}</ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {marketSize.confidence_level && (
                  <p className="text-[10px] text-[#6A6A6A] mt-3">Confidence: <span className="font-bold">{marketSize.confidence_level}</span></p>
                )}
              </div>
            )}

            {trends.length > 0 && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest">Market Trends ({trends.length})</h2>
                  <TrendingUp className="h-4 w-4 text-[#6A6A6A]" />
                </div>
                <div className="grid gap-3">
                  {trends.map((trend, i) => (
                    <div key={i} className="border border-[#0A0A0A] p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge label={trend.priority || 'Medium'} color={trend.priority === 'High' ? 'bg-red-600 text-white' : trend.priority === 'Low' ? 'bg-green-600 text-white' : 'bg-[#0A0A0A] text-white'} />
                        <span className="text-xs font-bold">{trend.trend}</span>
                      </div>
                      <p className="text-[10px] text-[#6A6A6A]">{trend.description}</p>
                      {trend.impact_on_startup && <p className="text-[10px] text-[#6A6A6A] mt-1"><span className="font-bold">Impact:</span> {trend.impact_on_startup}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {growth && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest">Industry Growth</h2>
                  <BarChart3 className="h-4 w-4 text-[#6A6A6A]" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {growth.annual_growth_rate && (
                    <div className="p-2 bg-[#F5F3EE] border border-[#0A0A0A]">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Annual Growth</span>
                      <p className="text-lg font-black">{growth.annual_growth_rate}</p>
                    </div>
                  )}
                  {growth.five_year_outlook && (
                    <div className="p-2 bg-[#F5F3EE] border border-[#0A0A0A] col-span-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">5-Year Outlook</span>
                      <p className="text-xs text-[#0A0A0A] mt-1">{growth.five_year_outlook}</p>
                    </div>
                  )}
                </div>
                {growth.growth_drivers?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Growth Drivers:</span>
                    <div className="flex flex-wrap gap-1 mt-1">{growth.growth_drivers.map((d, i) => <Badge key={i} label={d} color="bg-green-600 text-white" />)}</div>
                  </div>
                )}
                {growth.market_limitations?.length > 0 && (
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Limitations:</span>
                    <div className="flex flex-wrap gap-1 mt-1">{growth.market_limitations.map((l, i) => <Badge key={i} label={l} color="bg-red-600 text-white" />)}</div>
                  </div>
                )}
              </div>
            )}

            {opportunities.length > 0 && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest">Emerging Opportunities ({opportunities.length})</h2>
                  <Zap className="h-4 w-4 text-[#6A6A6A]" />
                </div>
                <div className="grid gap-3">
                  {opportunities.map((opp, i) => (
                    <div key={i} className="border border-[#0A0A0A] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge label={opp.impact || 'Medium'} color={opp.impact === 'High' ? 'bg-green-600 text-white' : 'bg-[#0A0A0A] text-white'} />
                        <Badge label={opp.feasibility || 'Medium'} color="bg-[#E8E6E1] text-[#0A0A0A]" />
                        <span className="text-xs font-bold">{opp.opportunity}</span>
                      </div>
                      <p className="text-[10px] text-[#6A6A6A]">{opp.description}</p>
                      {opp.how_to_capitalize && <p className="text-[10px] text-[#6A6A6A] mt-1"><span className="font-bold">How to capitalize:</span> {opp.how_to_capitalize}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {competitors.length > 0 && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest">Competitor Comparison ({competitors.length})</h2>
                  <CopyButton text={JSON.stringify(competitors, null, 2)} />
                </div>
                <div className="grid gap-3">
                  {competitors.map((comp, i) => (
                    <div key={i} className="border border-[#0A0A0A] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black">{comp.competitor_name}</span>
                        {comp.pricing_model && <Badge label={comp.pricing_model} color="bg-[#E8E6E1] text-[#0A0A0A]" />}
                      </div>
                      {comp.features?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">{comp.features.map((f, j) => <Badge key={j} label={f} color="bg-[#0A0A0A] text-white" />)}</div>
                      )}
                      {comp.strengths?.length > 0 && <p className="text-[10px] text-green-700"><span className="font-bold">Strengths:</span> {comp.strengths.join(', ')}</p>}
                      {comp.weaknesses?.length > 0 && <p className="text-[10px] text-red-600"><span className="font-bold">Weaknesses:</span> {comp.weaknesses.join(', ')}</p>}
                      {comp.differentiation_opportunity && <p className="text-[10px] text-blue-600 mt-1"><span className="font-bold">Your opportunity:</span> {comp.differentiation_opportunity}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
