import { slugify } from "@/utils/slug";

/** Admin news form state (client) and its multipart encoding. */
export type NewsFormState = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  isPublished: boolean;
  image: File | null;
  coverImageUrl: string | null;
  removeImage: boolean;
};

export const EMPTY_NEWS_FORM: NewsFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  isPublished: false,
  image: null,
  coverImageUrl: null,
  removeImage: false,
};

export type NewsLike = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  author?: string | null;
  isPublished: boolean;
  coverImageUrl?: string | null;
};

export function newsToForm(news: NewsLike): NewsFormState {
  return {
    id: news.id,
    title: news.title,
    slug: news.slug,
    excerpt: news.excerpt ?? "",
    content: news.content,
    author: news.author ?? "",
    isPublished: news.isPublished,
    image: null,
    coverImageUrl: news.coverImageUrl ?? null,
    removeImage: false,
  };
}

export type NewsFormError = "title" | "slug" | "content";

/** First missing required field, or null when the form can be sent. */
export function newsFormError(form: NewsFormState): NewsFormError | null {
  if (!form.title.trim()) return "title";
  if (!(form.slug.trim() || slugify(form.title))) return "slug";
  if (!form.content.trim()) return "content";
  return null;
}

/** Multipart body for POST /news and PATCH /news/:id. */
export function newsFormData(form: NewsFormState): FormData {
  const title = form.title.trim();
  const body = new FormData();
  body.append("title", title);
  body.append("slug", form.slug.trim() || slugify(title));
  body.append("excerpt", form.excerpt.trim());
  body.append("content", form.content);
  body.append("author", form.author.trim());
  body.append("isPublished", String(form.isPublished));
  if (form.image) body.append("image", form.image);
  if (form.id && form.removeImage && !form.image) body.append("coverImageUrl", "");
  return body;
}
