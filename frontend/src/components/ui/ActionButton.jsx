const STYLES = {
  primary:
    "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-[0_10px_22px_-12px_rgba(59,130,246,0.95)] hover:from-sky-600 hover:to-indigo-700 focus-visible:ring-blue-400",
  secondary:
    "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-[0_10px_22px_-12px_rgba(15,23,42,0.9)] hover:from-slate-800 hover:to-slate-700 focus-visible:ring-slate-400",
  danger:
    "bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-[0_10px_22px_-12px_rgba(244,63,94,0.9)] hover:from-rose-700 hover:to-orange-600 focus-visible:ring-rose-400",
  ghost:
    "border border-slate-300 bg-white/90 text-slate-800 hover:bg-white focus-visible:ring-slate-400",
};

export default function ActionButton({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${STYLES[variant] || STYLES.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
