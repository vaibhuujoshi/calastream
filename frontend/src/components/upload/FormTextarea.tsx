interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  rows?: number;
  maxLength?: number;
}

export function FormTextarea({ label, value, onChange, placeholder, rows = 6, maxLength = 5000 }: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-3 flex-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {label}
        </label>
        <span className="text-xs text-zinc-600 font-medium">
            {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full h-full min-h-40 resize-none px-4 py-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-zinc-600 transition-all text-sm leading-relaxed custom-scrollbar"
      />
    </div>
  );
}