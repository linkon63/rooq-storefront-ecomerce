import { StatusToggle } from "../../_components/settings-ui";

/** A described on/off switch. */
export function ToggleRow({
  title,
  description,
  active,
  onChange,
}: {
  title: string;
  description: string;
  active: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-5 py-4">
      <div>
        <p className="text-sm font-black text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>
      </div>
      <StatusToggle active={active} onChange={onChange} />
    </div>
  );
}
