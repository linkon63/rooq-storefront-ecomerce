"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  assignRolePermissions,
  createStaffUser,
  deleteStaffUser,
  listPermissions,
  listRoles,
  listStaffUsers,
  updateStaffUser,
} from "@/lib/admin-api/platform";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { AdminRole, StaffUser, StaffUserInput } from "@/types/admin/staff";
import { errorText } from "@/utils/api-error";

export type Permission = { id: string; name: string };

/** Staff accounts, roles and permissions for the superadmin Staff & Roles page. */
export function useStaff() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [nextUsers, nextRoles, nextPermissions] = await Promise.all([listStaffUsers(), listRoles(), listPermissions()]);
      setUsers(nextUsers);
      setRoles(nextRoles);
      setPermissions(nextPermissions);
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.user.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run<T>(id: string, task: () => Promise<T>, fallback: string): Promise<T | null> {
    setBusyId(id);
    try {
      return await task();
    } catch (err) {
      toast.error(errorText(err, fallback));
      return null;
    } finally {
      setBusyId(null);
    }
  }

  async function create(input: StaffUserInput): Promise<boolean> {
    const created = await run("new", () => createStaffUser(input), ERROR_MESSAGES.user.saveFailed);
    if (!created) return false;
    setUsers((prev) => [created, ...prev]);
    toast.success(SUCCESS_MESSAGES.staff.userCreated(created.name));
    return true;
  }

  async function update(id: string, body: Partial<StaffUserInput> & { isActive?: boolean }) {
    const updated = await run(id, () => updateStaffUser(id, body), ERROR_MESSAGES.user.saveFailed);
    if (!updated) return;
    setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
    toast.success(SUCCESS_MESSAGES.staff.userUpdated);
  }

  async function remove(id: string) {
    const done = await run(id, () => deleteStaffUser(id), ERROR_MESSAGES.user.deleteFailed);
    if (!done) return;
    setUsers((prev) => prev.filter((user) => user.id !== id));
    toast.success(SUCCESS_MESSAGES.staff.userRemoved);
  }

  async function savePermissions(role: AdminRole, permissionIds: string[]) {
    const updated = await run(role.id, () => assignRolePermissions(role.id, permissionIds), ERROR_MESSAGES.role.permissionsSaveFailed);
    if (!updated) return;
    setRoles((prev) => prev.map((item) => (item.id === role.id ? { ...item, ...updated } : item)));
    toast.success(SUCCESS_MESSAGES.staff.permissionsSaved(role.name));
  }

  return { users, roles, permissions, isLoading, busyId, error, create, update, remove, savePermissions };
}
