"use client";

import { catalogApi } from "@/lib/admin-api/catalog";
import { useAsyncData } from "../../_catalog/use-async-data";
import { Modal } from "../../_catalog/modal";
import { ErrorBlock, LoadingBlock } from "../../_catalog/data-states";
import { MovementList } from "./movement-list";

/** Last 20 ledger rows for one variant. */
export function MovementsModal({ variantId, title, onClose }: { variantId: string; title: string; onClose: () => void }) {
  const data = useAsyncData(() => catalogApi.inventory.variant(variantId), `movements:${variantId}`);
  return (
    <Modal title={title} onClose={onClose} wide>
      {data.loading ? <LoadingBlock label="Loading stock history" /> : null}
      {data.error ? <ErrorBlock message={data.error} onRetry={data.reload} /> : null}
      {data.data ? <MovementList movements={data.data.movements} /> : null}
    </Modal>
  );
}
