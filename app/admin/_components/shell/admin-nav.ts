import { ROLES } from "@/lib/constants/auth";
import type { AdminIconName } from "../admin-icons";

export type AdminNavLink = { label: string; href: string; icon: AdminIconName };

export type AdminNavItem = AdminNavLink & {
  children?: AdminNavLink[];
  /** Only these roles see the item (superadmin always does). Omit for every staff role. */
  roles?: readonly string[];
};

export type AdminNavGroup = { title: string; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" }],
  },
  {
    title: "Inventory & Procurement",
    items: [
      {
        label: "Product Catalog",
        href: "/admin/products",
        icon: "package",
        children: [
          { label: "Products", href: "/admin/products", icon: "package" },
          { label: "Collections & Lookbooks", href: "/admin/collections", icon: "store" },
          { label: "Categories", href: "/admin/categories", icon: "category" },
          { label: "Brands", href: "/admin/brands", icon: "brand" },
          { label: "Colours", href: "/admin/colors", icon: "variants" },
          { label: "Sizes", href: "/admin/sizes", icon: "units" },
          { label: "Size Charts", href: "/admin/size-charts", icon: "report" },
          { label: "Attributes", href: "/admin/variant-options", icon: "filter" },
          { label: "Tags", href: "/admin/tags", icon: "tag" },
          { label: "Units of Measurement", href: "/admin/units", icon: "units" },
          { label: "Suppliers", href: "/admin/suppliers", icon: "suppliers" },
        ],
      },
    ],
  },
  {
    title: "Stock & inventory",
    items: [
      { label: "Stock Management", href: "/admin/stock", icon: "stock" },
      { label: "Back-in-stock Requests", href: "/admin/back-in-stock", icon: "zap" },
    ],
  },
  {
    title: "Sales & Billing",
    items: [
      { label: "POS", href: "/admin/pos", icon: "pos" },
      { label: "Discount", href: "/admin/discounts", icon: "discount" },
      { label: "Coupons & Vouchers", href: "/admin/gift-vouchers", icon: "voucher" },
    ],
  },
  {
    title: "Online Store",
    items: [
      {
        label: "E-Commerce",
        href: "/admin/orders",
        icon: "store",
        children: [
          { label: "New Orders", href: "/admin/orders", icon: "orders" },
          { label: "Canceled Orders", href: "/admin/orders/canceled", icon: "x" },
          { label: "Returned Orders", href: "/admin/orders/returned", icon: "return" },
          { label: "Returns & Exchanges", href: "/admin/returns", icon: "return" },
          { label: "Completed Orders", href: "/admin/orders/completed", icon: "check" },
          { label: "Abandoned Carts", href: "/admin/abandoned-carts", icon: "package" },
          { label: "Reviews", href: "/admin/reviews", icon: "reviews" },
        ],
      },
      { label: "News & Journal", href: "/admin/news", icon: "report" },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Reports",
        href: "/admin/reports",
        icon: "report",
        children: [
          { label: "Sales Report", href: "/admin/reports/sales", icon: "report" },
          { label: "Discount Report", href: "/admin/reports/discount", icon: "discount" },
          { label: "Customer Report", href: "/admin/reports/customer", icon: "reviews" },
          { label: "Inventory Report", href: "/admin/reports/inventory", icon: "stock" },
          { label: "Purchase Report", href: "/admin/reports/purchase", icon: "suppliers" },
        ],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Settings", href: "/admin/settings", icon: "settings" },
      { label: "Staff & Roles", href: "/admin/staff", icon: "user", roles: [ROLES.superadmin] },
      { label: "Activity Log", href: "/admin/activity-log", icon: "report", roles: [ROLES.admin] },
    ],
  },
];
