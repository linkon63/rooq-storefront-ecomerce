export function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
      <input checked={checked} className="h-4 w-4 accent-blue-600" onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      {label}
    </label>
  );
}
