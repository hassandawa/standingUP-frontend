import { useEffect, useState } from 'react';
import { AppNav } from '../components/PageShell.jsx';
import { ArrowLeft, ChevronDown, ChevronUp, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminListUsers, adminGetUserActivity, adminSetUserPlan } from '../services/api.js';

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function daysUntil(d) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function PlanBadge({ plan }) {
  const styles = {
    free: 'border-[#0A0A0A] text-[#0A0A0A]',
    pro: 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE]',
    team: 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE]',
  };
  return (
    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 ${styles[plan] || styles.free}`}>
      {plan}
    </span>
  );
}

function ActivityRow({ user, onPlanUpdated }) {
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overridePlan, setOverridePlan] = useState(user.plan);
  const [overrideDays, setOverrideDays] = useState('30');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  async function toggle() {
    if (!open && !activity) {
      setLoading(true);
      try {
        const data = await adminGetUserActivity(user.id);
        setActivity(data);
      } catch {
        setActivity({ error: true });
      } finally {
        setLoading(false);
      }
    }
    setOpen((o) => !o);
  }

  async function applyOverride(e) {
    e.stopPropagation();
    setSaving(true);
    setSaveMsg('');
    try {
      const days = overridePlan === 'free' ? null : (overrideDays === '' ? null : Number(overrideDays));
      await adminSetUserPlan(user.id, overridePlan, days);
      const expiresAt = (overridePlan !== 'free' && days !== null)
        ? new Date(Date.now() + days * 86400000).toISOString()
        : null;
      onPlanUpdated(user.id, overridePlan, expiresAt);
      setSaveMsg('Updated!');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      setSaveMsg(err.message || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  }

  const expiry = daysUntil(user.plan_expires_at);

  return (
    <>
      <tr className="border-b border-[#0A0A0A]/10 hover:bg-white/60 cursor-pointer" onClick={toggle}>
        <td className="py-3 px-3 text-sm font-semibold">{user.name}</td>
        <td className="py-3 px-3 text-xs text-[#3A3A3A]">{user.email}</td>
        <td className="py-3 px-3"><PlanBadge plan={user.plan} /></td>
        <td className="py-3 px-3 text-xs">
          {user.plan === 'free' ? '—' : (
            <span className={expiry !== null && expiry <= 3 ? 'text-red-600 font-bold' : ''}>
              {formatDate(user.plan_expires_at)}
              {expiry !== null && expiry <= 7 && expiry >= 0 && ` (${expiry}d)`}
            </span>
          )}
        </td>
        <td className="py-3 px-3 text-xs">{user.ideas_generated_count}</td>
        <td className="py-3 px-3 text-xs">{formatDate(user.created_at)}</td>
        <td className="py-3 px-3">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</td>
      </tr>
      {open && (
        <tr className="bg-white/40">
          <td colSpan={7} className="px-3 py-4">
            {loading && <p className="text-xs flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading activity…</p>}
            {activity?.error && <p className="text-xs text-red-600">Failed to load activity.</p>}
            {activity && !activity.error && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activity.activity_counts).map(([key, count]) => count > 0 && (
                    <span key={key} className="text-[10px] font-bold uppercase tracking-wide border border-[#0A0A0A]/30 px-2 py-1">
                      {key.replace(/_/g, ' ')}: {count}
                    </span>
                  ))}
                  {activity.total_activity === 0 && <span className="text-xs text-[#6A6A6A]">No feature activity yet.</span>}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A] mb-1">
                    Saved Ideas ({activity.saved_ideas_count})
                  </p>
                  {activity.saved_ideas.length === 0 ? (
                    <p className="text-xs text-[#6A6A6A]">None saved.</p>
                  ) : (
                    <ul className="text-xs space-y-1">
                      {activity.saved_ideas.map((idea) => (
                        <li key={idea.id} className="flex justify-between border-b border-[#0A0A0A]/10 py-1">
                          <span>{idea.title}</span>
                          <span className="text-[#6A6A6A]">{formatDate(idea.created_at)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t-2 border-[#0A0A0A]/20 flex flex-wrap items-end gap-3" onClick={(e) => e.stopPropagation()}>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A]">Set Plan</label>
                <select
                  value={overridePlan}
                  onChange={(e) => setOverridePlan(e.target.value)}
                  className="mt-1 block h-9 border-2 border-[#0A0A0A] bg-white px-2 text-xs font-bold uppercase"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="team">Team</option>
                </select>
              </div>
              {overridePlan !== 'free' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#6A6A6A]">Days (blank = permanent)</label>
                  <input
                    type="number"
                    min="1"
                    value={overrideDays}
                    onChange={(e) => setOverrideDays(e.target.value)}
                    placeholder="30"
                    className="mt-1 block h-9 w-24 border-2 border-[#0A0A0A] bg-white px-2 text-xs"
                  />
                </div>
              )}
              <button
                onClick={applyOverride}
                disabled={saving}
                className="h-9 px-4 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-[#0A0A0A] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Apply'}
              </button>
              {saveMsg && <span className="text-xs font-bold">{saveMsg}</span>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await adminListUsers();
        setUsers(data.users);
      } catch (err) {
        setError(err.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = filter === 'all' ? users : users.filter((u) => u.plan === filter);

  function handlePlanUpdated(userId, newPlan, newExpiresAt) {
    setUsers((prev) => prev.map((u) => (
      u.id === userId ? { ...u, plan: newPlan, plan_expires_at: newExpiresAt } : u
    )));
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <Users className="h-6 w-6" />
            <h1 className="text-3xl font-black uppercase tracking-tight">Admin Dashboard</h1>
          </div>

          {error && (
            <div className="border-2 border-red-600 bg-red-50 text-red-700 px-4 py-3 text-xs font-bold mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-xs flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading users…</p>
          ) : !error && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-xs font-bold uppercase tracking-widest">{filtered.length} of {users.length} users</p>
                <div className="flex gap-2">
                  {['all', 'free', 'pro', 'team'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-[#0A0A0A] ${filter === f ? 'bg-[#0A0A0A] text-[#F5F3EE]' : ''}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border-2 border-[#0A0A0A]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#0A0A0A] bg-white/80 text-left">
                      <th className="py-2 px-3 text-[10px] font-black uppercase tracking-widest">Name</th>
                      <th className="py-2 px-3 text-[10px] font-black uppercase tracking-widest">Email</th>
                      <th className="py-2 px-3 text-[10px] font-black uppercase tracking-widest">Plan</th>
                      <th className="py-2 px-3 text-[10px] font-black uppercase tracking-widest">Expires</th>
                      <th className="py-2 px-3 text-[10px] font-black uppercase tracking-widest">Ideas</th>
                      <th className="py-2 px-3 text-[10px] font-black uppercase tracking-widest">Joined</th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => <ActivityRow key={u.id} user={u} onPlanUpdated={handlePlanUpdated} />)}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
