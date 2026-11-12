"use client";

import { useState } from "react";
import { PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { AddButton } from "../../_components/list/add-button";
import { CrudListSection } from "../../_components/list/crud-list-section";
import { SearchToggle } from "../../_components/list/search-toggle";
import { useClientList } from "../../_hooks/use-client-list";
import { useCrudResource } from "../../_hooks/use-crud-resource";
import {
  EMPTY_SUPPLIER_FORM,
  SupplierFormModal,
  supplierPayload,
  supplierToForm,
  type Supplier,
  type SupplierForm,
} from "./_components/supplier-form-modal";
import { SupplierRow } from "./_components/supplier-row";

const HEADINGS = ["Company Name", "Contact", "Address", "Status", "Products", "Created", "Actions"];
const supplierText = (s: Supplier) => `${s.name} ${s.phone ?? ""} ${s.email ?? ""} ${s.address ?? ""}`;

export default function SuppliersPage() {
  const suppliers = useCrudResource<Supplier>("/suppliers");
  const list = useClientList(suppliers.rows, supplierText);
  const [editing, setEditing] = useState<SupplierForm | null>(null);
  const [toDelete, setToDelete] = useState<Supplier | null>(null);
  const open = (form: SupplierForm) => {
    suppliers.setError("");
    setEditing(form);
  };

  return (
    <>
      <PageHeader
        action={
          <div className="flex items-center gap-3">
            <SearchToggle label="Search suppliers" onChange={list.setSearch} value={list.search} />
            <AddButton label="Add Supplier" onClick={() => open(EMPTY_SUPPLIER_FORM)} />
          </div>
        }
        description="Manage the vendors you buy stock from."
        title="Suppliers"
      />
      <CrudListSection
        error={!editing && !toDelete ? suppliers.error : ""}
        hasMore={list.hasMore}
        headings={HEADINGS}
        isLoading={suppliers.isLoading}
        loaded={list.visible.length}
        minWidth="min-w-[900px]"
        noun={{ one: "supplier", many: "suppliers" }}
        onLoadMore={list.loadMore}
        total={list.filtered.length}
      >
        {list.visible.map((supplier) => (
          <SupplierRow key={supplier.id} onDelete={() => setToDelete(supplier)} onEdit={() => open(supplierToForm(supplier))} supplier={supplier} />
        ))}
      </CrudListSection>
      {editing ? (
        <SupplierFormModal
          busy={suppliers.isSaving}
          error={suppliers.error}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            if (await suppliers.save(form.id, supplierPayload(form))) setEditing(null);
          }}
        />
      ) : null}
      <ConfirmModal
        cancelText="No"
        confirmText="Yes"
        error={suppliers.error}
        isDestructive
        isOpen={!!toDelete}
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
        onClose={() => {
          setToDelete(null);
          suppliers.setError("");
        }}
        onConfirm={async () => {
          if (toDelete && (await suppliers.remove(toDelete.id))) setToDelete(null);
        }}
        title="Delete Supplier"
      />
    </>
  );
}
