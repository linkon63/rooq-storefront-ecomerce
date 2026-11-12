import { apiRequest, apiRequestRaw } from "@/lib/admin/http";
import type { DashboardQuery, DashboardSummary, SalesTrendPoint, TopProduct } from "@/types/admin/dashboard";
import type { ReportParams } from "@/types/admin/reports";
import type { AppPolicies, AppSettings, UploadedImage } from "@/types/admin/settings";
import type { ActivityLogEntry, AdminRole, StaffUser, StaffUserInput } from "@/types/admin/staff";
import type { ReportEndpoint } from "@/types/reports";

function dashboardQueryString(query: DashboardQuery): string {
  const params = new URLSearchParams({ period: query.period });
  if (query.period === "custom" && query.startDate && query.endDate) {
    params.set("startDate", query.startDate);
    params.set("endDate", query.endDate);
  }
  if (query.granularity) params.set("granularity", query.granularity);
  return params.toString();
}

export function getDashboardSummary(query: DashboardQuery): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>(`/dashboard/summary?${dashboardQueryString(query)}`);
}

export function getSalesTrend(query: DashboardQuery): Promise<SalesTrendPoint[]> {
  return apiRequest<SalesTrendPoint[]>(`/dashboard/sales-trend?${dashboardQueryString(query)}`);
}

export function getTopProducts(query: DashboardQuery): Promise<TopProduct[]> {
  return apiRequest<TopProduct[]>(`/dashboard/top-products?${dashboardQueryString(query)}`);
}

/** GET /reports/:endpoint as JSON. */
export function getReport<T>(endpoint: ReportEndpoint, params: ReportParams = {}): Promise<T> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return apiRequest<T>(`/reports/${endpoint}?${search.toString()}`);
}

export function getSettings(): Promise<AppSettings> {
  return apiRequest<AppSettings>("/settings");
}

export function updateSettings(body: Partial<AppSettings> & Record<string, unknown>): Promise<AppSettings> {
  return apiRequest<AppSettings>("/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function getPolicies(): Promise<AppPolicies | null> {
  return apiRequest<AppPolicies | null>("/policies");
}

export function updatePolicies(body: Omit<AppPolicies, "id" | "createdAt" | "updatedAt">): Promise<AppPolicies | null> {
  return apiRequest<AppPolicies | null>("/policies", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** POST /upload — stores the image in the database; answers its media URL + id. */
export function uploadAdminImage(file: File, alt?: string): Promise<UploadedImage> {
  const body = new FormData();
  body.append("file", file);
  if (alt) body.append("alt", alt);
  return apiRequest<UploadedImage>("/upload", { method: "POST", body });
}

export const listStaffUsers = () => apiRequest<StaffUser[]>("/users");
export const createStaffUser = (body: StaffUserInput) =>
  apiRequest<StaffUser>("/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
export const updateStaffUser = (id: string, body: Partial<StaffUserInput> & { isActive?: boolean }) =>
  apiRequest<StaffUser>(`/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
export const deleteStaffUser = (id: string) => apiRequest<{ message: string }>(`/users/${id}`, { method: "DELETE" });
export const listRoles = () => apiRequest<AdminRole[]>("/roles");
export const listPermissions = () => apiRequest<{ id: string; name: string }[]>("/permissions");
export const assignRolePermissions = (id: string, permissionIds: string[]) =>
  apiRequest<AdminRole>(`/roles/${id}/permissions`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissionIds }),
  });

export async function downloadReport(
  endpoint: string,
  format: "csv" | "pdf",
  params: Record<string, string>,
) {
  const searchParams = new URLSearchParams({ ...params, format });
  const res = await apiRequestRaw(`/reports/${endpoint}?${searchParams}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${endpoint}-report.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** GET /activity-logs — newest first, capped at `limit` (max 200). */
export const listActivityLogs = (limit = 200) => apiRequest<ActivityLogEntry[]>(`/activity-logs?limit=${limit}`);
