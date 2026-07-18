import { AlertCircle } from 'lucide-react';

export default function Input({
  label,
  icon: Icon,
  error,
  hint,
  className = '',
  ...props
}) {
  return (
    <div className={`border-2 border-[#0A0A0A] p-4 bg-white focus-within:bg-[#FAFAF8] transition-colors ${className}`}>
      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A6A6A] mb-2 block">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6A6A6A]" />}
        <input
          className={`w-full bg-transparent text-sm font-medium text-[#0A0A0A] placeholder:text-[#C0BDB6] focus:outline-none ${Icon ? 'pr-8' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-black uppercase tracking-wide text-[#0A0A0A] border-l-2 border-[#0A0A0A] pl-2 mt-2 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[10px] text-[#6A6A6A] uppercase tracking-wide mt-1">{hint}</p>
      )}
    </div>
  );
}
