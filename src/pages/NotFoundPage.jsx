import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AppNav } from '../components/PageShell.jsx';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#0A0A0A]">
      <AppNav />
      <section className="pt-32 px-6 max-w-3xl mx-auto">
        <div className="border-2 border-[#0A0A0A] bg-white p-8">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6A6A6A] mb-3">404</p>
          <h1 className="text-4xl font-black uppercase leading-none mb-4">Page not found.</h1>
          <Link to="/" className="h-12 px-8 inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F5F3EE] border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] transition-colors">
            Home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
