"use client";

import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { errorText } from "@/utils/error-text";
import type { AdminLook } from "@/types/catalog-admin";
import { AdminIcon } from "../../../_components/admin-icons";
import { Button, IconButton } from "../../_catalog/button";
import { Panel } from "../../_catalog/field";
import { LookEditor } from "./look-editor";

export function LooksManager({ collectionId, looks, onChanged }: { collectionId: string; looks: AdminLook[]; onChanged: () => void }) {
  const [editing, setEditing] = useState<AdminLook | "new" | null>(null);

  async function remove(look: AdminLook) {
    try {
      await catalogApi.collections.removeLook(look.id);
      toast.success(SUCCESS_MESSAGES.common.deleted("Look"));
      onChanged();
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
    }
  }

  const done = () => {
    setEditing(null);
    onChanged();
  };

  return (
    <Panel
      title="Looks"
      description="Scenes for “shop the look”. Products in the same look appear as “Complete the look” on each other's pages."
      action={editing ? null : <Button tone="secondary" onClick={() => setEditing("new")}><AdminIcon className="h-4 w-4" name="plus" />Add look</Button>}
    >
      <div className="grid gap-3">
        {editing === "new" ? <LookEditor collectionId={collectionId} look={null} onDone={done} /> : null}
        {looks.map((look) =>
          editing !== "new" && editing?.id === look.id ? (
            <LookEditor key={look.id} collectionId={collectionId} look={look} onDone={done} />
          ) : (
            <article key={look.id} className="flex items-center gap-4 rounded-lg border border-slate-200 p-3">
              {look.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={look.imageUrl} alt="" className="h-20 w-16 rounded object-cover" />
              ) : (
                <span className="h-20 w-16 rounded bg-slate-100" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{look.title ?? "Untitled look"}</p>
                <p className="text-sm text-slate-500">{look.productIds.length} products · {look.products.map((p) => p.name).join(", ")}</p>
              </div>
              <IconButton label="Edit look" onClick={() => setEditing(look)}><AdminIcon className="h-4 w-4" name="edit" /></IconButton>
              <IconButton label="Delete look" onClick={() => remove(look)}><AdminIcon className="h-4 w-4" name="trash" /></IconButton>
            </article>
          ),
        )}
        {!looks.length && editing !== "new" ? <p className="text-sm text-slate-500">No looks yet.</p> : null}
      </div>
    </Panel>
  );
}
