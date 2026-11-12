import "server-only";
import { cache } from "react";
import type { Prisma } from "@/lib/generated/prisma/client";
import { POLICY_TYPES, toPoliciesResponse, type PoliciesResponse } from "@/utils/mappers/policies";
import { prisma } from "../prisma";
import type { UpdatePoliciesInput } from "./schemas";

const policySelect = { type: true, title: true, content: true, updatedAt: true } as const;

/** GET /policies — `{ delivery: { title, content }, … }`, or null when none exist. */
export async function getPolicies(): Promise<PoliciesResponse | null> {
  return toPoliciesResponse(await prisma.policy.findMany({ select: policySelect }));
}

/** Server components: deduplicated per request. */
export const getStorePolicies = cache(getPolicies);

/**
 * PATCH /policies — upserts every block sent. A null block, or one with
 * empty content, removes that policy.
 */
export async function upsertPolicies(input: UpdatePoliciesInput): Promise<PoliciesResponse | null> {
  const writes: Prisma.PrismaPromise<unknown>[] = [];
  for (const type of POLICY_TYPES) {
    const block = input[type];
    if (block === undefined) continue;
    if (block === null || !block.content.trim()) {
      writes.push(prisma.policy.deleteMany({ where: { type } }));
      continue;
    }
    const data = { title: block.title || type, content: block.content };
    writes.push(prisma.policy.upsert({ where: { type }, update: data, create: { type, ...data } }));
  }
  await prisma.$transaction(writes);
  return getPolicies();
}
