import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Share2, MessageCircle, Globe, TrendingUp, ArrowLeft } from 'lucide-react';
import { AppNav } from '../components/PageShell.jsx';
import { getAnalytics } from '../services/api.js';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const result = await getAnalytics();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <p className="section-label mb-4">Analytics</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight mb-10">Usage Dashboard.</h1>

          {loading && (
            <div className="border-2 border-[#0A0A0A] bg-white p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-[#E8E6E0]" />
                ))}
              </div>
              <div className="h-48 bg-[#E8E6E0]" />
            </div>
          )}

          {error && <div className="border-2 border-[#0A0A0A] bg-white p-5"><p className="text-xs font-black">{error}</p></div>}

          {data && (
            <>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="border-2 border-[#0A0A0A] bg-white p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Total Analyses</span>
                  </div>
                  <p className="text-4xl font-black">{data.total_analyses}</p>
                </div>
                <div className="border-2 border-[#0A0A0A] bg-white p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Share2 className="h-5 w-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Total Shares</span>
                  </div>
                  <p className="text-4xl font-black">{data.total_shares}</p>
                </div>
                <div className="border-2 border-[#0A0A0A] bg-white p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Total Chats</span>
                  </div>
                  <p className="text-4xl font-black">{data.total_chats}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-[#0A0A0A] bg-white p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-5 w-5" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Top Industries</h3>
                  </div>
                  {data.top_industries?.length > 0 ? (
                    <div className="space-y-3">
                      {data.top_industries.map((item, i) => {
                        const maxCount = Math.max(...data.top_industries.map((t) => t.count), 1);
                        const pct = (item.count / maxCount) * 100;
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span className="font-black uppercase tracking-tight">{item.industry}</span>
                              <span className="font-black">{item.count}</span>
                            </div>
                            <div className="h-2 border-2 border-[#0A0A0A] bg-[#F5F3EE]">
                              <div className="h-full bg-[#0A0A0A]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-[#C0BDB6]">No data yet</p>
                  )}
                </div>

                <div className="border-2 border-[#0A0A0A] bg-white p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Recent Activity</h3>
                  </div>
                  {data.recent_events?.length > 0 ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {data.recent_events.slice(0, 15).map((evt, i) => (
                        <div key={i} className="flex items-start gap-3 border-b border-[#E8E6E0] pb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] shrink-0 w-20">{evt.event}</span>
                          <span className="text-[10px] font-medium text-[#3A3A3A] flex-1">{evt.properties?.industry || evt.properties?.idea_preview || '-'}</span>
                          <span className="text-[9px] text-[#C0BDB6] shrink-0">{evt.created_at?.substring(0, 10)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-[#C0BDB6]">No activity yet</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
