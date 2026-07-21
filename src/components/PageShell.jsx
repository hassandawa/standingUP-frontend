import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Play, Rocket, ChevronDown, Menu, X, User, LogOut, Settings, LayoutDashboard, BookOpen, HelpCircle, Lightbulb, Users, Brain, Briefcase, Target, Globe } from 'lucide-react';
import DemoVideoModal from './DemoVideoModal.jsx';
import { logoutAccount } from '../services/api.js';
import { clearSession, getSession } from '../services/storage.js';

const FEATURES = [
  { label: 'AI Co-Founder', path: '/ai-cofounder', desc: 'Chat with expert AI advisors' },
  { label: 'Investor Tools', path: '/investor-tools', desc: 'Pitch deck, summaries & readiness' },
  { label: 'Marketing', path: '/marketing-hub', desc: 'Brand assets & launch content' },
  { label: 'Development', path: '/development-hub', desc: 'Schemas, APIs & deployment' },
  { label: 'Growth', path: '/growth-hub', desc: 'KPIs, acquisition & growth plans' },
  { label: 'Financial Planning', path: '/financial-plan', desc: 'Budget, burn & projections' },
  { label: 'Launch', path: '/launch-hub', desc: 'Checklists & customer strategy' },
];

const STRATEGIES = [
  { label: 'First 100 Customers', path: '/first-100-customers', desc: 'Find & convert early adopters' },
  { label: 'Decision Engine', path: '/decision-engine', desc: 'Go / Pivot / Drop decisions' },
  { label: 'Business Planning', path: '/business-planning', desc: 'BMC, Lean canvas & revenue' },
  { label: 'Customer Insights', path: '/customer-insights', desc: 'Personas, journeys & pain points' },
  { label: 'Market Intelligence', path: '/market-intelligence', desc: 'Market size, trends & competition' },
];

const RESOURCES = [
  { label: 'How It Works', path: '/#how-it-works', desc: 'See the platform in action' },
  { label: 'Documentation', path: '/#features', desc: 'Guides & API reference' },
  { label: 'FAQ', path: '/#faq', desc: 'Common questions answered' },
];

function DropdownMenu({ label, items, isOpen, onToggle, onClose }) {
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const isActive = items.some(item => item.path && location.pathname.startsWith(item.path));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200 hover:text-[#0A0A0A] ${isActive ? 'text-[#0A0A0A]' : 'text-[#6A6A6A]'}`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
          <div className="py-2">
            {items.map((item) => {
              const isItemActive = location.pathname === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => onClose()}
                  className={`block w-full text-left px-4 py-3 transition-all duration-150 border-l-2 ${isItemActive ? 'border-l-[#0A0A0A] bg-[#F5F3EE]' : 'border-l-transparent hover:border-l-[#0A0A0A] hover:bg-[#F5F3EE]'}`}
                >
                  <div className="text-[13px] font-semibold text-[#0A0A0A]">{item.label}</div>
                  <div className="text-[11px] text-[#8A8A8A] mt-0.5">{item.desc}</div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(p => !p)} className="flex items-center gap-2 group">
        <div className="h-8 w-8 bg-[#0A0A0A] text-[#F5F3EE] flex items-center justify-center text-xs font-bold tracking-wide transition-transform duration-200 group-hover:scale-105">
          {initials}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-[#6A6A6A] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b-2 border-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <div className="text-[13px] font-semibold truncate">{user?.name || 'User'}</div>
              {user?.plan && user.plan !== 'free' && (
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[#0A0A0A] text-[#F5F3EE] flex-shrink-0">
                  {user.plan}
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#8A8A8A] truncate">{user?.email || ''}</div>
          </div>
          <div className="py-1">
            <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#0A0A0A] hover:bg-[#F5F3EE] transition-colors duration-150">
              <LayoutDashboard className="h-4 w-4 text-[#6A6A6A]" /> Dashboard
            </Link>
            <Link to="/input" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#0A0A0A] hover:bg-[#F5F3EE] transition-colors duration-150">
              <Settings className="h-4 w-4 text-[#6A6A6A]" /> New Analysis
            </Link>
          </div>
          <div className="border-t-2 border-[#0A0A0A] py-1">
            <button onClick={onLogout} className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors duration-150 w-full text-left">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BrandLink({ inverted = false, size = 'sm' }) {
  const sizeMap = { sm: { box: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-sm' }, md: { box: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-base' } };
  const s = sizeMap[size] || sizeMap.sm;
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className={`${s.box} flex items-center justify-center ${inverted ? 'bg-[#F5F3EE]' : 'bg-[#0A0A0A]'} transition-transform duration-200 group-hover:scale-105`}>
        <Rocket className={`${s.icon} ${inverted ? 'text-[#0A0A0A]' : 'text-[#F5F3EE]'}`} />
      </div>
      <span className={`${s.text} font-extrabold tracking-tight ${inverted ? 'text-[#F5F3EE]' : 'text-[#0A0A0A]'}`}>
        startingUP
      </span>
    </Link>
  );
}

export function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSessionState] = useState(() => getSession());
  useEffect(() => {
    function refreshSession() {
      setSessionState(getSession());
    }
    window.addEventListener('startingup:session-changed', refreshSession);
    window.addEventListener('storage', refreshSession);
    return () => {
      window.removeEventListener('startingup:session-changed', refreshSession);
      window.removeEventListener('storage', refreshSession);
    };
  }, []);
  const [showDemo, setShowDemo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    function handleScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => { document.body.style.overflow = mobileOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [mobileOpen]);

  const closeDropdowns = useCallback(() => setOpenDropdown(null), []);

  async function handleLogout() {
    try { await logoutAccount(); } catch { /* ok */ }
    clearSession();
    navigate('/signin');
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLink = (label, path, cls = '') => (
    <Link to={path} className={`px-3 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200 hover:text-[#0A0A0A] ${isActive(path) ? 'text-[#0A0A0A]' : 'text-[#6A6A6A]'} ${cls}`}>
      {label}
    </Link>
  );

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F5F3EE]/95 backdrop-blur-md shadow-[0_1px_0_#0A0A0A]' : 'bg-[#F5F3EE] border-b-2 border-[#0A0A0A]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">
          {/* Logo */}
          <BrandLink />

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLink('Home', '/')}
            {navLink('Dashboard', '/dashboard')}
            {navLink('Pricing', '/pricing')}
            <DropdownMenu
              label="Tools"
              items={FEATURES}
              isOpen={openDropdown === 'features'}
              onToggle={() => setOpenDropdown(openDropdown === 'features' ? null : 'features')}
              onClose={closeDropdowns}
            />
            <DropdownMenu
              label="Strategies"
              items={STRATEGIES}
              isOpen={openDropdown === 'strategies'}
              onToggle={() => setOpenDropdown(openDropdown === 'strategies' ? null : 'strategies')}
              onClose={closeDropdowns}
            />
            <DropdownMenu
              label="Resources"
              items={RESOURCES}
              isOpen={openDropdown === 'resources'}
              onToggle={() => setOpenDropdown(openDropdown === 'resources' ? null : 'resources')}
              onClose={closeDropdowns}
            />
          </div>

          {/* Auth + CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {session?.user ? (
              <AvatarMenu user={session.user} onLogout={handleLogout} />
            ) : (
              <>
                <Link to="/signin" className="px-4 py-2 text-[13px] font-semibold tracking-wide text-[#0A0A0A] hover:text-[#6A6A6A] transition-colors duration-200">
                  Sign In
                </Link>
                <Link to="/input" className="h-9 px-5 bg-[#0A0A0A] text-[#F5F3EE] text-[13px] font-bold tracking-wide flex items-center border-2 border-[#0A0A0A] hover:bg-[#2A2A2A] hover:border-[#2A2A2A] transition-all duration-200 active:scale-[0.98]">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(p => !p)} className="lg:hidden p-2 hover:bg-[#E8E6E1] transition-colors duration-200">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-[#F5F3EE] border-l-2 border-[#0A0A0A] overflow-y-auto shadow-[-4px_0_0_#0A0A0A] animate-in slide-in-from-right duration-300">
            <div className="pt-[72px] px-4 pb-8">
              <div className="space-y-1">
                <MobileLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
                <MobileLink to="/dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} />
                <MobileLink to="/pricing" label="Pricing" sub="Plans for every stage" onClick={() => setMobileOpen(false)} />
                <div className="pt-3 pb-1">
                  <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">Tools</div>
                </div>
                {FEATURES.map(f => <MobileLink key={f.path} to={f.path} label={f.label} sub={f.desc} onClick={() => setMobileOpen(false)} />)}
                <div className="pt-3 pb-1">
                  <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">Strategies</div>
                </div>
                {STRATEGIES.map(s => <MobileLink key={s.path} to={s.path} label={s.label} sub={s.desc} onClick={() => setMobileOpen(false)} />)}
                <div className="pt-3 pb-1">
                  <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">Resources</div>
                </div>
                {RESOURCES.map(r => <MobileLink key={r.path} to={r.path} label={r.label} sub={r.desc} onClick={() => setMobileOpen(false)} />)}
                <div className="pt-4 space-y-2 px-4">
                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2 bg-[#E8E6E1] border-2 border-[#0A0A0A]">
                        <div className="h-7 w-7 bg-[#0A0A0A] text-[#F5F3EE] flex items-center justify-center text-[11px] font-bold">{session.user.name?.charAt(0).toUpperCase() || 'U'}</div>
                        <div className="text-[13px] font-semibold truncate flex-1">{session.user.name || 'User'}</div>
                        {session.user.plan && session.user.plan !== 'free' && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[#0A0A0A] text-[#F5F3EE] flex-shrink-0">
                            {session.user.plan}
                          </span>
                        )}
                      </div>
                      <button onClick={handleLogout} className="w-full h-10 border-2 border-red-600 text-red-600 text-[13px] font-bold tracking-wide hover:bg-red-50 transition-colors duration-200">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/signin" onClick={() => setMobileOpen(false)} className="block w-full h-10 border-2 border-[#0A0A0A] text-[#0A0A0A] text-[13px] font-bold tracking-wide leading-10 text-center hover:bg-[#E8E6E1] transition-colors duration-200">
                        Sign In
                      </Link>
                      <Link to="/input" onClick={() => setMobileOpen(false)} className="block w-full h-10 bg-[#0A0A0A] text-[#F5F3EE] text-[13px] font-bold tracking-wide leading-10 text-center border-2 border-[#0A0A0A] hover:bg-[#2A2A2A] transition-colors duration-200">
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DemoVideoModal open={showDemo} onClose={() => setShowDemo(false)} />
    </>
  );
}

function MobileLink({ to, label, sub, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`block px-4 py-2.5 border-l-2 transition-all duration-150 ${active ? 'border-l-[#0A0A0A] bg-[#E8E6E1]' : 'border-l-transparent hover:border-l-[#0A0A0A] hover:bg-[#F0EEE9]'}`}>
      <div className="text-[14px] font-semibold text-[#0A0A0A]">{label}</div>
      {sub && <div className="text-[11px] text-[#8A8A8A] mt-0.5">{sub}</div>}
    </Link>
  );
}