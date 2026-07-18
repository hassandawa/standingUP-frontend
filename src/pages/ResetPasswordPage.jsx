import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { verifyResetToken, resetPassword } from '../services/api.js';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setError('No reset token provided.');
      return;
    }
    async function verify() {
      try {
        const result = await verifyResetToken(token);
        setTokenValid(true);
        setEmail(result.email);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setVerifying(false);
      }
    }
    verify();
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!newPassword) { setError('New password is required.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const result = await resetPassword(token, newPassword);
      setNotice(result.message);
      setSuccess(true);
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
            <h2 className="text-4xl font-black text-[#F5F3EE] leading-none mt-16 mb-4">New<br />Password.</h2>
            <p className="text-sm font-medium text-[#6A6A6A] border-l-2 border-[#FFFFFF] pl-4">Create a strong password for your account.</p>
          </div>
          <div className="border-t-2 border-[#3A3A3A] pt-6">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-3">Password requirements</p>
            <div className="space-y-1">
              {['8+ characters', 'Mixed case', 'Numbers recommended'].map((req) => (
                <div key={req} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-[#6A6A6A]" />
                  <span className="text-[10px] text-[#C0BDB6]">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-16 min-h-screen">
          <div className="w-full max-w-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-2">Reset Password</p>
            <h1 className="text-3xl font-black mb-8 leading-none">Set New Password.</h1>

            {verifying && (
              <div className="p-8 border-2 border-[#0A0A0A] text-center animate-pulse">
                <KeyRound className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Verifying reset token...</p>
              </div>
            )}

            {!verifying && !tokenValid && (
              <div className="space-y-6">
                <div className="p-6 border-2 border-red-500 bg-red-50">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-black uppercase tracking-widest text-red-700">Invalid Token</span>
                  </div>
                  <p className="text-xs text-red-700">{error || 'This reset link is invalid or has expired.'}</p>
                </div>
                <Link to="/forgot-password"
                  className="block w-full border-2 border-[#0A0A0A] p-4 text-xs font-black uppercase tracking-widest text-center bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A] transition-colors duration-150">
                  Request New Reset Link
                </Link>
              </div>
            )}

            {!verifying && tokenValid && !success && (
              <form onSubmit={handleSubmit} className="space-y-0">
                {email && (
                  <div className="p-3 border-2 border-[#0A0A0A] bg-[#E8E6E1] mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6A6A6A]">Resetting password for: </span>
                    <span className="text-xs font-bold">{email}</span>
                  </div>
                )}

                <div className="border-2 border-[#0A0A0A] p-4 mb-[-2px] bg-white focus-within:bg-[#FAFAF8]">
                  <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#3A3A3A] mb-2">New Password</label>
                  <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Min. 8 characters" autoComplete="new-password"
                    className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none" />
                </div>
                <div className="border-2 border-[#0A0A0A] p-4 mb-[-2px] bg-white focus-within:bg-[#FAFAF8] relative">
                  <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#3A3A3A] mb-2">Confirm Password</label>
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter password" autoComplete="new-password"
                    className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-[#C0BDB6] hover:text-[#0A0A0A] text-[9px] font-black uppercase tracking-widest">
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>

                {error && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-red-500 pl-2 mt-4 text-red-600">{error}</p>}
                {notice && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-green-600 pl-2 mt-4 text-green-700">{notice}</p>}

                <button type="submit" disabled={loading}
                  className={`w-full border-2 border-[#0A0A0A] p-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 mt-6 ${loading ? 'bg-[#C0BDB6] text-[#3A3A3A]' : 'bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A]'}`}>
                  {loading ? 'Resetting...' : <><span>Reset Password</span> <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            )}

            {success && (
              <div className="space-y-6">
                <div className="p-6 border-2 border-green-600 bg-green-50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-black uppercase tracking-widest text-green-700">Password Reset Complete</span>
                  </div>
                  <p className="text-xs text-green-700">{notice}</p>
                </div>
                <Link to="/signin"
                  className="block w-full border-2 border-[#0A0A0A] p-4 text-xs font-black uppercase tracking-widest text-center bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A] transition-colors duration-150">
                  Sign In with New Password
                </Link>
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
