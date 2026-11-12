"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteAddress, listAddresses, setDefaultAddress } from "@/lib/address-api";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { SavedAddress } from "@/types/storefront/commerce";
import { errorText } from "@/utils/api-error";
import { EmptyState } from "../shared/empty-state";
import { AddressEditor } from "./address-editor";
import { useRemoteList } from "./use-remote-list";

/** The address book: add, edit, delete, make default. */
export function AddressesPanel() {
  const { items: addresses, error, reload } = useRemoteList(listAddresses, ERROR_MESSAGES.ui.loadFailed);
  const [editing, setEditing] = useState<SavedAddress | "new" | null>(null);

  async function run(action: () => Promise<unknown>, success: string, failure: string) {
    try {
      await action();
      toast(success);
      void reload();
    } catch (caught) {
      toast.error(errorText(caught, failure));
    }
  }

  if (addresses === null) return <div className="h-48 animate-pulse rounded bg-selvedge" aria-busy="true" aria-label="Loading addresses" />;
  if (error) return <EmptyState tone="error" title="Addresses did not load" body={error} />;

  if (editing) {
    return (
      <AddressEditor
        address={editing === "new" ? null : editing}
        onDone={() => {
          setEditing(null);
          void reload();
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 ? <p className="text-stone">No saved addresses yet. Add one to check out faster.</p> : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => (
          <li key={address.id} className="flex flex-col gap-2 rounded bg-paper p-4 text-sm">
            <p className="font-semibold">
              {address.fullName}
              {address.isDefault ? <span className="font-normal text-stone"> (default)</span> : null}
            </p>
            <p className="text-stone">{[address.addressLine1, address.addressLine2, address.state, address.city].filter(Boolean).join(", ")}</p>
            <p className="text-stone">{address.phone}</p>
            <div className="mt-1 flex flex-wrap gap-3 font-semibold">
              <button type="button" onClick={() => setEditing(address)} className="underline underline-offset-4">
                Edit
              </button>
              {!address.isDefault ? (
                <button
                  type="button"
                  onClick={() => void run(() => setDefaultAddress(address.id), SUCCESS_MESSAGES.storefront.addressSaved, ERROR_MESSAGES.storefront.addressSaveFailed)}
                  className="underline underline-offset-4"
                >
                  Make default
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void run(() => deleteAddress(address.id), SUCCESS_MESSAGES.storefront.addressDeleted, ERROR_MESSAGES.storefront.addressDeleteFailed)}
                className="text-dye-deep underline underline-offset-4"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setEditing("new")} className="h-11 w-fit rounded border border-ink px-5 text-sm font-semibold hover:bg-ink hover:text-chalk">
        Add an address
      </button>
    </div>
  );
}
