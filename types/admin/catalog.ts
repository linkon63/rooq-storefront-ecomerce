export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: {
    id: string;
    name: string;
  } | null;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  createdAt?: string;
  /** Products using this brand (toBrandResponse). */
  productCount?: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  /** Off = hidden from the website (admin Status switch). */
  isActive?: boolean;
  /** Shown in the storefront as "coming soon". */
  isComingSoon?: boolean;
  createdAt?: string;
  children?: Category[];
  /** Products filed directly under this category (toCategoryResponse). */
  productCount?: number;
  childCount?: number;
};

export type ReorderCategoryItem = {
  id: string;
  parentId: string | null;
  sortOrder: number;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products?: number;
  };
};

export type AttributeValue = {
  id: string;
  value: string;
  attributeId?: string;
};

export type Attribute = {
  id: string;
  name: string;
  values?: AttributeValue[];
};

export type Unit = {
  id: string;
  name: string;
  /** Short form — surfaced in the admin as "Abbreviation". */
  code: string;
  description?: string | null;
  isActive: boolean;
  /** The unit this one converts into. Null on a base unit. */
  parentUnitId?: string | null;
  parentUnit?: Pick<Unit, "id" | "name" | "code"> | null;
  /**
   * How many parent units one of this equals — Kilogram under Gram carries
   * 1000. Always 1 on a base unit. Prisma serialises Decimal as a string, so
   * read it through `unitFactor` rather than trusting the raw value.
   */
  factor?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products?: number;
    childUnits?: number;
  };
};
