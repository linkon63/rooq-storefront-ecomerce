"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createAddress, updateAddress } from "@/lib/address-api";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { SavedAddress, ShippingAddressInput } from "@/types/storefront/commerce";
import { errorText } from "@/utils/api-error";
import { addressProblem, cleanAddress, EMPTY_ADDRESS } from "@/utils/storefront/forms";
import { AddressFields } from "../checkout/address-fields";

type Props = { address: SavedAddress | null; onDone: () => void; onCancel: () => void };

export function AddressEditor({ address, onDone, onCancel }: Props) {
  const [value, setValue] = useState<ShippingAddressInput>(address ?? EMPTY_ADDRESS);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = addressProblem(value);
    if (problem) return setError(problem);
    setSaving(true);
    setError(null);
    try {
      const clean = cleanAddress(value);
      if (address) await updateAddress(address.id, clean);
      else await createAddress(clean);
      toast(SUCCESS_MESSAGES.storefront.addressSaved);
      onDone();
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.storefront.addressSaveFailed));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded bg-paper p-4 md:p-6">
      <h3 className="font-wide text-lg font-bold">{address ? "Edit address" : "New address"}</h3>
      <AddressFields value={value} onChange={setValue} withEmail={false} />
      {error ? (
        <p role="alert" className="text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="h-11 rounded bg-ink px-6 text-sm font-semibold text-chalk disabled:opacity-60">
          Save address
        </button>
        <button type="button" onClick={onCancel} className="h-11 rounded px-4 text-sm font-semibold hover:bg-chalk">
          Cancel
        </button>
      </div>
    </form>
  );
}
