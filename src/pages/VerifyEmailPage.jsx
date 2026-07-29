import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { resendVerificationEmail, verifyEmail } from '../services/api.js';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setError('No verification token provided.');
      return;
    }
    async function verify() {
      try {
        await verifyEmail(token);
        setSuccess(true);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setVerifying(false);
      }
    }
    verify();
  }, [token]);

  async function handleResend(event) {
    event.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    setResendNotice('');
    try {
      const result = await resendVerificationEmail(resendEmail);
      setResendNotice(result.message);
    } catch (requestError) {
      setResendNotice(requestError.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="bg-[#F5F3EE] min-h-screen text-[#0A0A0A]">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex flex-col justify-between bg-[#0A0A0A] p-12 min-h-screen w-[420px] shrink-0 border-r-2 border-[#0A0A0A]">
          <div>
            <span className="text-sm font-black uppercase tracking-widest text-[#F5F3EE]">startingUP</span>
            <h2 className="text-4xl font-black text-[#F5F3EE] leading-none mt-16 mb-4">Verify<br />Email.</h2>
            <p className="text-sm font-medium text-[#6A6A6A] border-l-2 border-[#FFFFFF] pl-4">Confirm it's really you before you sign in.</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-16 min-h-screen">
          <div className="w-full max-w-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-2">Email Verification</p>
            <h1 className="text-3xl font-black mb-8 leading-none">Confirm Your Email.</h1>

            {verifying && (
              <div className="p-8 border-2 border-[#0A0A0A] text-center animate-pulse">
                <MailCheck className="h-8 w-8 mx-auto mb-4 text-[#6A6A6A]" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#6A6A6A]">Verifying your email...</p>
              </div>
            )}

            {!verifying && success && (
              <div className="space-y-6">
                <div className="p-6 border-2 border-green-600 bg-green-50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-black uppercase tracking-widest text-green-700">Email Verified</span>
                  </div>
                  <p className="text-xs text-green-700">Your email has been confirmed. Thanks for verifying!</p>
                </div>
                <Link to="/dashboard"
                  className="block w-full border-2 border-[#0A0A0A] p-4 text-xs font-black uppercase tracking-widest text-center bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A] transition-colors duration-150">
                  Go to Dashboard
                </Link>
              </div>
            )}

            {!verifying && !success && (
              <div className="space-y-6">
                <div className="p-6 border-2 border-red-500 bg-red-50">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-black uppercase tracking-widest text-red-700">Verification Failed</span>
                  </div>
                  <p className="text-xs text-red-700">{error || 'This verification link is invalid or has expired.'}</p>
                </div>

                <form onSubmit={handleResend} className="space-y-0">
                  <div className="border-2 border-[#0A0A0A] p-4 mb-[-2px] bg-white focus-within:bg-[#FAFAF8]">
                    <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-[#3A3A3A] mb-2">Email</label>
                    <input type="email" value={resendEmail} onChange={(event) => setResendEmail(event.target.value)}
                      placeholder="you@example.com" autoComplete="email"
                      className="w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none" />
                  </div>
                  {resendNotice && <p className="text-[10px] font-black uppercase tracking-wide border-l-2 border-[#0A0A0A] pl-2 mt-4">{resendNotice}</p>}
                  <button type="submit" disabled={resending}
                    className="w-full border-2 border-[#0A0A0A] p-4 text-xs font-black uppercase tracking-widest text-center bg-[#0A0A0A] text-[#F5F3EE] hover:bg-white hover:text-[#0A0A0A] transition-colors duration-150 disabled:opacity-50 mt-6">
                    {resending ? 'Sending...' : 'Resend Verification Link'}
                  </button>
                </form>
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
