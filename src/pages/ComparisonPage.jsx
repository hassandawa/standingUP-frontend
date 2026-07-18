import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ArrowRight, Lightbulb } from 'lucide-react';
import { AppNav } from '../components/PageShell.jsx';
import { compareIdeas } from '../services/api.js';

export default function ComparisonPage() {
  const [ideaA, setIdeaA] = useState('');
  const [ideaB, setIdeaB] = useState('');
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCompare() {
    if (!ideaA.trim() || !ideaB.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await compareIdeas({ idea_a: ideaA, idea_b: ideaB, industry });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/input" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <p className="section-label mb-4">Idea Comparison</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight mb-10">Which Idea Wins?</h1>

          <div className="border-2 border-[#0A0A0A] bg-white p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2 block">Idea A *</label>
                <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-3">
                  <textarea value={ideaA} onChange={(e) => setIdeaA(e.target.value)} rows={3}
                    placeholder="Describe the first startup idea..."
                    className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none resize-none" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2 block">Idea B *</label>
                <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-3">
                  <textarea value={ideaB} onChange={(e) => setIdeaB(e.target.value)} rows={3}
                    placeholder="Describe the second startup idea..."
                    className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none resize-none" />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2 block">Industry (optional)</label>
                <div className="border-2 border-[#0A0A0A] bg-[#F5F3EE] p-3">
                  <input value={industry} onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. EdTech, SaaS, Health..."
                    className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none" />
                </div>
              </div>
              <button type="button" onClick={handleCompare} disabled={loading || !ideaA.trim() || !ideaB.trim()}
                className="h-12 px-8 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-[#0A0A0A] transition-colors disabled:opacity-50">
                {loading ? 'Comparing...' : <>Compare <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>

          {error && <div className="border-2 border-[#0A0A0A] bg-white p-4 mb-6"><p className="text-xs font-black">{error}</p></div>}

          {result && (
            <>
              <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] p-5 mb-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#C0BDB6] mb-1">Overall Winner</p>
                <p className="text-xl font-black">{result.overall_winner}</p>
                <p className="text-sm font-medium mt-2 leading-relaxed">{result.summary}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {result.dimensions?.map((dim, i) => {
                  const winner = dim.idea_a_score > dim.idea_b_score ? 'A' : dim.idea_b_score > dim.idea_a_score ? 'B' : 'tie';
                  return (
                    <div key={i} className="border-2 border-[#0A0A0A] bg-white p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-black uppercase tracking-widest">{dim.dimension}</h3>
                        <span className="text-[9px] font-black uppercase tracking-widest border border-[#0A0A0A] px-1.5 py-0.5">
                          {winner === 'A' ? 'A Wins' : winner === 'B' ? 'B Wins' : 'Tie'}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A]">Idea A: {dim.idea_a_score}/10</span>
                            {dim.idea_a_score > dim.idea_b_score && <Check className="h-3 w-3 text-[#0A0A0A]" />}
                          </div>
                          <div className="h-2 border-2 border-[#0A0A0A] bg-[#F5F3EE]">
                            <div className="h-full bg-[#0A0A0A]" style={{ width: `${dim.idea_a_score * 10}%` }} />
                          </div>
                          <p className="text-[11px] font-medium text-[#3A3A3A] mt-1">{dim.idea_a_notes}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A]">Idea B: {dim.idea_b_score}/10</span>
                            {dim.idea_b_score > dim.idea_a_score && <Check className="h-3 w-3 text-[#0A0A0A]" />}
                          </div>
                          <div className="h-2 border-2 border-[#0A0A0A] bg-[#F5F3EE]">
                            <div className="h-full bg-[#0A0A0A]" style={{ width: `${dim.idea_b_score * 10}%` }} />
                          </div>
                          <p className="text-[11px] font-medium text-[#3A3A3A] mt-1">{dim.idea_b_notes}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
