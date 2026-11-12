"use client";

import Link from "next/link";
import { useState } from "react";
import type { Unit } from "@/types/admin/catalog";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { CrudListSection } from "../../_components/list/crud-list-section";
import { SearchToggle } from "../../_components/list/search-toggle";
import { useClientList } from "../../_hooks/use-client-list";
import { useCrudResource } from "../../_hooks/use-crud-resource";
import { UnitRow } from "./_components/unit-row";

const HEADINGS = ["Name", "Abbreviation", "Parent Unit", "Conversion", "Products", "Created", "Status", "Actions"];
const unitText = (unit: Unit) => `${unit.name} ${unit.code} ${unit.description ?? ""} ${unit.parentUnit?.name ?? ""}`;

export default function UnitsPage() {
  const units = useCrudResource<Unit>("/units");
  const list = useClientList(units.rows, unitText);
  const [toDelete, setToDelete] = useState<Unit | null>(null);

  return (
    <>
      <PageHeader
        action={
          <div className="flex items-center gap-3">
            <SearchToggle label="Search units" onChange={list.setSearch} value={list.search} />
            <Link
              className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 text-[14px] font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
              href="/admin/units/new"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Unit
            </Link>
          </div>
        }
        description="Control product stock and sales measurement units used when creating products."
        title="Units of Measurement"
      />
      <CrudListSection
        error={!toDelete ? units.error : ""}
        hasMore={list.hasMore}
        headings={HEADINGS}
        isLoading={units.isLoading}
        loaded={list.visible.length}
        minWidth="min-w-[860px]"
        noun={{ one: "unit", many: "units" }}
        onLoadMore={list.loadMore}
        total={list.filtered.length}
      >
        {list.visible.map((unit) => (
          <UnitRow all={units.rows} key={unit.id} onDelete={() => setToDelete(unit)} unit={unit} />
        ))}
      </CrudListSection>
      <ConfirmModal
        cancelText="No"
        confirmText="Yes"
        error={units.error}
        isDestructive
        isOpen={!!toDelete}
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
        onClose={() => {
          setToDelete(null);
          units.setError("");
        }}
        onConfirm={async () => {
          if (toDelete && (await units.remove(toDelete.id))) setToDelete(null);
        }}
        title="Delete Unit"
      />
    </>
  );
}
