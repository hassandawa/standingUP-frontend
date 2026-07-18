import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Sparkles, Save, ArrowRight, Rocket, FileText, Lightbulb, Image, Quote, Share2, Search, Copy, CheckCheck } from 'lucide-react';
import { generateMarketingHub, saveMarketingHub } from '../services/api.js';
import { getSession, readValue, saveValue } from '../services/storage.js';
import IdeaSelector from '../components/IdeaSelector.jsx';
import { useIdea } from '../contexts/IdeaContext.jsx';
import { CopyButton, Badge } from '../components/SharedUI.jsx';

const TABS = [
  { key: 'landing_page', label: 'Landing Page', icon: FileText },
  { key: 'brand_names', label: 'Brand Names', icon: Lightbulb },
  { key: 'logo_ideas', label: 'Logo Ideas', icon: Image },
  { key: 'taglines', label: 'Taglines', icon: Quote },
  { key: 'social_media', label: 'Social Launch', icon: Share2 },
  { key: 'seo', label: 'SEO Keywords', icon: Search },
];

export default function MarketingHubPage() {
  const { selectedIdea: savedIdea } = useIdea();
  const [activeTab, setActiveTab] = useState('landing_page');
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
        target_users: selectedIdea.target_users,
        industry: profile?.preferred_industry || '',
        location: '',
        business_model: planData.revenue_model?.pricing_model || analysis?.monetization_model || '',
        mvp_features: planData.mvp_features || selectedIdea.mvp_features || [],
        competitors: planData.competitors || selectedIdea.competitors || [],
        market_demand: Number(analysis?.market_demand_score || 0),
        uniqueness: Number(analysis?.uniqueness_score || 0),
        feasibility: Number(analysis?.feasibility_score || 0),
        risks: planData.risks || analysis?.risks || [],
        monetization_model: analysis?.monetization_model || '',
      };
      const res = await generateMarketingHub(data);
      setResult(res);
      saveValue('marketingHub', res);
      setNotice('Marketing assets generated.');
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
      const res = await saveMarketingHub(result, ideaContext);
      setNotice(res.message || 'Saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  const lpc = result?.landing_page_copy || {};
  const brandNames = result?.brand_names || [];
  const logoIdeas = result?.logo_ideas || [];
  const taglines = result?.taglines || {};
  const social = result?.social_media_launch || {};
  const seo = result?.seo_keywords || {};

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-2">Marketing Hub</p>
              <h1 className="text-4xl font-black uppercase leading-none">Brand & Marketing Assets</h1>
            </div>
            <div className="flex gap-3">
              {result && (
                <button onClick={handleSave} disabled={saving} className="h-10 px-4 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50">
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                </button>
              )}
              <button onClick={handleGenerate} disabled={loading} className="h-10 px-4 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors disabled:opacity-50">
                {loading ? <><span className="h-3 w-3 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate</>}
              </button>
              <Link to="/results" className="h-10 px-4 border-2 border-[#0A0A0A] bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors"><ArrowRight className="h-4 w-4" /> Results</Link>
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

          {loading && (
            <div className="border-2 border-[#0A0A0A] bg-white p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-[#F5F3EE] w-1/3" />
                <div className="h-3 bg-[#F5F3EE] w-full" />
                <div className="h-3 bg-[#F5F3EE] w-5/6" />
                <div className="h-3 bg-[#F5F3EE] w-4/6" />
              </div>
            </div>
          )}

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

              {/* Landing Page Copy */}
              {activeTab === 'landing_page' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Landing Page Copy</h2>
                    <CopyButton text={`Headline: ${lpc.hero_headline || ''}\nSubheadline: ${lpc.subheadline || ''}\n\nValue Proposition: ${lpc.value_proposition || ''}`} />
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] p-6 text-center">
                    <p className="text-3xl font-black text-[#F5F3EE] mb-2">{lpc.hero_headline}</p>
                    <p className="text-sm text-[#F5F3EE]/80">{lpc.subheadline}</p>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Value Proposition</p>
                    <p className="text-sm text-[#3A3A3A] leading-relaxed">{lpc.value_proposition}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(lpc.key_features || []).map((f, i) => (
                      <div key={i} className="border-2 border-[#0A0A0A] bg-white p-5">
                        <p className="text-xs font-black uppercase mb-1">{f.feature}</p>
                        <p className="text-xs text-[#3A3A3A] leading-relaxed">{f.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Benefits</p>
                    <ul className="text-sm text-[#3A3A3A] space-y-1">{(lpc.benefits || []).map((b, i) => <li key={i}>&bull; {b}</li>)}</ul>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Social Proof</p>
                      <p className="text-xs italic text-[#3A3A3A] mb-2">"{lpc.social_proof?.testimonial_placeholder}"</p>
                      <p className="text-xs font-bold text-[#0A0A0A]">{lpc.social_proof?.stat_placeholder}</p>
                      <div className="flex flex-wrap gap-1 mt-2">{(lpc.social_proof?.trust_badges || []).map((b, i) => <Badge key={i} label={b} />)}</div>
                    </div>
                    <div className="space-y-3">
                      <div className="border-2 border-[#0A0A0A] bg-white p-5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">CTA</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs font-black border-2 border-[#0A0A0A] px-4 py-2 bg-[#0A0A0A] text-[#F5F3EE]">{lpc.cta?.primary_cta}</span>
                          <span className="text-xs font-black border-2 border-[#0A0A0A] px-4 py-2">{lpc.cta?.secondary_cta}</span>
                        </div>
                        <p className="text-[10px] text-[#6A6A6A]">{lpc.cta?.cta_description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">FAQs</p>
                    <div className="space-y-2">{(lpc.faqs || []).map((faq, i) => (
                      <div key={i} className="border-b border-[#0A0A0A]/10 pb-2">
                        <p className="text-xs font-bold">{faq.question}</p>
                        <p className="text-xs text-[#3A3A3A]">{faq.answer}</p>
                      </div>
                    ))}</div>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] p-4 text-center">
                    <p className="text-xs text-[#F5F3EE]">{lpc.footer?.tagline}</p>
                    <p className="text-[9px] text-[#F5F3EE]/60 mt-1">{lpc.footer?.copyright}</p>
                  </div>
                </div>
              )}

              {/* Brand Names */}
              {activeTab === 'brand_names' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Brand Name Ideas</h2>
                    <CopyButton text={brandNames.map(n => `${n.name} — ${n.style}`).join('\n')} />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {brandNames.map((bn, i) => (
                      <div key={i} className="border-2 border-[#0A0A0A] bg-white p-5">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-lg font-black uppercase">{bn.name}</p>
                          <Badge label={bn.style} />
                        </div>
                        <p className="text-xs text-[#3A3A3A] leading-relaxed mb-2">{bn.explanation}</p>
                        <div className="flex gap-2">
                          {bn.is_memorable && <Badge label="Memorable" color="bg-green-100 text-green-700 border border-green-500" />}
                          {bn.is_scalable && <Badge label="Scalable" color="bg-blue-100 text-blue-700 border border-blue-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logo Ideas */}
              {activeTab === 'logo_ideas' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Logo Concepts</h2>
                    <CopyButton text={logoIdeas.map(l => `${l.style}: ${l.icon_suggestion}`).join('\n\n')} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {logoIdeas.map((logo, i) => (
                      <div key={i} className="border-2 border-[#0A0A0A] bg-white p-5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Style</p>
                        <p className="text-sm font-black uppercase mb-3">{logo.style}</p>
                        <div className="flex gap-2 mb-3">
                          {(logo.colors || []).map((c, ci) => (
                            <span key={ci} className="h-8 w-8 border-2 border-[#0A0A0A]" style={{ backgroundColor: c }} title={c} />
                          ))}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Typography</p>
                        <p className="text-xs text-[#3A3A3A] mb-3">{logo.typography}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Icon</p>
                        <p className="text-xs text-[#3A3A3A] mb-3">{logo.icon_suggestion}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">Personality</p>
                        <p className="text-xs text-[#3A3A3A] mb-3">{logo.brand_personality}</p>
                        <div className="border-t border-[#0A0A0A]/10 pt-3">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">AI Image Prompt</p>
                          <p className="text-[10px] text-[#3A3A3A] italic leading-relaxed">{logo.ai_image_prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Taglines */}
              {activeTab === 'taglines' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Taglines</h2>
                    <CopyButton text={Object.entries(taglines).map(([cat, lines]) => `${cat.toUpperCase()}:\n${lines.map(l => `  • ${l}`).join('\n')}`).join('\n\n')} />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(taglines).map(([category, lines]) => (
                      <div key={category} className="border-2 border-[#0A0A0A] bg-white p-5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-3">{category.replace('_', ' ')}</p>
                        <ul className="space-y-1.5">{(lines || []).map((t, i) => <li key={i} className="text-sm font-medium text-[#0A0A0A]">&ldquo;{t}&rdquo;</li>)}</ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Media Launch */}
              {activeTab === 'social_media' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">Social Media Launch Plan</h2>
                    <CopyButton text={((social.platforms || []).map(p => `${p.platform}:\n${(p.content_ideas || []).map(c => `  Day ${c.day}: ${c.post_type} — ${c.content}`).join('\n')}`).join('\n\n'))} />
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Strategy Overview</p>
                    <p className="text-sm text-[#3A3A3A] leading-relaxed">{social.strategy_overview}</p>
                  </div>
                  <div className="space-y-3">
                    {(social.platforms || []).map((platform, i) => (
                      <div key={i} className="border-2 border-[#0A0A0A] bg-white p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-black uppercase">{platform.platform}</h3>
                          <div className="flex gap-2">
                            <Badge label={platform.posting_frequency} />
                          </div>
                        </div>
                        <div className="overflow-x-auto mb-3">
                          <table className="w-full text-xs">
                            <thead><tr className="border-b-2 border-[#0A0A0A]">
                              <th className="text-left py-2 font-black uppercase tracking-widest pr-4">Day</th>
                              <th className="text-left py-2 font-black uppercase tracking-widest pr-4">Type</th>
                              <th className="text-left py-2 font-black uppercase tracking-widest pr-4">Content</th>
                              <th className="text-left py-2 font-black uppercase tracking-widest">Hashtags</th>
                            </tr></thead>
                            <tbody>{(platform.content_ideas || []).map((post, pi) => (
                              <tr key={pi} className="border-t border-[#0A0A0A]/10">
                                <td className="py-2 pr-4 font-black">D{post.day}</td>
                                <td className="py-2 pr-4 font-bold">{post.post_type}</td>
                                <td className="py-2 pr-4 text-[#3A3A3A]">{post.content}</td>
                                <td className="py-2 text-[#6A6A6A]">{(post.hashtags || []).join(' ')}</td>
                              </tr>
                            ))}</tbody>
                          </table>
                        </div>
                        <p className="text-[10px] text-[#6A6A6A] italic">{platform.engagement_strategy}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#F5F3EE]/60 mb-2">Launch Day Checklist</p>
                    <ul className="text-xs text-[#F5F3EE] space-y-1">{(social.launch_day_checklist || []).map((item, i) => <li key={i} className="flex gap-2"><span className="text-[#F5F3EE]/60 font-black">{i + 1}.</span> {item}</li>)}</ul>
                  </div>
                </div>
              )}

              {/* SEO Keywords */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase">SEO Keywords</h2>
                    <CopyButton text={[
                      'PRIMARY KEYWORDS:',
                      ...(seo.primary_keywords || []).map(k => `  ${k.keyword} (${k.search_intent}, ${k.difficulty}) — ${k.content_idea}`),
                      '',
                      'SECONDARY KEYWORDS:',
                      ...(seo.secondary_keywords || []).map(k => `  ${k.keyword} (${k.search_intent}) — ${k.content_idea}`),
                      '',
                      'LONG-TAIL KEYWORDS:',
                      ...(seo.long_tail_keywords || []).map(k => `  ${k.keyword} (${k.search_intent}) — ${k.content_idea}`),
                    ].join('\n')} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="border-2 border-[#0A0A0A] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-3">Primary Keywords</p>
                      {(seo.primary_keywords || []).map((kw, i) => (
                        <div key={i} className="mb-3 pb-3 border-b border-[#0A0A0A]/10 last:border-0 last:mb-0 last:pb-0">
                          <p className="text-sm font-bold">{kw.keyword}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge label={kw.search_intent} />
                            <Badge label={kw.difficulty} color={kw.difficulty === 'Low' ? 'bg-green-100 text-green-700 border border-green-500' : kw.difficulty === 'High' ? 'bg-red-100 text-red-700 border border-red-500' : 'bg-yellow-100 text-yellow-700 border border-yellow-500'} />
                          </div>
                          <p className="text-[10px] text-[#6A6A6A] mt-1">{kw.content_idea}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="border-2 border-[#0A0A0A] bg-white p-5 mb-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-3">Secondary Keywords</p>
                        {(seo.secondary_keywords || []).map((kw, i) => (
                          <div key={i} className="mb-2 pb-2 border-b border-[#0A0A0A]/10 last:border-0 last:mb-0 last:pb-0">
                            <p className="text-xs font-bold">{kw.keyword}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge label={kw.search_intent} />
                              <span className="text-[10px] text-[#6A6A6A]">{kw.content_idea}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-2 border-[#0A0A0A] bg-white p-5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-3">Long-Tail Keywords</p>
                        {(seo.long_tail_keywords || []).map((kw, i) => (
                          <div key={i} className="mb-2 pb-2 border-b border-[#0A0A0A]/10 last:border-0 last:mb-0 last:pb-0">
                            <p className="text-xs font-bold">{kw.keyword}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge label={kw.search_intent} />
                              <span className="text-[10px] text-[#6A6A6A]">{kw.content_idea}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-3">Blog Topics</p>
                    <div className="grid sm:grid-cols-2 gap-3">{(seo.blog_topics || []).map((bt, i) => (
                      <div key={i} className="border border-[#0A0A0A]/20 p-3">
                        <p className="text-xs font-bold mb-0.5">{bt.title}</p>
                        <p className="text-[10px] text-[#6A6A6A]">Target: {bt.target_keyword}</p>
                        <p className="text-[10px] text-[#3A3A3A] mt-0.5">{bt.description}</p>
                      </div>
                    ))}</div>
                  </div>
                  <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">SEO Tips</p>
                    <ul className="text-sm text-[#3A3A3A] space-y-1">{(seo.seo_tips || []).map((tip, i) => <li key={i}>&bull; {tip}</li>)}</ul>
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