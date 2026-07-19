import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Check, X, ArrowLeft, Zap, Rocket, Building2 } from 'lucide-react';
import { createCheckoutSession, verifyCheckout, cancelSubscription } from '../services/api.js';
import { getSession, setSession } from '../services/storage.js';

const plans = [
  {
    name: 'Starter',
    key: 'free',
    price: 'Free',
    desc: 'Try it out with one AI-generated startup idea.',
    icon: Zap,
    features: [
      { text: '1 AI-generated startup idea', included: true },
      { text: 'Basic founder analysis', included: true },
      { text: 'Competitor overview', included: true },
      { text: 'AI Co-Founder chat', included: false },
      { text: 'Investor tools & pitch deck', included: false },
      { text: 'Development hub access', included: false },
      { text: 'Financial planning tools', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    style: 'border-2 border-[#0A0A0A] bg-white',
  },
  {
    name: 'Pro',
    key: 'pro',
    price: '$50',
    period: '/month',
    desc: 'Full access to every tool for serious builders.',
    icon: Rocket,
    features: [
      { text: 'Unlimited startup ideas', included: true },
      { text: 'Deep founder analysis', included: true },
      { text: 'Full competitor mapping', included: true },
      { text: 'AI Co-Founder chat', included: true },
      { text: 'Investor tools & pitch deck', included: true },
      { text: 'Development hub access', included: true },
      { text: 'Financial planning tools', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
    style: 'border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] shadow-[6px_6px_0px_#0A0A0A]',
  },
  {
    name: 'Team',
    key: 'team',
    price: '$100',
    period: '/month',
    desc: 'Collaborate with co-founders and advisors in real time.',
    icon: Building2,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Team collaboration hub', included: true },
      { text: 'Shared startup workspace', included: true },
      { text: 'Real-time co-founder chat', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Priority support', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
    cta: 'Upgrade to Team',
    style: 'border-2 border-[#0A0A0A] bg-white',
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const [banner, setBanner] = useState('');
  const session = getSession();
  const currentPlan = session?.user?.plan || 'free';

  useEffect(() => {
    const status = searchParams.get('status');
    const transactionId = searchParams.get('transaction_id');

    async function handleRedirect() {
      if (status === 'successful' && transactionId) {
        try {
          const result = await verifyCheckout(transactionId);
          // Reflect the new plan immediately without requiring a fresh sign-in.
          const current = getSession();
          if (current) {
            setSession({ ...current, user: { ...current.user, plan: result.plan } });
          }
          setBanner(`Payment successful! You're now on the ${result.plan.charAt(0).toUpperCase() + result.plan.slice(1)} plan.`);
        } catch (err) {
          setError(err.message || 'We received your payment but could not confirm it automatically. It may take a minute to reflect — refresh shortly.');
        }
      } else if (status === 'cancelled') {
        setBanner('Checkout cancelled. No charge was made.');
      }
      if (status) {
        searchParams.delete('status');
        searchParams.delete('transaction_id');
        searchParams.delete('tx_ref');
        setSearchParams(searchParams, { replace: true });
      }
    }
    handleRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePlanClick(plan) {
    setError('');
    if (plan.key === 'free') {
      navigate('/input');
      return;
    }
    if (!session?.token) {
      navigate('/signup');
      return;
    }
    if (currentPlan === plan.key) {
      // Already on this plan — offer to cancel instead.
      const confirmed = window.confirm(`Cancel your ${plan.name} plan? You'll be moved to the free plan immediately.`);
      if (!confirmed) return;
      setLoadingPlan(plan.key);
      try {
        await cancelSubscription();
        const current = getSession();
        if (current) {
          setSession({ ...current, user: { ...current.user, plan: 'free' } });
        }
        setBanner('Your subscription has been cancelled. You are now on the free plan.');
      } catch (err) {
        setError(err.message || 'Failed to cancel subscription.');
      } finally {
        setLoadingPlan('');
      }
      return;
    }
    setLoadingPlan(plan.key);
    try {
      const { url } = await createCheckoutSession(plan.key);
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Failed to start checkout.');
    } finally {
      setLoadingPlan('');
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="section-label mb-4">Pricing</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight mb-4">Simple, transparent pricing</h1>
            <p className="text-sm font-medium text-[#3A3A3A] leading-relaxed">Start free with 1 idea. Upgrade when you're ready to build.</p>
          </div>

          {banner && (
            <div className="max-w-xl mx-auto mb-8 border-2 border-[#0A0A0A] bg-white px-4 py-3 text-xs font-bold text-center">
              {banner}
            </div>
          )}
          {error && (
            <div className="max-w-xl mx-auto mb-8 border-2 border-red-600 bg-red-50 text-red-700 px-4 py-3 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.key;
              return (
                <div key={plan.name} className={`${plan.style} p-6 flex flex-col`}>
                  <div className="mb-6">
                    <div className={`w-10 h-10 border-2 flex items-center justify-center mb-4 ${plan.highlighted ? 'border-[#F5F3EE]' : 'border-[#0A0A0A]'}`}>
                      <plan.icon className={`h-5 w-5 ${plan.highlighted ? 'text-[#F5F3EE]' : 'text-[#0A0A0A]'}`} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-xs font-black uppercase tracking-widest ${plan.highlighted ? 'text-[#F5F3EE]' : 'text-[#6A6A6A]'}`}>{plan.name}</h3>
                      {isCurrent && (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border ${plan.highlighted ? 'border-[#F5F3EE] text-[#F5F3EE]' : 'border-[#0A0A0A] text-[#0A0A0A]'}`}>Current</span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-black uppercase tracking-tight">{plan.price}</span>
                      {plan.period && <span className={`text-xs font-bold ${plan.highlighted ? 'text-[#F5F3EE]/60' : 'text-[#6A6A6A]'}`}>{plan.period}</span>}
                    </div>
                    <p className={`text-xs leading-relaxed ${plan.highlighted ? 'text-[#F5F3EE]/80' : 'text-[#3A3A3A]'}`}>{plan.desc}</p>
                  </div>

                  <div className="flex-1">
                    <div className={`border-t-2 ${plan.highlighted ? 'border-[#F5F3EE]/20' : 'border-[#0A0A0A]'} pt-4 mb-6`}>
                      {plan.features.map((feat) => (
                        <div key={feat.text} className="flex items-center gap-2 py-1.5">
                          {feat.included ? (
                            <Check className={`h-3.5 w-3.5 flex-shrink-0 ${plan.highlighted ? 'text-green-400' : 'text-green-600'}`} />
                          ) : (
                            <X className={`h-3.5 w-3.5 flex-shrink-0 ${plan.highlighted ? 'text-[#F5F3EE]/30' : 'text-[#C0BDB6]'}`} />
                          )}
                          <span className={`text-xs ${feat.included ? '' : 'line-through'} ${plan.highlighted ? (feat.included ? 'text-[#F5F3EE]' : 'text-[#F5F3EE]/40') : (feat.included ? 'text-[#0A0A0A]' : 'text-[#C0BDB6]')}`}>{feat.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlanClick(plan)}
                    disabled={loadingPlan === plan.key}
                    className={`block w-full h-11 border-2 text-center text-xs font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-50 ${
                      plan.highlighted
                        ? 'border-[#F5F3EE] bg-[#F5F3EE] text-[#0A0A0A] hover:bg-transparent hover:text-[#F5F3EE]'
                        : 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] hover:bg-transparent hover:text-[#0A0A0A]'
                    }`}>
                    {loadingPlan === plan.key ? 'Loading…' : isCurrent && plan.key !== 'free' ? 'Cancel Plan' : plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
