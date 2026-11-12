"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, clearAdminSession } from "@/lib/admin/http";
import type { AdminUser } from "@/types/admin/catalog";
import { isStaffRole } from "@/utils/roles";

const LOGIN_PATH = "/admin/login";

/** Verifies the admin token against /auth/me; non-staff or expired sessions go to the login page. */
export function useAdminSession() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const signOut = () => {
      clearAdminSession();
      router.replace(LOGIN_PATH);
    };
    apiRequest<AdminUser>("/auth/me")
      .then((current) => {
        if (!isMounted) return;
        if (!isStaffRole(current.role?.name)) return signOut();
        setUser(current);
      })
      .catch(signOut)
      .finally(() => {
        if (isMounted) setIsChecking(false);
      });
    return () => {
      isMounted = false;
    };
  }, [router]);

  function logout() {
    clearAdminSession();
    router.replace(LOGIN_PATH);
    router.refresh();
  }

  return { user, isChecking, logout };
}
