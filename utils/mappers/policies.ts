export const POLICY_TYPES = ["delivery", "return", "refund", "cancellation", "privacy", "terms"] as const;
export type PolicyKey = (typeof POLICY_TYPES)[number];

export type PolicyBlock = { title: string; content: string };
export type PolicyRow = { type: PolicyKey; title: string; content: string; updatedAt: Date };

/** The old single-row shape the UI reads: `{ delivery: { title, content }, … }`. */
export type PoliciesResponse = Partial<Record<PolicyKey, PolicyBlock>> & { updatedAt?: Date };

export function toPoliciesResponse(rows: readonly PolicyRow[]): PoliciesResponse | null {
  if (rows.length === 0) return null;
  const response: PoliciesResponse = {};
  let latest = rows[0].updatedAt;
  for (const row of rows) {
    response[row.type] = { title: row.title, content: row.content };
    if (row.updatedAt > latest) latest = row.updatedAt;
  }
  response.updatedAt = latest;
  return response;
}
