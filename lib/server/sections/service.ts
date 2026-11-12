import "server-only";
import type { Section } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { conflict, notFound } from "../http-error";
import { prisma } from "../prisma";
import type { CreateSectionInput, UpdateSectionInput } from "./schemas";

/** Every section, ordered for rendering (page, then position). */
export function listSections(page?: string): Promise<Section[]> {
  return prisma.section.findMany({
    where: page ? { page } : undefined,
    orderBy: [{ position: "asc" }, { title: "asc" }],
  });
}

export async function getSection(id: string): Promise<Section> {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) throw notFound(ERROR_MESSAGES.section.notFound(id));
  return section;
}

async function ensureTitleFree(title: string, page: string, exceptId?: string): Promise<void> {
  const clash = await prisma.section.findUnique({ where: { page_title: { page, title } }, select: { id: true } });
  if (clash && clash.id !== exceptId) throw conflict(ERROR_MESSAGES.section.titleExists(title, page));
}

export async function createSection(input: CreateSectionInput): Promise<Section> {
  await ensureTitleFree(input.title, input.page);
  return prisma.section.create({ data: input });
}

export async function updateSection(id: string, input: UpdateSectionInput): Promise<Section> {
  const existing = await getSection(id);
  if (input.title !== undefined || input.page !== undefined) {
    await ensureTitleFree(input.title ?? existing.title, input.page ?? existing.page, id);
  }
  return prisma.section.update({ where: { id }, data: input });
}

/** Campaigns restrict the delete, so refuse with a clear message instead of a raw FK error. */
export async function deleteSection(id: string): Promise<Section> {
  await getSection(id);
  const campaigns = await prisma.campaign.count({ where: { sectionId: id } });
  if (campaigns > 0) throw conflict(ERROR_MESSAGES.section.inUse);
  return prisma.section.delete({ where: { id } });
}
