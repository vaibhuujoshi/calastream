interface FormInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  maxLength?: number;
}

export function FormInput({ label, value, onChange, placeholder, maxLength = 100 }: FormInputProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {label}
        </label>
        <span className="text-xs text-zinc-600 font-medium">
            {value.length}/{maxLength}
        </span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder:text-zinc-600 transition-all text-sm"
      />
    </div>
  );
}