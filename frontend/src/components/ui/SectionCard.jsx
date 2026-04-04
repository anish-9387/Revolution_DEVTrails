export default function SectionCard({
  index,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-2xl border border-[#e5e1d7] bg-[#fffdf8] p-5 shadow-[0_14px_24px_-20px_rgba(15,23,42,0.45)] ${className}`}
    >
      <div className="mb-5 flex items-start gap-3">
        {index ? (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#ecf2ff] to-[#e7efff] text-xs font-bold text-[#2c4bb4]">
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
