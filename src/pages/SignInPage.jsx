import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { signInAccount } from '../services/api.js';
import { setSession } from '../services/storage.js';

export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const auth = await signInAccount(form);
      setSession(auth);
      navigate('/dashboard');
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
            <span className="text-sm font-black uppercase tracking-widest text-[#F5F3EE]">startingUP</span>
            <h2 className="text-4xl font-black text-[#F5F3EE] leading-none mt-16 mb-4">Welcome<br />Back.</h2>
            <p className="text-sm font-medium text-[#6A6A6A] border-l-2 border-[#FFFFFF] pl-4">Access your startup blueprints, ideas, and execution plans.</p>
          </div>
          <div className="border-t-2 border-[#3A3A3A] pt-6">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-3">Trusted by builders</p>
            <div className="flex gap-1">
              {['SC', 'MJ', 'PP', 'AK'].map((initials) => (
                <div key={initials} className="h-8 w-8 border-2 border-[#6A6A6A] flex items-center justify-center">
                  <span className="text-[9px] font-black text-[#C0BDB6]">{initials}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-16 min-h-screen">
          <div className="w-full max-w-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-2">Sign In</p>
            <h1 className="text-3xl font-black mb-8 leading-none">Access Account.</h1>

            <form onSubmit={handleSubmit} className="space-y-0">
              <div className="border-2 border-[#0A0A0A] p-4 mb-[-2px] bg-white focus-within:bg-[#FAFAF8]">
                <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#3A3A3A] mb-2">Email</label>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none" />
              </div>
              <div className="border-2 border-[#0A0A0A] p-4 mb-[-2px] bg-white focus-within:bg-[#FAFAF8] relative">
                <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#3A3A3A] mb-2">Password</label>
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="Enter your password" autoComplete="current-password"
                  className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-[#C0BDB6] hover:text-[#0A0A0A] text-[9px] font-black uppercase tracking-widest">
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              {error && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-[#0A0A0A] pl-2 mt-4 text-[#0A0A0A]">{error}</p>}
              {notice && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-[#0A0A0A] pl-2 mt-4 text-[#0A0A0A]">{notice}</p>}

              <div className="flex items-center justify-between mt-6">
                <label className="flex items-center gap-2 cursor-pointer border-2 border-[#0A0A0A] p-3 bg-white">
                  <input type="checkbox" className="h-4 w-4 border-2 border-[#0A0A0A] appearance-none checked:bg-[#0A0A0A] cursor-pointer shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wide text-[#3A3A3A]">Remember me</span>
                </label>
                <Link to="/forgot-password"
                  className="text-xs font-black uppercase tracking-wide underline hover:text-[#000000] transition-colors">
                  Forgot?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className={`w-full border-2 border-[#0A0A0A] p-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 ${loading ? 'bg-[#C0BDB6] text-[#3A3A3A]' : 'bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A]'}`}>
                {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="text-center text-xs font-bold uppercase tracking-wide text-[#3A3A3A] mt-8">
              No account? <Link to="/signup" className="font-black underline hover:text-[#000000]">Create one free</Link>
            </p>
            <div className="text-center mt-4">
              <Link to="/" className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A] hover:text-[#0A0A0A] transition-colors">Back to home</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
