import { z } from "zod";

const block = z.object({ title: z.string().trim(), content: z.string() }).nullish();

/** PATCH /policies — UpdatePolicyDto (one `{ title, content }` block per type). */
export const updatePoliciesSchema = z.strictObject({
  delivery: block,
  return: block,
  refund: block,
  cancellation: block,
  privacy: block,
  terms: block,
});

export type UpdatePoliciesInput = z.output<typeof updatePoliciesSchema>;
