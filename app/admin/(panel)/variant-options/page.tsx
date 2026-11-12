"use client";

import { useState } from "react";
import type { Attribute } from "@/types/admin/catalog";
import { PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { AddButton } from "../../_components/list/add-button";
import { CrudListSection } from "../../_components/list/crud-list-section";
import { SearchToggle } from "../../_components/list/search-toggle";
import { useClientList } from "../../_hooks/use-client-list";
import { AttributeFormModal } from "./_components/attribute-form-modal";
import { AttributeRow } from "./_components/attribute-row";
import { EMPTY_ATTRIBUTE_FORM, attributeToForm, useAttributes, type AttributeForm } from "./_hooks/use-attributes";

const HEADINGS = ["Name", "Values", "Count", "Actions"];
const optionText = (option: Attribute) => `${option.name} ${option.values?.map((item) => item.value).join(" ") ?? ""}`;

/** Extra product attributes (fabric, neckline, sleeve…). Colours and sizes have their own masters. */
export default function VariantOptionsPage() {
  const attributes = useAttributes();
  const list = useClientList(attributes.rows, optionText);
  const [editing, setEditing] = useState<AttributeForm | null>(null);
  const [toDelete, setToDelete] = useState<Attribute | null>(null);
  const open = (form: AttributeForm) => {
    attributes.setError("");
    setEditing(form);
  };

  return (
    <>
      <PageHeader
        action={
          <div className="flex items-center gap-3">
            <SearchToggle label="Search attributes" onChange={list.setSearch} value={list.search} />
            <AddButton label="Add Attribute" onClick={() => open(EMPTY_ATTRIBUTE_FORM)} />
          </div>
        }
        description="Extra product attributes such as fabric, neckline or sleeve length. Colours and sizes are managed on their own pages."
        title="Attributes"
      />
      <CrudListSection
        error={!editing && !toDelete ? attributes.error : ""}
        hasMore={list.hasMore}
        headings={HEADINGS}
        isLoading={attributes.isLoading}
        loaded={list.visible.length}
        minWidth="min-w-[860px]"
        noun={{ one: "attribute", many: "attributes" }}
        onLoadMore={list.loadMore}
        total={list.filtered.length}
      >
        {list.visible.map((option) => (
          <AttributeRow key={option.id} onDelete={() => setToDelete(option)} onEdit={() => open(attributeToForm(option))} option={option} />
        ))}
      </CrudListSection>
      {editing ? (
        <AttributeFormModal
          busy={attributes.isSaving}
          error={attributes.error}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            if (await attributes.save(form)) setEditing(null);
          }}
        />
      ) : null}
      <ConfirmModal
        cancelText="No"
        confirmText="Yes"
        error={attributes.error}
        isDestructive
        isOpen={!!toDelete}
        message={`Delete "${toDelete?.name}" and all of its values? This cannot be undone.`}
        onClose={() => {
          setToDelete(null);
          attributes.setError("");
        }}
        onConfirm={async () => {
          if (toDelete && (await attributes.remove(toDelete))) setToDelete(null);
        }}
        title="Delete Attribute"
      />
    </>
  );
}
