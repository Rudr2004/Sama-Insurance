export function FormField({ label, children, hint, required }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

export function TextInput(props) {
  return <input className={inputClass} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={`${inputClass} bg-white`} {...props}>
      {children}
    </select>
  );
}

export function TextArea(props) {
  return <textarea className={inputClass} {...props} />;
}
