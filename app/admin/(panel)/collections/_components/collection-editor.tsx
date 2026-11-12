"use client";

import { catalogApi } from "@/lib/admin-api/catalog";
import { PageHeader } from "../../../_components/admin-ui";
import { useAsyncData } from "../../_catalog/use-async-data";
import { ErrorBlock, LoadingBlock } from "../../_catalog/data-states";
import { CollectionForm } from "./collection-form";
import { LooksManager } from "./looks-manager";

export function CollectionEditor({ id }: { id: string | null }) {
  const data = useAsyncData(() => (id ? catalogApi.collections.get(id) : Promise.resolve(null)), `collection:${id ?? "new"}`);
  const collection = data.data;

  return (
    <div className="grid gap-5 pb-10">
      <PageHeader title={collection?.name ?? "New collection"} description="Curated edits, seasonal drops and lookbooks." />
      {data.loading && !collection ? <LoadingBlock label="Loading collection" /> : null}
      {data.error ? <ErrorBlock message={data.error} onRetry={data.reload} /> : null}
      {!data.loading || collection ? (
        <>
          {!id || collection ? <CollectionForm key={collection?.updatedAt ?? "new"} collection={collection} onSaved={(saved) => data.setData(saved)} /> : null}
          {collection ? <LooksManager collectionId={collection.id} looks={collection.looks} onChanged={data.reload} /> : null}
        </>
      ) : null}
    </div>
  );
}
