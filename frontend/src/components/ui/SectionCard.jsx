export default function SectionCard({
  index,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-3xl border border-white/80 bg-white/85 p-5 shadow-[0_16px_38px_-22px_rgba(15,23,42,0.65)] backdrop-blur ${className}`}
    >
      <div className="mb-5 flex items-start gap-3">
        {index ? (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 text-xs font-bold text-blue-700">
            {index}
          </span>
        ) : null}
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-600/95">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
