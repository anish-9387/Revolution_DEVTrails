export default function FormField({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
