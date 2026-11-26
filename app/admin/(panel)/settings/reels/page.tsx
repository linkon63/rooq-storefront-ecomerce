"use client";

import { PageHeader } from "../../../_components/admin-shell";
import { SettingsCard } from "../_components/settings-ui";
import { ReelItem } from "./_components/reel-item";
import { ReelUploadCard } from "./_components/reel-upload-card";
import { useReels } from "./_hooks/use-reels";

/** Home page reels: upload short videos and link each to a product. */
export default function ReelsPage() {
  const { reels, loading, busy, upload, update, remove, move } = useReels();

  return (
    <>
      <PageHeader title="Reels" description="Short videos on the home page, below the spotlight." />
      <SettingsCard title="Videos" description="Shown in this order. Tapping the product under a video opens its page.">
        <div className="grid gap-6">
          <ReelUploadCard busy={busy} onUpload={upload} />
          {loading ? (
            <p className="text-sm font-medium text-slate-400">Loading reels…</p>
          ) : reels.length === 0 ? (
            <p className="text-sm font-medium text-slate-500">No reels yet. Add the first video above.</p>
          ) : (
            <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {reels.map((reel, index) => (
                <ReelItem
                  key={reel.id}
                  reel={reel}
                  index={index}
                  count={reels.length}
                  busy={busy}
                  onUpdate={(patch) => void update(reel.id, patch)}
                  onMove={(step) => void move(index, step)}
                  onRemove={() => void remove(reel.id)}
                />
              ))}
            </ol>
          )}
        </div>
      </SettingsCard>
    </>
  );
}
