"use client";

import { useState } from "react";
import type { Tag } from "@/types/admin/catalog";
import { formatDate } from "@/utils/format-date";
import { slugify } from "@/utils/slug";
import { PageHeader, StatusToggle } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { AddButton } from "../../_components/list/add-button";
import { CrudListSection } from "../../_components/list/crud-list-section";
import { RowActions } from "../../_components/list/row-actions";
import { SearchToggle } from "../../_components/list/search-toggle";
import { useClientList } from "../../_hooks/use-client-list";
import { useCrudResource } from "../../_hooks/use-crud-resource";
import { EMPTY_TAG_FORM, TagFormModal, type TagForm } from "./_components/tag-form-modal";

const HEADINGS = ["Name", "Slug", "Description", "Products", "Created", "Status", "Actions"];
const tagText = (tag: Tag) => `${tag.name} ${tag.slug} ${tag.description ?? ""}`;
const toForm = (tag: Tag): TagForm => ({ id: tag.id, name: tag.name, slug: tag.slug, description: tag.description ?? "", isActive: tag.isActive });

export default function TagsPage() {
  const tags = useCrudResource<Tag>("/tags");
  const list = useClientList(tags.rows, tagText);
  const [editing, setEditing] = useState<TagForm | null>(null);
  const [toDelete, setToDelete] = useState<Tag | null>(null);
  const open = (form: TagForm) => {
    tags.setError("");
    setEditing(form);
  };

  return (
    <>
      <PageHeader
        action={
          <div className="flex items-center gap-3">
            <SearchToggle label="Search tags" onChange={list.setSearch} value={list.search} />
            <AddButton label="Add Tag" onClick={() => open(EMPTY_TAG_FORM)} />
          </div>
        }
        description="Create, update, and remove searchable product tags."
        title="Tags"
      />
      <CrudListSection
        error={!editing && !toDelete ? tags.error : ""}
        hasMore={list.hasMore}
        headings={HEADINGS}
        isLoading={tags.isLoading}
        loaded={list.visible.length}
        minWidth="min-w-[900px]"
        noun={{ one: "tag", many: "tags" }}
        onLoadMore={list.loadMore}
        total={list.filtered.length}
      >
        {list.visible.map((tag) => (
          <tr className="odd:bg-white even:bg-slate-50/70" key={tag.id}>
            <td className="px-5 py-4 text-sm text-slate-800">{tag.name}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{tag.slug}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{tag.description || "-"}</td>
            <td className="px-5 py-4 text-sm tabular-nums text-slate-600">{tag._count?.products ?? 0}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{formatDate(tag.createdAt)}</td>
            <td className="px-5 py-4">
              <StatusToggle checked={tag.isActive} onChange={(isActive) => void tags.patch(tag.id, { isActive })} />
            </td>
            <td className="px-5 py-4">
              <RowActions label={tag.name} onDelete={() => setToDelete(tag)} onEdit={() => open(toForm(tag))} />
            </td>
          </tr>
        ))}
      </CrudListSection>
      {editing ? (
        <TagFormModal
          busy={tags.isSaving}
          error={tags.error}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            const body = { name: form.name, slug: form.slug || slugify(form.name), description: form.description || undefined, isActive: form.isActive };
            if (await tags.save(form.id, body)) setEditing(null);
          }}
        />
      ) : null}
      <ConfirmModal
        cancelText="No"
        confirmText="Yes"
        error={tags.error}
        isDestructive
        isOpen={!!toDelete}
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
        onClose={() => {
          setToDelete(null);
          tags.setError("");
        }}
        onConfirm={async () => {
          if (toDelete && (await tags.remove(toDelete.id))) setToDelete(null);
        }}
        title="Delete Tag"
      />
    </>
  );
}
