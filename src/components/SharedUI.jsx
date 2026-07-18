import { useState, useCallback } from 'react';
import { Copy, CheckCheck } from 'lucide-react';

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button onClick={handleCopy} className="h-8 px-3 border-2 border-[#0A0A0A] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#0A0A0A] hover:text-[#F5F3EE] transition-colors">
      {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function Badge({ label, color = 'bg-[#0A0A0A] text-white' }) {
  return <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${color}`}>{label}</span>;
}
