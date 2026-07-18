import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { BrandLink } from '../components/PageShell.jsx';
import { getSharedAnalysis } from '../services/api.js';

export default function SharedViewPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getSharedAnalysis(token)
      .then((res) => { setData(res); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A] flex items-center justify-center">
        <div className="border-2 border-[#0A0A0A] bg-white p-8 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#6A6A6A]">Loading shared analysis...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A] flex items-center justify-center">
        <div className="border-2 border-[#0A0A0A] bg-white p-8 max-w-md text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Not Found</p>
          <h1 className="text-2xl font-black uppercase mb-4">This share link is invalid or expired.</h1>
          <Link to="/" className="h-10 px-6 inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F5F3EE] border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] transition-colors">
            Go Home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  const result = data.analysis;

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <nav className="border-b-2 border-[#0A0A0A] bg-[#F5F3EE]">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <BrandLink />
          <Link to="/input" className="h-10 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center border-2 border-[#0A0A0A] hover:bg-[#F5F3EE] hover:text-[#0A0A0A] transition-colors">
            Create Your Own
          </Link>
        </div>
      </nav>
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="section-label mb-4">Shared Analysis</p>
          <h1 className="text-3xl md:text-5xl font-black uppercase leading-none tracking-tight mb-8">{result.refined_idea}</h1>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-[#0A0A0A] bg-white p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Problem</p>
              <p className="text-sm text-[#3A3A3A]">{result.problem_statement}</p>
            </div>
            <div className="border-2 border-[#0A0A0A] bg-white p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] mb-2">Target Users</p>
              <p className="text-sm text-[#3A3A3A]">{result.target_users?.join(', ')}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Demand', value: result.market_demand_score },
              { label: 'Uniqueness', value: result.uniqueness_score },
              { label: 'Feasibility', value: result.feasibility_score },
              { label: 'Revenue', value: result.revenue_potential_score },
              { label: 'Hackathon', value: result.hackathon_winning_score },
            ].map((s) => (
              <div key={s.label} className="border-2 border-[#0A0A0A] bg-white p-3 text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">{s.label}</p>
                <p className="text-xl font-black">{Number(s.value || 0).toFixed(1)}</p>
              </div>
            ))}
          </div>

          {result.competitors?.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              {result.competitors.map((comp, i) => (
                <div key={i} className="border-2 border-[#0A0A0A] bg-white p-4">
                  <p className="text-xs font-black uppercase mb-2">{comp.name}</p>
                  <p className="text-[9px] font-black text-[#6A6A6A] mb-1">Strengths</p>
                  <p className="text-xs text-[#3A3A3A] mb-2">{comp.strengths?.join(', ')}</p>
                  <p className="text-[9px] font-black text-[#6A6A6A] mb-1">Weaknesses</p>
                  <p className="text-xs text-[#3A3A3A]">{comp.weaknesses?.join(', ')}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] p-6 mb-6">
            <p className="text-xs font-black uppercase tracking-widest mb-2">Pitch Summary</p>
            <p className="text-sm leading-relaxed">{result.pitch_summary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
