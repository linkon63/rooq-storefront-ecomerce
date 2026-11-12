import type { ProductFormState } from "@/utils/catalog/product-form";
import type { ProductLookups } from "./lookups";

export type SectionProps = {
  form: ProductFormState;
  set: (patch: Partial<ProductFormState>) => void;
  lookups: ProductLookups;
};
