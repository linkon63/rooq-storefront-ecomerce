"use client";

import { useState } from "react";
import type { WholesaleRequestResponse as WholesaleOrderRequest } from "@/types/commerce/wholesale";
import { AdminIcon } from "../../../_components/admin-shell";
import { ConfirmModal } from "../../../_components/confirm-modal";

type Props = {
  request: WholesaleOrderRequest;
  busy: boolean;
  onStatus: (status: "approved" | "rejected" | "info_requested", note?: string) => Promise<boolean>;
  onConvert: () => void;
};

const BUTTON = "inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white disabled:bg-slate-400";

/** Approve / ask for info / reject (with a note), or convert once approved. */
export function WholesaleActions({ request, busy, onStatus, onConvert }: Props) {
  const [noteMode, setNoteMode] = useState<null | "rejected" | "info_requested">(null);
  const [note, setNote] = useState("");
  const [confirmReject, setConfirmReject] = useState(false);
  const reviewable = request.status === "pending" || request.status === "info_requested";

  if (noteMode) {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 p-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            {noteMode === "rejected" ? "Reason for rejection (optional)" : "What do you need from the customer?"}
          </span>
          <textarea autoFocus className="h-24 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500" onChange={(e) => setNote(e.target.value)} value={note} />
        </label>
        <div className="mt-3 flex justify-end gap-3">
          <button className="h-11 rounded-lg border border-slate-300 px-4 font-semibold text-slate-700" disabled={busy} onClick={() => setNoteMode(null)} type="button">
            Back
          </button>
          {noteMode === "info_requested" ? (
            <button className={`${BUTTON} bg-amber-500`} disabled={busy} onClick={() => void onStatus("info_requested", note)} type="button">
              Send request for info
            </button>
          ) : (
            <button className={`${BUTTON} bg-red-600`} disabled={busy} onClick={() => setConfirmReject(true)} type="button">
              Reject request
            </button>
          )}
        </div>
        <ConfirmModal
          cancelText="Cancel"
          confirmText="Reject"
          isOpen={confirmReject}
          message={`Reject request "${request.requestNumber}"? The customer will be notified${note.trim() ? " with your note." : "."}`}
          onClose={() => setConfirmReject(false)}
          onConfirm={() => {
            setConfirmReject(false);
            void onStatus("rejected", note);
          }}
          title="Reject wholesale request"
        />
      </div>
    );
  }

  const ask = (mode: "rejected" | "info_requested") => () => {
    setNote("");
    setNoteMode(mode);
  };
  return (
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      {reviewable ? (
        <>
          <button className={`${BUTTON} bg-emerald-600`} disabled={busy} onClick={() => void onStatus("approved")} type="button">
            <AdminIcon className="h-5 w-5" name="check" />
            Approve
          </button>
          <button className={`${BUTTON} bg-amber-500`} disabled={busy} onClick={ask("info_requested")} type="button">
            Request more info
          </button>
        </>
      ) : null}
      {reviewable || request.status === "approved" ? (
        <button className={`${BUTTON} bg-red-600`} disabled={busy} onClick={ask("rejected")} type="button">
          Reject
        </button>
      ) : null}
      {request.status === "approved" ? (
        <button className={`${BUTTON} bg-blue-600`} disabled={busy} onClick={onConvert} type="button">
          <AdminIcon className="h-5 w-5" name="orders" />
          Convert to order
        </button>
      ) : null}
    </div>
  );
}
