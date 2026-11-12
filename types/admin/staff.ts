import type { AdminUser } from "@/types/admin/catalog";

// ─── Platform: staff accounts & roles (superadmin) ──────────────────────────

export type StaffUser = AdminUser & {
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};
export type AdminRole = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions?: { id: string; name: string }[];
  users?: { id: string; name: string; email: string | null }[];
};
export type StaffUserInput = { name: string; email: string; phone: string; password: string; roleId?: string };

export type ActivityLogEntry = {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string | null } | null;
};
