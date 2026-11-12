"use client";

import { useCallback, useEffect, useState } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { createNews, deleteNews, getAllNews, updateNews } from "@/lib/admin-api/content";
import type { News } from "@/types/admin/content";
import { newsFormData, type NewsFormState } from "@/utils/mappers/news-form";

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/** Admin news list (drafts included) with create / update / delete. */
export function useNews() {
  const [items, setItems] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      setItems(await getAllNews());
    } catch (err) {
      setError(messageOf(err, ERROR_MESSAGES.news.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Resolves to an error message, or null on success. */
  async function save(form: NewsFormState): Promise<string | null> {
    try {
      const body = newsFormData(form);
      const saved = form.id ? await updateNews(form.id, body) : await createNews(body);
      setItems((prev) => (form.id ? prev.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...prev]));
      return null;
    } catch (err) {
      return messageOf(err, ERROR_MESSAGES.news.saveFailed);
    }
  }

  async function remove(news: News): Promise<string | null> {
    try {
      await deleteNews(news.id);
      setItems((prev) => prev.filter((item) => item.id !== news.id));
      return null;
    } catch (err) {
      return messageOf(err, ERROR_MESSAGES.news.deleteFailed);
    }
  }

  return { items, isLoading, error, load, save, remove };
}
