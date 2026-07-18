import { Link } from 'react-router-dom';
import { AppNav } from '../components/PageShell.jsx';
import { Check, X, ArrowLeft, Zap, Rocket, Building2 } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    desc: 'Perfect for exploring your first startup idea.',
    icon: Zap,
    features: [
      { text: '3 AI-generated startup ideas', included: true },
      { text: 'Basic founder analysis', included: true },
      { text: 'Competitor overview', included: true },
      { text: 'AI Co-Founder chat', included: false },
      { text: 'Investor tools & pitch deck', included: false },
      { text: 'Development hub access', included: false },
      { text: 'Financial planning tools', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    ctaPath: '/input',
    style: 'border-2 border-[#0A0A0A] bg-white',
  },
  {
    name: 'Pro',
    price: '$19',
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
    cta: 'Start Pro Trial',
    ctaPath: '/input',
    highlighted: true,
    style: 'border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] shadow-[6px_6px_0px_#0A0A0A]',
  },
  {
    name: 'Team',
    price: '$49',
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
    cta: 'Contact Sales',
    ctaPath: '/input',
    style: 'border-2 border-[#0A0A0A] bg-white',
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label mb-4">Pricing</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight mb-4">Simple, transparent pricing</h1>
            <p className="text-sm font-medium text-[#3A3A3A] leading-relaxed">Start free. Upgrade when you're ready to build.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`${plan.style} p-6 flex flex-col`}>
                <div className="mb-6">
                  <div className={`w-10 h-10 border-2 flex items-center justify-center mb-4 ${plan.highlighted ? 'border-[#F5F3EE]' : 'border-[#0A0A0A]'}`}>
                    <plan.icon className={`h-5 w-5 ${plan.highlighted ? 'text-[#F5F3EE]' : 'text-[#0A0A0A]'}`} />
                  </div>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-2 ${plan.highlighted ? 'text-[#F5F3EE]' : 'text-[#6A6A6A]'}`}>{plan.name}</h3>
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

                <Link to={plan.ctaPath}
                  className={`block w-full h-11 border-2 text-center text-xs font-black uppercase tracking-widest leading-[44px] transition-all duration-200 ${
                    plan.highlighted
                      ? 'border-[#F5F3EE] bg-[#F5F3EE] text-[#0A0A0A] hover:bg-transparent hover:text-[#F5F3EE]'
                      : 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EE] hover:bg-transparent hover:text-[#0A0A0A]'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
