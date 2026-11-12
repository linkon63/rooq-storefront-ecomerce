import { FieldLabel, Input } from "../../_components/settings-ui";

/** Labelled non-negative number input. */
export function NumberField({
  label,
  value,
  onChange,
  placeholder = "0",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Input min={0} onChange={onChange} placeholder={placeholder} type="number" value={value} />
    </div>
  );
}
