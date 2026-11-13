import { ORDER_NOTE_MAX } from "@/lib/constants/storefront";

type Props = { value: string; onChange: (next: string) => void };

/** Optional note for the shop: a delivery time, a landmark, a gift message. */
export function OrderNoteField({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="order-note" className="text-sm font-semibold">
        Order note <span className="font-normal text-stone">(optional)</span>
      </label>
      <textarea
        id="order-note"
        rows={3}
        maxLength={ORDER_NOTE_MAX}
        placeholder="Anything we should know: a delivery time, a landmark…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-line bg-paper px-3 py-2.5 text-base"
      />
    </div>
  );
}
