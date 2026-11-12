"use client";

import type { SavedAddress } from "@/types/storefront/commerce";

export const NEW_ADDRESS = "new";

type Props = {
  addresses: SavedAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
};

/** Radio cards for the saved address book, plus "Use a new address". */
export function SavedAddressPicker({ addresses, selectedId, onSelect }: Props) {
  const option = (id: string, title: string, body: string) => (
    <li key={id}>
      <label
        className={`flex cursor-pointer gap-3 rounded border p-4 ${selectedId === id ? "border-ink bg-paper" : "border-line bg-paper/60 hover:border-stone"}`}
      >
        <input type="radio" name="saved-address" value={id} checked={selectedId === id} onChange={() => onSelect(id)} className="mt-1 size-4 accent-[var(--color-ink)]" />
        <span className="text-sm">
          <span className="block font-semibold">{title}</span>
          <span className="text-stone">{body}</span>
        </span>
      </label>
    </li>
  );

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">Deliver to</legend>
      <ul className="grid gap-2 sm:grid-cols-2">
        {addresses.map((address) =>
          option(
            address.id,
            `${address.fullName}${address.isDefault ? " (default)" : ""}`,
            [address.addressLine1, address.state, address.city, address.phone].filter(Boolean).join(", "),
          ),
        )}
        {option(NEW_ADDRESS, "Use a new address", "It will be saved to your account.")}
      </ul>
    </fieldset>
  );
}
