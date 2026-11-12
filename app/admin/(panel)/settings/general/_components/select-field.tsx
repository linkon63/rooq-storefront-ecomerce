/** Native select styled like the settings inputs. */
export function SelectField({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      id={id}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
