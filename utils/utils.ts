import { Product, ProductVariant, OptionValue } from "@/types/product";
import { getLocalizedText, parsePrice } from "./convert";

export const dedupeFilters = (filters: string): string => {
  const filterArray = filters.split('&&').map(f => f.trim());
  const uniqueFilters = Array.from(new Set(filterArray));
  return uniqueFilters.join(' && ');
};

export const debounce = <T extends (...args: never[]) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const parseMoney = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "").replace(/,/g, "");
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
};

export const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
};

export const getOptions = (v: ProductVariant) => {
    return v?.option_values?.map((opt: OptionValue) => ({
        name: getLocalizedText(opt.option_name),
        value: getLocalizedText(opt.name),
    })) || [];
};

export const getPrice = (v: ProductVariant) => {
    const discount = parsePrice(v?.discount_price);
    const unit = parsePrice(v?.current_pricing?.unit_price);
    const retail = parsePrice(v?.current_pricing?.retail_price);
    return discount ?? retail ?? unit ?? 0;
};

export const getOriginalPrice = (v: ProductVariant) => {
    const discount = parsePrice(v?.discount_price);
    const retail = parsePrice(v?.current_pricing?.retail_price);
    return discount && retail && discount < retail ? retail : null;
};

export const getDiscount = (v: ProductVariant) => {
    const discount = parsePrice(v?.discount_price);
    const retail = parsePrice(v?.current_pricing?.retail_price);
    if (discount && retail && discount < retail) {
        return Math.round(((retail - discount) / retail) * 100);
    }
    return 0;
};

export const getVariantImage = (v: ProductVariant, product: Product) => {
    return v.media?.[0]?.original_url || product.media?.[0]?.original_url || null;
};