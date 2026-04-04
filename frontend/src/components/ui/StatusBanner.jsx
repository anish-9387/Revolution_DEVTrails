export default function StatusBanner({ loading, error, notice }) {
  if (!loading && !error && !notice) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.6)] backdrop-blur">
      {loading ? (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
          Processing request...
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
