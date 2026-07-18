import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, ArrowRight, Rocket, FileText, TrendingUp, DollarSign, BarChart3, Target, Lightbulb, AlertTriangle, Check, Copy, CheckCheck, Layers, Download } from 'lucide-react';
import { generateInvestorTools, saveInvestorTools } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

const TABS = [
  { key: 'pitch_deck', label: 'Pitch Deck', icon: Layers },
  { key: 'elevator_pitch', label: 'Elevator Pitch', icon: TrendingUp },
  { key: 'executive_summary', label: 'Executive Summary', icon: FileText },
  { key: 'readiness_score', label: 'Readiness Score', icon: BarChart3 },
  { key: 'funding', label: 'Funding Recommendation', icon: DollarSign },
];

function LoadingSkeleton({ title }) {
  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-[#F5F3EE] w-1/3" />
        <div className="h-3 bg-[#F5F3EE] w-full" />
        <div className="h-3 bg-[#F5F3EE] w-5/6" />
        <div className="h-3 bg-[#F5F3EE] w-4/6" />
      </div>
    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div className="border-2 border-[#0A0A0A] bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">{label}</span>
        <span className="text-sm font-black">{value}/100</span>
      </div>
      <div className="h-3 border-2 border-[#0A0A0A] bg-[#F5F3EE]">
        <div className="h-full bg-[#0A0A0A] transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export default function InvestorToolsPage() {
  const { selectedIdea: savedIdea } = useIdea();
  const [activeTab, setActiveTab] = useState('pitch_deck');
  const [result, setResult] = useState(readValue('investorTools')); // fallback read, won't cause issues
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
        target_users: selectedIdea.target_users,
        industry: profile?.preferred_industry || '',
        location: '',
        business_model: planData.revenue_model?.pricing_model || analysis?.monetization_model || '',
        mvp_features: planData.mvp_features || selectedIdea.mvp_features || [],
        competitors: planData.competitors || selectedIdea.competitors || [],
        market_demand: Number(analysis?.market_demand_score || 0),
        uniqueness: Number(analysis?.uniqueness_score || 0),
        feasibility: Number(analysis?.feasibility_score || 0),
        revenue_potential: Number(analysis?.revenue_potential_score || 0),
        risks: planData.risks || analysis?.risks || [],
        monetization_model: analysis?.monetization_model || '',
      };
      const res = await generateInvestorTools(data);
      setResult(res);
      saveValue('investorTools', res);
      setNotice('Investor tools generated.');
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
    if (!getSession()?.token) {
      setError('Sign in to save to your dashboard.');
      return;
    }
    setSaving(true);
    try {
      const ideaContext = {
        startup_name: selectedIdea.startup_name,
        pitch: selectedIdea.pitch,
        industry: profile?.preferred_industry || '',
      };
      const res = await saveInvestorTools(result, ideaContext);
      setNotice(res.message || 'Saved.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-2">Investor Tools</p>
              <h1 className="text-4xl font-black uppercase leading-none">Fundraising Materials</h1>
            </div>
            <div className="flex gap-3">
              {result && (
                <button onClick={handleSave} disabled={saving} className="h-10 px-4 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50">
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                </button>
              )}
              <button onClick={handleGenerate} disabled={loading} className="h-10 px-4 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
                {loading ? <><span className="h-3 w-3 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Tools</>}
              </button>
              <Link to="/results" className="h-10 px-4 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
                <ArrowRight className="h-4 w-4" /> Results
              </Link>
            </div>
          </div>

          <IdeaSelector />

          {!selectedIdea && (
            <div className="border-2 border-[#0A0A0A] bg-white p-8 text-center">
              <Rocket className="h-8 w-8 mx-auto mb-3 text-[#C0BDB6]" />
              <p className="text-sm font-black uppercase mb-2">No Startup Selected</p>
              <p className="text-xs text-[#6A6A6A] mb-4">Generate and select a startup idea first.</p>
              <Link to="/results" className="h-10 px-6 inline-flex items-center bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] border-2 border-[#0A0A0A] transition-colors">Go to Results</Link>
            </div>
          )}

          {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">{error}</p>}
          {notice && <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">{notice}</p>}

          {selectedIdea && (
            <div className="mb-6 border-2 border-[#0A0A0A] bg-white p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Context: {selectedIdea.startup_name}</p>
              <p className="text-xs text-[#3A3A3A]">{selectedIdea.pitch}</p>
            </div>
          )}

          {loading && <LoadingSkeleton title="Generating investor materials..." />}

          {result && !loading && (
            <>
              <div className="flex flex-wrap gap-1 border-2 border-[#0A0A0A] bg-white p-1 mb-8">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-colors flex-1 justify-center ${isActive ? 'bg-[#0A0A0A] text-[#F5F3EE]' : 'bg-white text-[#0A0A0A] hover:bg-[#F5F3EE]'}`}>
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Pitch Deck */}
              {activeTab === 'pitch_deck' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Pitch Deck</h2>
                    <CopyButton text={JSON.stringify(result.pitch_deck?.slides?.map(s => s.content).join('\n\n') || '', null, 2)} />
                  </div>
                  <div className="space-y-3">
                    {(result.pitch_deck?.slides || []).map((slide) => (
                      <div key={slide.slide_number} className="border-2 border-[#0A0A0A] bg-white p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[9px] font-black border-2 border-[#0A0A0A] px-2 py-1 leading-none">Slide {slide.slide_number}</span>
                          <h3 className="text-sm font-black uppercase">{slide.title}</h3>
                        </div>
                        <p className="text-sm text-[#3A3A3A] leading-relaxed mb-3">{slide.content}</p>
                        <div className="border-t border-[#0A0A0A]/10 pt-3">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Visual: <span className="text-[#3A3A3A] font-medium normal-case tracking-normal">{slide.visual_suggestion}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Elevator Pitch */}
              {activeTab === 'elevator_pitch' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Elevator Pitch</h2>
                    <CopyButton text={`${result.elevator_pitch?.short_pitch || ''}\n\n${result.elevator_pitch?.full_pitch || ''}\n\nKey: ${result.elevator_pitch?.key_message || ''}`} />
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">30-Second Pitch</p>
                    <p className="text-base font-medium text-[#0A0A0A] leading-relaxed">{result.elevator_pitch?.short_pitch}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">60-Second Pitch</p>
                    <p className="text-sm text-[#3A3A3A] leading-relaxed">{result.elevator_pitch?.full_pitch}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#F5F3EE]/60 mb-2">Key Message</p>
                    <p className="text-base font-black uppercase text-[#F5F3EE]">{result.elevator_pitch?.key_message}</p>
                  </div>
                </div>
              )}

              {/* Executive Summary */}
              {activeTab === 'executive_summary' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Executive Summary</h2>
                    <CopyButton text={[
                      `Problem: ${result.executive_summary?.problem || ''}`,
                      `Solution: ${result.executive_summary?.solution || ''}`,
                      `Target Market: ${result.executive_summary?.target_market || ''}`,
                      `Business Model: ${result.executive_summary?.business_model || ''}`,
                      `Competitive Advantage: ${result.executive_summary?.competitive_advantage || ''}`,
                      `Revenue Potential: ${result.executive_summary?.revenue_potential || ''}`,
                      `Next Steps: ${result.executive_summary?.next_steps || ''}`,
                    ].join('\n\n')} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Problem</p>
                      <p className="text-sm text-[#3A3A3A] leading-relaxed">{result.executive_summary?.problem}</p>
                    </div>
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Solution</p>
                      <p className="text-sm text-[#3A3A3A] leading-relaxed">{result.executive_summary?.solution}</p>
                    </div>
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Target Market</p>
                      <p className="text-sm text-[#3A3A3A] leading-relaxed">{result.executive_summary?.target_market}</p>
                    </div>
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Business Model</p>
                      <p className="text-sm text-[#3A3A3A] leading-relaxed">{result.executive_summary?.business_model}</p>
                    </div>
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Competitive Advantage</p>
                      <p className="text-sm text-[#3A3A3A] leading-relaxed">{result.executive_summary?.competitive_advantage}</p>
                    </div>
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Revenue Potential</p>
                      <p className="text-sm text-[#3A3A3A] leading-relaxed">{result.executive_summary?.revenue_potential}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Risks</p>
                      <ul className="text-sm text-[#3A3A3A] space-y-1">
                        {(result.executive_summary?.risks || []).map((r, i) => <li key={i}>&bull; {r}</li>)}
                      </ul>
                    </div>
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Next Steps</p>
                      <p className="text-sm text-[#3A3A3A] leading-relaxed">{result.executive_summary?.next_steps}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Readiness Score */}
              {activeTab === 'readiness_score' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Investment Readiness Score</h2>
                    <CopyButton text={JSON.stringify(result.readiness_score || {}, null, 2)} />
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] p-6 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#F5F3EE]/60 mb-2">Overall Readiness</p>
                    <p className="text-6xl font-black text-[#F5F3EE]">{result.readiness_score?.overall_score || 0}</p>
                    <p className="text-xs text-[#F5F3EE]/60 mt-2">/ 100</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <ScoreBar label="Market Demand" value={result.readiness_score?.market_demand_score || 0} />
                    <ScoreBar label="Uniqueness" value={result.readiness_score?.uniqueness_score || 0} />
                    <ScoreBar label="Feasibility" value={result.readiness_score?.feasibility_score || 0} />
                    <ScoreBar label="Revenue Potential" value={result.readiness_score?.revenue_potential_score || 0} />
                    <ScoreBar label="Traction" value={result.readiness_score?.traction_score || 0} />
                    <ScoreBar label="Team Readiness" value={result.readiness_score?.team_readiness_score || 0} />
                    <ScoreBar label="Financial Clarity" value={result.readiness_score?.financial_clarity_score || 0} />
                    <ScoreBar label="Risk Management" value={result.readiness_score?.risk_management_score || 0} />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="border-2 border-green-500 bg-green-50 p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-green-600 mb-2 flex items-center gap-1"><Check className="h-3 w-3" /> Strengths</p>
                      <ul className="text-xs text-green-700 space-y-1">
                        {(result.readiness_score?.strengths || []).map((s, i) => <li key={i}>&bull; {s}</li>)}
                      </ul>
                    </div>
                    <div className="border-2 border-red-500 bg-red-50 p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-600 mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Weaknesses</p>
                      <ul className="text-xs text-red-700 space-y-1">
                        {(result.readiness_score?.weaknesses || []).map((w, i) => <li key={i}>&bull; {w}</li>)}
                      </ul>
                    </div>
                    <div className="border-2 border-yellow-500 bg-yellow-50 p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-yellow-600 mb-2 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Improvements</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        {(result.readiness_score?.improvement_suggestions || []).map((s, i) => <li key={i}>&bull; {s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Funding Recommendation */}
              {activeTab === 'funding' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Funding Recommendation</h2>
                    <CopyButton text={JSON.stringify(result.funding_recommendation || {}, null, 2)} />
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-6 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Recommended Funding Type</p>
                    <p className="text-2xl font-black uppercase">{result.funding_recommendation?.recommended_type}</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Amount Range</p>
                      <p className="text-lg font-black">{result.funding_recommendation?.amount_range || 'N/A'}</p>
                    </div>
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Equity to Offer</p>
                      <p className="text-lg font-black">{result.funding_recommendation?.equity_to_offer || 'N/A'}</p>
                    </div>
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Ideal Investors</p>
                      <ul className="text-xs text-[#3A3A3A] space-y-0.5 mt-1">
                        {(result.funding_recommendation?.ideal_investor_types || []).map((t, i) => <li key={i}>&bull; {t}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Why This Fits</p>
                    <p className="text-sm text-[#3A3A3A] leading-relaxed">{result.funding_recommendation?.explanation}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Preparation Steps</p>
                      <ul className="text-sm text-[#3A3A3A] space-y-1">
                        {(result.funding_recommendation?.preparation_steps || []).map((s, i) => <li key={i}>&bull; {s}</li>)}
                      </ul>
                    </div>
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Milestones Before Fundraising</p>
                      <ul className="text-sm text-[#3A3A3A] space-y-1">
                        {(result.funding_recommendation?.milestones_to_reach_before_fundraising || []).map((m, i) => <li key={i}>&bull; {m}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}