"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { getProductOptions, saveProductDiscount } from "@/lib/admin-api/content";
import { apiRequest } from "@/lib/admin/http";
import type { ProductDiscountInput, ProductOption } from "@/types/admin/content";
import { type DiscountForm, type ProductDiscount } from "@/types/product-discount";

const emptyForm: DiscountForm = {
  name: "",
  type: "percentage",
  value: "",
  productIds: [],
  startDate: "",
  endDate: "",
  status: "active",
};

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);
/** "" on the form means "no date": cleared on update, omitted on create. */
const dateValue = (value: string, isUpdate: boolean) => (value ? new Date(value).toISOString() : isUpdate ? null : undefined);

function formError(form: DiscountForm): string | null {
  if (!form.name.trim()) return ERROR_MESSAGES.discount.nameRequired;
  if (!form.value || Number(form.value) <= 0) return ERROR_MESSAGES.discount.valueRequired;
  if (form.productIds.length === 0) return ERROR_MESSAGES.discount.productsRequired;
  return null;
}

export function useDiscountForm({
  isOpen,
  discountId,
  onSaved,
  onClose,
}: {
  isOpen: boolean;
  discountId: string | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [form, setForm] = useState<DiscountForm>(emptyForm);
  const [productSearch, setProductSearch] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return query ? products.filter((p) => p.name.toLowerCase().includes(query)) : products;
  }, [products, productSearch]);

  const canSubmit = form.name.trim() !== "" && Number(form.value) > 0 && form.productIds.length > 0;

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setError("");
    setProductSearch("");
    setForm(emptyForm);
    setIsLoadingProducts(true);

    getProductOptions()
      .then((list) => !cancelled && setProducts(list))
      .catch((err: unknown) => {
        if (cancelled) return;
        setProducts([]);
        setError(messageOf(err, ERROR_MESSAGES.discount.productsLoadFailed));
      })
      .finally(() => !cancelled && setIsLoadingProducts(false));

    if (discountId) {
      apiRequest<ProductDiscount>(`/product-discounts/${discountId}`)
        .then((full) => {
          if (cancelled) return;
          setForm({
            id: full.id,
            name: full.name,
            type: full.type,
            value: String(Number(full.value)),
            productIds: (full.products ?? []).map((link) => link.productId),
            startDate: full.startDate ? full.startDate.split("T")[0] : "",
            endDate: full.endDate ? full.endDate.split("T")[0] : "",
            status: full.status,
          });
        })
        .catch((err: unknown) => !cancelled && setError(messageOf(err, ERROR_MESSAGES.discount.notFound(discountId))));
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, discountId]);

  function close() {
    if (isSaving) return;
    setError("");
    setForm(emptyForm);
    onClose();
  }

  function toggleProduct(productId: string) {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = formError(form);
    setError(invalid ?? "");
    if (invalid) return;

    setIsSaving(true);
    const isUpdate = Boolean(form.id);
    const body: ProductDiscountInput = {
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
      productIds: form.productIds,
      status: form.status,
      startDate: dateValue(form.startDate, isUpdate),
      endDate: dateValue(form.endDate, isUpdate),
    };
    try {
      await saveProductDiscount(form.id, body);
      setForm(emptyForm);
      onSaved();
      onClose();
    } catch (err) {
      setError(messageOf(err, ERROR_MESSAGES.discount.saveFailed));
    } finally {
      setIsSaving(false);
    }
  }

  return {
    products,
    filteredProducts,
    form,
    setForm,
    productSearch,
    setProductSearch,
    error,
    isSaving,
    isLoadingProducts,
    canSubmit,
    handleSubmit,
    toggleProduct,
    close,
  };
}
