"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate } from "../../../../lib/admin-api";

type Supplier = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

type SupplierForm = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
};

const emptyForm: SupplierForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  isActive: true,
};

const PAGE_SIZE = 10;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) =>
      `${s.name} ${s.phone ?? ""} ${s.email ?? ""} ${s.address ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [search, suppliers]);

  // Reset visibleCount when search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const paginatedSuppliers = useMemo(() => {
    return filteredSuppliers.slice(0, visibleCount);
  }, [filteredSuppliers, visibleCount]);

  function handleLoadMore() {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 300);
  }

  useEffect(() => {
    if (isLoadingMore || paginatedSuppliers.length >= filteredSuppliers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [isLoadingMore, paginatedSuppliers.length, filteredSuppliers.length]);

  async function loadSuppliers() {
    setError("");
    setIsLoading(true);
    try {
      const data = await apiRequest<Supplier[]>("/suppliers");
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suppliers");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSuppliers();
  }, []);

  function handleEdit(supplier: Supplier) {
    setError("");
    setForm({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      isActive: supplier.isActive,
    });
    setIsModalOpen(true);
  }

  function handleAddNew() {
    setError("");
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setError("");
    setForm(emptyForm);
    setIsModalOpen(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return;

    setIsSaving(true);
    try {
      const url = form.id ? `/suppliers/${form.id}` : "/suppliers";
      const method = form.id ? "PATCH" : "POST";
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        isActive: form.isActive,
      };

      await apiRequest<Supplier>(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setIsModalOpen(false);
      await loadSuppliers();
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save supplier");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!supplierToDelete) return;
    setError("");
    try {
      await apiRequest(`/suppliers/${supplierToDelete.id}`, { method: "DELETE" });
      setSupplierToDelete(null);
      await loadSuppliers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete supplier");
    }
  }

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Manage procurement suppliers and vendors."
        action={
          <div className="flex gap-3 items-center">
            {showSearchInput ? (
              <div className="relative flex h-11 w-64 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search suppliers..."
                  value={search}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearch("");
                    setShowSearchInput(false);
                  }}
                  className="grid h-6 w-6 place-items-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                  title="Close search"
                  type="button"
                >
                  <AdminIcon className="h-4 w-4" name="x" />
                </button>
              </div>
            ) : (
              <button
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm cursor-pointer"
                onClick={() => setShowSearchInput(true)}
                type="button"
                title="Search suppliers"
              >
                <AdminIcon className="h-5 w-5 text-slate-600" name="search" />
              </button>
            )}
            <button
              onClick={handleAddNew}
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[14px] font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Supplier
            </button>
          </div>
        }
      />

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-500">
            {filteredSuppliers.length} {filteredSuppliers.length === 1 ? "supplier" : "suppliers"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {["Company Name", "Contact", "Address", "Status", "Products", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-sm font-semibold text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-slate-500">Loading suppliers...</td></tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center font-medium text-slate-400">No suppliers found.</td></tr>
              ) : (
                paginatedSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="odd:bg-white even:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">{supplier.name}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {supplier.phone && <div className="text-slate-800 font-medium">{supplier.phone}</div>}
                      {supplier.email && <div className="text-xs text-slate-400">{supplier.email}</div>}
                      {!supplier.phone && !supplier.email && <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 max-w-[200px] truncate">{supplier.address ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          supplier.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {supplier.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{supplier._count?.products ?? 0}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(supplier.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          type="button"
                          title="Edit supplier"
                        >
                          <AdminIcon className="h-4 w-4" name="edit" />
                        </button>
                        <button
                          onClick={() => setSupplierToDelete(supplier)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          type="button"
                          title="Delete supplier"
                        >
                          <AdminIcon className="h-4 w-4" name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lazy Loading / Pagination Footer */}
        {!isLoading && filteredSuppliers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col items-start gap-1.5">
              <p className="text-sm font-medium text-slate-500">
                Showing <span className="font-bold text-slate-800">{paginatedSuppliers.length}</span> of{" "}
                <span className="font-bold text-slate-800">{filteredSuppliers.length}</span> suppliers
              </p>
              <div className="h-1.5 w-48 overflow-hidden rounded bg-slate-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, (paginatedSuppliers.length / filteredSuppliers.length) * 100)}%` }}
                />
              </div>
            </div>

            {paginatedSuppliers.length < filteredSuppliers.length ? (
              <div
                ref={observerTarget}
                className="flex items-center gap-2 py-2 text-xs font-semibold text-slate-500"
              >
                <svg className="animate-spin h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading more on scroll...</span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-400">All suppliers loaded</span>
            )}
          </div>
        )}
      </section>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-panel flex w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white shadow-2xl min-h-[460px] max-h-[calc(100vh-3rem)]" onSubmit={handleSubmit}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-5 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{form.id ? "Edit Supplier" : "Add Supplier"}</h3>
                <p className="mt-1 text-xs text-slate-500">Company details and contact information.</p>
              </div>
              <button type="button" disabled={isSaving} onClick={closeModal} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer">
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>
            <div className="flex-1 modal-body px-6 py-5">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Company Name *</span>
                  <input
                    autoFocus
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Acme Organic Sourcing"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Business Phone</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g. +8801811000111"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Email Address</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. supplier@organishi.com"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Address</span>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="e.g. 12 Organic Farm Road, Sylhet"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                  />
                </label>
                <label className="flex items-center gap-2 pt-1 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Active Supplier Status</span>
                </label>
                {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 shrink-0">
              <button type="button" disabled={isSaving} onClick={closeModal} className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white disabled:bg-slate-400 hover:bg-blue-700 transition-colors cursor-pointer">
                <AdminIcon className="h-4 w-4" name={form.id ? "check" : "plus"} />
                {isSaving ? "Saving..." : form.id ? "Update Supplier" : "Add Supplier"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!supplierToDelete}
        onClose={() => {
          setSupplierToDelete(null);
          setError("");
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message={`Delete "${supplierToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes"
        cancelText="No"
        isDestructive
        error={error}
      />
    </>
  );
}
