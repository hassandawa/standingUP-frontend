import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, KeyRound } from 'lucide-react';
import { requestPasswordReset } from '../services/api.js';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resetToken, setResetToken] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!email) { setError('Email is required.'); return; }
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setNotice(result.message);
      if (result.reset_token) {
        setResetToken(result.reset_token);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    if (resetToken) {
      navigate(`/reset-password?token=${resetToken}`);
    }
  }

  return (
    <main className="bg-[#F5F3EE] min-h-screen text-[#0A0A0A]">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex flex-col justify-between bg-[#0A0A0A] p-12 min-h-screen w-[420px] shrink-0 border-r-2 border-[#0A0A0A]">
          <div>
            <span className="text-sm font-black uppercase tracking-widest text-[#F5F3EE]">startingUP</span>
            <h2 className="text-4xl font-black text-[#F5F3EE] leading-none mt-16 mb-4">Reset<br />Password.</h2>
            <p className="text-sm font-medium text-[#6A6A6A] border-l-2 border-[#FFFFFF] pl-4">Enter your email to receive reset instructions.</p>
          </div>
          <div className="border-t-2 border-[#3A3A3A] pt-6">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-3">Secure reset</p>
            <div className="flex gap-1">
              {['15', 'MIN', 'TOKEN', 'EXP'].map((text) => (
                <div key={text} className="h-8 w-8 border-2 border-[#6A6A6A] flex items-center justify-center">
                  <span className="text-[8px] font-black text-[#C0BDB6]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-16 min-h-screen">
          <div className="w-full max-w-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-2">Password Reset</p>
            <h1 className="text-3xl font-black mb-8 leading-none">Forgot Password?</h1>

            {!resetToken ? (
              <form onSubmit={handleSubmit} className="space-y-0">
                <div className="border-2 border-[#0A0A0A] p-4 mb-[-2px] bg-white focus-within:bg-[#FAFAF8]">
                  <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#3A3A3A] mb-2">Email</label>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com" autoComplete="email"
                    className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none" />
                </div>

                {error && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-red-500 pl-2 mt-4 text-red-600">{error}</p>}
                {notice && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-green-600 pl-2 mt-4 text-green-700">{notice}</p>}

                <button type="submit" disabled={loading}
                  className={`w-full border-2 border-[#0A0A0A] p-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 mt-6 ${loading ? 'bg-[#C0BDB6] text-[#3A3A3A]' : 'bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A]'}`}>
                  {loading ? 'Sending...' : <><span>Send Reset Link</span> <Mail className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-6 border-2 border-green-600 bg-green-50">
                  <div className="flex items-center gap-3 mb-3">
                    <KeyRound className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-black uppercase tracking-widest text-green-700">Reset Token Ready</span>
                  </div>
                  <p className="text-xs text-green-700">{notice}</p>
                </div>

                <button onClick={handleContinue}
                  className="w-full border-2 border-[#0A0A0A] p-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A] transition-colors duration-150">
                  <span>Set New Password</span> <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <p className="text-center text-xs font-bold uppercase tracking-wide text-[#3A3A3A] mt-8">
              <Link to="/signin" className="font-black underline hover:text-[#000000]">Back to Sign In</Link>
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
