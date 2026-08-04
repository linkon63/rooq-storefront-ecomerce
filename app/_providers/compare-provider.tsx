"use client";

/**
 * Product comparison list.
 *
 * There is no compare endpoint on the backend, so the list lives entirely in
 * the browser (localStorage) and survives reloads only on this device.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CompareProduct = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  category?: string;
  brand?: string;
};

type CompareContextValue = {
  items: CompareProduct[];
  itemCount: number;
  isInCompare: (productId: string) => boolean;
  toggleCompare: (product: CompareProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
};

const STORAGE_KEY = "organishi:compare";
const MAX_ITEMS = 4;

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareProduct[]>([]);

  // Hydrate after mount so the server and client markup match.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CompareProduct[]);
    } catch {
      // Corrupt payload — start from an empty list.
    }
  }, []);

  const persist = useCallback((next: CompareProduct[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or unavailable (private mode) — keep the in-memory list.
    }
  }, []);

  const isInCompare = useCallback(
    (productId: string) => items.some((item) => item.id === productId),
    [items],
  );

  const toggleCompare = useCallback(
    (product: CompareProduct) => {
      const exists = items.some((item) => item.id === product.id);
      if (exists) {
        persist(items.filter((item) => item.id !== product.id));
        return;
      }
      // Comparing more than four products does not fit the table layout.
      persist([...items, product].slice(-MAX_ITEMS));
    },
    [items, persist],
  );

  const removeFromCompare = useCallback(
    (productId: string) => persist(items.filter((item) => item.id !== productId)),
    [items, persist],
  );

  const clearCompare = useCallback(() => persist([]), [persist]);

  const value = useMemo<CompareContextValue>(
    () => ({
      items,
      itemCount: items.length,
      isInCompare,
      toggleCompare,
      removeFromCompare,
      clearCompare,
    }),
    [items, isInCompare, toggleCompare, removeFromCompare, clearCompare],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
