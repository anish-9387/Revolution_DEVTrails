export default function StatusBanner({ loading, error, notice }) {
  if (!loading && !error && !notice) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#e4dfd4] bg-[#fffefb] p-3 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)]">
      {loading ? (
        <p className="rounded-lg bg-[#edf3ff] px-3 py-2 text-sm font-semibold text-[#2643a1]">
          Processing request...
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 rounded-lg bg-[#fff0ea] px-3 py-2 text-sm font-semibold text-[#b63f20]">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-2 rounded-lg bg-[#eef8ef] px-3 py-2 text-sm font-semibold text-emerald-700">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
