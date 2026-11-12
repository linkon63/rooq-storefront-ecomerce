import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { nextPublishedAt, toNewsResponse, type NewsResponse } from "@/utils/mappers/news";
import { conflict, notFound } from "../http-error";
import { prisma } from "../prisma";
import { mediaRefSelect } from "../media/select";
import { saveImage } from "../media/save-image";
import { fileToBuffer } from "../media/upload";
import { releaseMedia } from "../media/release";
import { resolveMediaId } from "../content/resolve-media";
import type { CreateNewsInput, UpdateNewsInput } from "./schemas";

const newsSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  author: true,
  isPublished: true,
  publishedAt: true,
  coverMediaId: true,
  coverMedia: { select: mediaRefSelect },
  createdAt: true,
  updatedAt: true,
} as const;

type CoverInput = { coverImageUrl?: string | null; coverMediaId?: string | null };
type CoverUpload = { file?: File | null; uploadedById: string; alt: string };

/**
 * The cover the request asks for: a new file wins, then an id / URL from
 * POST /upload. `undefined` = leave as is, `null` = remove.
 */
async function resolveCover(input: CoverInput, upload: CoverUpload): Promise<string | null | undefined> {
  if (upload.file) {
    const saved = await saveImage(await fileToBuffer(upload.file), { alt: upload.alt, uploadedById: upload.uploadedById });
    return saved.id;
  }
  const ref = input.coverMediaId !== undefined ? input.coverMediaId : input.coverImageUrl;
  if (ref === undefined) return undefined;
  if (ref === null || ref.trim() === "") return null;
  return resolveMediaId(ref);
}

async function ensureSlugFree(slug: string, exceptId?: string): Promise<void> {
  const clash = await prisma.news.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== exceptId) throw conflict(ERROR_MESSAGES.news.slugExists(slug));
}

async function findNews(id: string) {
  const news = await prisma.news.findUnique({ where: { id }, select: newsSelect });
  if (!news) throw notFound(ERROR_MESSAGES.news.notFound(id));
  return news;
}

/** Public: only published articles, newest first. */
export async function listPublishedNews(): Promise<NewsResponse[]> {
  const rows = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: newsSelect,
  });
  return rows.map(toNewsResponse);
}

/** Admin: every article (drafts included), newest first. */
export async function listAllNews(): Promise<NewsResponse[]> {
  const rows = await prisma.news.findMany({ orderBy: { createdAt: "desc" }, select: newsSelect });
  return rows.map(toNewsResponse);
}

/** One article by id; drafts are hidden from the public. */
export async function getNews(id: string, { includeDrafts = false } = {}): Promise<NewsResponse> {
  const news = await findNews(id);
  if (!news.isPublished && !includeDrafts) throw notFound(ERROR_MESSAGES.news.notFound(id));
  return toNewsResponse(news);
}

export async function getPublishedNewsBySlug(slug: string): Promise<NewsResponse> {
  const news = await prisma.news.findUnique({ where: { slug }, select: newsSelect });
  if (!news || !news.isPublished) throw notFound(ERROR_MESSAGES.news.notFoundBySlug(slug));
  return toNewsResponse(news);
}

export async function createNews(input: CreateNewsInput, upload: Omit<CoverUpload, "alt">): Promise<NewsResponse> {
  const { coverImageUrl, coverMediaId, isPublished, ...data } = input;
  await ensureSlugFree(data.slug);
  const coverId = await resolveCover({ coverImageUrl, coverMediaId }, { ...upload, alt: data.title });
  const published = isPublished ?? false;
  const row = await prisma.news.create({
    data: { ...data, coverMediaId: coverId ?? null, isPublished: published, publishedAt: published ? new Date() : null },
    select: newsSelect,
  });
  return toNewsResponse(row);
}

export async function updateNews(
  id: string,
  input: UpdateNewsInput,
  upload: Omit<CoverUpload, "alt">,
): Promise<NewsResponse> {
  const existing = await findNews(id);
  const { coverImageUrl, coverMediaId, isPublished, ...data } = input;
  if (data.slug !== undefined) await ensureSlugFree(data.slug, id);

  const coverId = await resolveCover({ coverImageUrl, coverMediaId }, { ...upload, alt: data.title ?? existing.title });
  const publishedAt = nextPublishedAt(existing, isPublished, new Date());

  const row = await prisma.news.update({
    where: { id },
    data: {
      ...data,
      ...(coverId !== undefined ? { coverMediaId: coverId } : {}),
      ...(isPublished !== undefined ? { isPublished } : {}),
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    },
    select: newsSelect,
  });
  if (coverId !== undefined && existing.coverMediaId !== coverId) await releaseMedia([existing.coverMediaId]);
  return toNewsResponse(row);
}

/** Answers the deleted article, as the old endpoint did. */
export async function deleteNews(id: string): Promise<NewsResponse> {
  const existing = await findNews(id);
  await prisma.news.delete({ where: { id } });
  await releaseMedia([existing.coverMediaId]);
  return toNewsResponse(existing);
}
