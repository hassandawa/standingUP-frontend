import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Rocket } from 'lucide-react';
import { signUpAccount } from '../services/api.js';
import { setSession } from '../services/storage.js';

const checks = [
  { label: '8+ characters', test: (value) => value.length >= 8 },
  { label: 'One number', test: (value) => /\d/.test(value) },
  { label: 'One letter', test: (value) => /[A-Za-z]/.test(value) },
];

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const strength = useMemo(() => checks.map((check) => ({ ...check, passed: check.test(form.password) })), [form.password]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (!form.terms) {
      setError('Accept the terms to continue.');
      return;
    }
    setLoading(true);
    try {
      const auth = await signUpAccount({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSession(auth);
      navigate('/input');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-[#F5F3EE] min-h-screen text-[#0A0A0A]">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex flex-col justify-between bg-[#0A0A0A] p-12 min-h-screen w-[420px] shrink-0 border-r-2 border-[#0A0A0A]">
          <div>
            <div className="flex items-center gap-2 mb-16">
              <div className="h-8 w-8 bg-[#F5F3EE] flex items-center justify-center">
                <Rocket className="h-4 w-4 text-[#0A0A0A]" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-[#F5F3EE]">startingUP</span>
            </div>
            <h2 className="text-4xl font-black uppercase text-white leading-none mb-4">Start<br />Here.</h2>
            <p className="text-sm text-white/40 border-l-2 border-white/20 pl-4 leading-relaxed">Turn your skills into a validated startup in minutes.</p>
          </div>
          <div className="border-t border-white/10 pt-6">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 mb-3">Trusted by builders</p>
            <div className="flex -space-x-px">
              {['SC', 'MJ', 'PP', 'AK'].map((initials) => (
                <div key={initials} className="h-8 w-8 border border-white/20 bg-white/10 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white/60">{initials}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-16 min-h-screen">
          <div className="w-full max-w-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-2">Sign Up</p>
            <h1 className="text-3xl font-black uppercase text-[#0A0A0A] mb-8 leading-none">Create<br />Account.</h1>

            <form onSubmit={handleSubmit} className="space-y-0">
              <div className="border-2 border-[#0A0A0A] p-4 mb-[-2px]">
                <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2">Name</label>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" autoComplete="name" className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none" />
              </div>
              <div className="border-2 border-[#0A0A0A] p-4 mb-[-2px]">
                <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2">Email</label>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" autoComplete="email" className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none" />
              </div>
              <div className="border-2 border-[#0A0A0A] p-4 relative mb-4">
                <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2">Password</label>
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Create a password" autoComplete="new-password" className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-4 text-[#6A6A6A] hover:text-[#0A0A0A]" aria-label="Toggle password">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {strength.map((check) => (
                  <span key={check.label} className={`text-[9px] font-black uppercase tracking-wide ${check.passed ? 'text-[#0A0A0A] line-through decoration-2' : 'text-[#C0BDB6]'}`}>
                    {check.label}
                  </span>
                ))}
              </div>

              {error && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-[#0A0A0A] pl-2 mb-4">{error}</p>}

              <label className="flex items-start gap-2 cursor-pointer mb-6">
                <input type="checkbox" checked={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.checked })} className="h-4 w-4 border-2 border-[#0A0A0A] appearance-none checked:bg-[#0A0A0A] cursor-pointer mt-0.5 shrink-0" />
                <span className="text-xs font-bold text-[#3A3A3A] uppercase tracking-wide">I agree to use generated plans for validation before execution.</span>
              </label>

              <button type="submit" disabled={loading} className="w-full h-12 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-[#0A0A0A] hover:bg-transparent hover:text-[#0A0A0A] transition-colors duration-150 disabled:opacity-50">
                {loading ? 'Creating...' : <>Create Account <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="text-center text-xs font-bold text-[#6A6A6A] mt-8 uppercase tracking-wide">
              Have account? <Link to="/signin" className="text-[#0A0A0A] underline font-black">Sign in</Link>
            </p>
            <div className="text-center mt-4">
              <Link to="/" className="text-[9px] font-black uppercase tracking-widest text-[#C0BDB6] hover:text-[#0A0A0A] transition-colors">Back to home</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
