const STYLES = {
  primary:
    "bg-gradient-to-r from-[#273c97] to-[#334fb8] text-white shadow-[0_10px_20px_-12px_rgba(39,60,151,0.9)] hover:from-[#22347f] hover:to-[#2e47a4] focus-visible:ring-blue-400",
  secondary:
    "bg-gradient-to-r from-[#1e293b] to-[#334155] text-white shadow-[0_10px_22px_-12px_rgba(15,23,42,0.9)] hover:from-[#0f172a] hover:to-[#1e293b] focus-visible:ring-slate-400",
  danger:
    "bg-gradient-to-r from-[#e2582f] to-[#f38b3d] text-white shadow-[0_10px_22px_-12px_rgba(226,88,47,0.9)] hover:from-[#cf4f29] hover:to-[#dd7f38] focus-visible:ring-orange-300",
  ghost:
    "border border-[#ddd8ce] bg-white text-slate-700 hover:bg-[#faf8f3] focus-visible:ring-slate-300",
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
