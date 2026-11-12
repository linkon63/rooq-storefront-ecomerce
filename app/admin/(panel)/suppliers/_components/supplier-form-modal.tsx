"use client";

import { useState } from "react";
import { CheckboxField } from "../../../_components/checkbox-field";
import { FormField, INPUT_CLASS } from "../../../_components/form-field";
import { FormModal } from "../../../_components/form-modal";

export type Supplier = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
};

export type SupplierForm = { id?: string; name: string; phone: string; email: string; address: string; isActive: boolean };
export const EMPTY_SUPPLIER_FORM: SupplierForm = { name: "", phone: "", email: "", address: "", isActive: true };

export const supplierToForm = (s: Supplier): SupplierForm => ({
  id: s.id,
  name: s.name,
  phone: s.phone ?? "",
  email: s.email ?? "",
  address: s.address ?? "",
  isActive: s.isActive,
});

export const supplierPayload = (form: SupplierForm) => ({
  name: form.name.trim(),
  phone: form.phone.trim() || undefined,
  email: form.email.trim() || undefined,
  address: form.address.trim() || undefined,
  isActive: form.isActive,
});

type Props = { initial: SupplierForm; busy: boolean; error: string; onClose: () => void; onSave: (form: SupplierForm) => void };

const FIELDS = [
  { key: "name", label: "Company Name *", type: "text", placeholder: "e.g. Dhaka Denim Mills", required: true },
  { key: "phone", label: "Business Phone", type: "tel", placeholder: "e.g. +8801811000111", required: false },
  { key: "email", label: "Email Address", type: "email", placeholder: "e.g. orders@denimmills.com", required: false },
  { key: "address", label: "Address", type: "text", placeholder: "e.g. 12 Tejgaon Industrial Area, Dhaka", required: false },
] as const;

export function SupplierFormModal({ initial, busy, error, onClose, onSave }: Props) {
  const [form, setForm] = useState<SupplierForm>(initial);
  const editing = Boolean(form.id);
  return (
    <FormModal
      busy={busy}
      description="Who you buy stock from — used on purchase and inventory reports."
      error={error}
      onClose={onClose}
      onSubmit={() => {
        if (form.name.trim()) onSave(form);
      }}
      submitIcon={editing ? "check" : "plus"}
      submitLabel={editing ? "Update Supplier" : "Add Supplier"}
      title={editing ? "Edit Supplier" : "Add Supplier"}
    >
      {FIELDS.map((field, index) => (
        <FormField key={field.key} label={field.label}>
          <input
            autoFocus={index === 0}
            className={INPUT_CLASS}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            required={field.required}
            type={field.type}
            value={form[field.key]}
          />
        </FormField>
      ))}
      <CheckboxField checked={form.isActive} label="Active supplier" onChange={(isActive) => setForm((f) => ({ ...f, isActive }))} />
    </FormModal>
  );
}
