export default function ToggleField({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-[#e7e3d9] bg-white px-3 py-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-[#2d4db4] focus:ring-[#2d4db4]"
      />
      {label}
    </label>
  );
}
