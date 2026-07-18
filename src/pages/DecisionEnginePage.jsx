import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, Copy, CheckCheck, Brain, AlertTriangle, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { generateDecisionEngine, saveDecisionReport } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

export default function DecisionEnginePage() {
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
        mvp_features: Array.isArray(planData.mvp_features || selectedIdea.mvp_features) ? (planData.mvp_features || selectedIdea.mvp_features) : ((planData.mvp_features || selectedIdea.mvp_features) ? [(planData.mvp_features || selectedIdea.mvp_features)] : []),
        competitors: Array.isArray(planData.competitors || selectedIdea.competitors) ? (planData.competitors || selectedIdea.competitors) : ((planData.competitors || selectedIdea.competitors) ? [(planData.competitors || selectedIdea.competitors)] : []),
        risks: Array.isArray(planData.risks || selectedIdea.risks) ? (planData.risks || selectedIdea.risks) : ((planData.risks || selectedIdea.risks) ? [(planData.risks || selectedIdea.risks)] : []),
        market_demand: analysis?.market_demand_score || 5,
        uniqueness: analysis?.uniqueness_score || 5,
        feasibility: analysis?.feasibility_score || 5,
        revenue_potential: analysis?.revenue_potential_score || 5,
      };
      const res = await generateDecisionEngine(data);
      setResult(res);
      saveValue('decisionEngine', res);
      setNotice('Decision engine report generated.');
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
      const res = await saveDecisionReport(result, ideaContext);
      setNotice(res.message || 'Saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  const decision = result?.recommendation?.decision;
  const risk = result?.risk_analysis;
  const prob = result?.success_probability;

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <AppNav />
      <main className="pt-[104px] pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">Decision Engine</h1>
            <p className="text-sm text-[#6A6A6A] mt-1">Go / Pivot / Drop analysis for {selectedIdea?.startup_name || 'your startup'}</p>
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
            <Brain className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Running decision engine analysis...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8">
            {decision && (
              <div className={`p-8 border-2 border-[#0A0A0A] text-center ${decision === 'Go' ? 'bg-green-50' : decision === 'Pivot' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {decision === 'Go' && <CheckCircle className="h-12 w-12 text-green-600" />}
                  {decision === 'Pivot' && <AlertTriangle className="h-12 w-12 text-yellow-600" />}
                  {decision === 'Drop' && <XCircle className="h-12 w-12 text-red-600" />}
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">{decision}</h2>
                {result.recommendation?.explanation && (
                  <p className="text-sm text-[#6A6A6A] mt-3 max-w-2xl mx-auto">{result.recommendation.explanation}</p>
                )}
              </div>
            )}

            {prob && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest">Success Probability</h2>
                  <BarChart3 className="h-4 w-4 text-[#6A6A6A]" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-[#0A0A0A]">{prob.percentage}%</div>
                  <p className="text-xs text-[#6A6A6A] flex-1">{prob.reason}</p>
                </div>
              </div>
            )}

            {risk && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest">Risk Analysis</h2>
                  <Badge label={risk.overall_risk_level} color={risk.overall_risk_level === 'Low' ? 'bg-green-600 text-white' : risk.overall_risk_level === 'Medium' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {risk.key_business_risks?.length > 0 && (
                    <div className="p-3 bg-[#F5F3EE] border border-[#0A0A0A]">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Business Risks</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {risk.key_business_risks.map((r, i) => <li key={i} className="text-xs text-[#0A0A0A]">{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {risk.technical_risks?.length > 0 && (
                    <div className="p-3 bg-[#F5F3EE] border border-[#0A0A0A]">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Technical Risks</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {risk.technical_risks.map((r, i) => <li key={i} className="text-xs text-[#0A0A0A]">{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {risk.market_risks?.length > 0 && (
                    <div className="p-3 bg-[#F5F3EE] border border-[#0A0A0A]">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Market Risks</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {risk.market_risks.map((r, i) => <li key={i} className="text-xs text-[#0A0A0A]">{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {risk.financial_risks?.length > 0 && (
                    <div className="p-3 bg-[#F5F3EE] border border-[#0A0A0A]">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Financial Risks</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {risk.financial_risks.map((r, i) => <li key={i} className="text-xs text-[#0A0A0A]">{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.recommendation?.action_steps?.length > 0 && (
              <div className="p-4 border-2 border-[#0A0A0A] bg-white">
                <h2 className="text-sm font-black uppercase tracking-widest mb-3">Action Steps</h2>
                <ol className="list-decimal list-inside space-y-2">
                  {result.recommendation.action_steps.map((step, i) => (
                    <li key={i} className="text-xs text-[#0A0A0A]">{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
