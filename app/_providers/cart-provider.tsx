"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/_providers/auth-provider";
import { useWishlist } from "./wishlist-provider";
import {
  getCart,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  mapBackendCart,
  repriceCartItems,
} from "@/lib/cart-api";
import type { CartItem, CartContextValue } from "@/lib/types";

const STORAGE_KEY = "humana-cart";
const SELECTED_STORAGE_KEY = "organishi_selected_cart_keys";

export function getItemKey(item: CartItem): string {
  return item.id || item.variantId || item.slug || item.name;
}

function loadSelectedKeys(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SELECTED_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as string[];
  } catch {
    return null;
  }
}

function saveSelectedKeys(keys: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(keys));
}

const CartContext = createContext<CartContextValue | null>(null);

function sortItems(items: CartItem[]): CartItem[] {
  return [...items].sort((a, b) => (a.slug ?? "").localeCompare(b.slug ?? ""));
}

function loadLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function clearLocalCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { items: wishlistItems, toggleWishlist } = useWishlist();
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialised, setInitialised] = useState(false);
  const prevAuth = useRef(isAuthenticated);

  const fetchServerCart = useCallback(async () => {
    try {
      const data = await getCart();
      setItems(sortItems(mapBackendCart(data)));
    } catch {
      setItems([]);
    }
  }, []);

  const mergeLocalCartToServer = useCallback(async () => {
    const local = loadLocalCart();
    if (local.length === 0) {
      await fetchServerCart();
      return;
    }
    try {
      for (const item of local) {
        if (item.variantId) {
          await addCartItem(item.variantId, item.quantity);
        }
      }
    } catch {
      /* merge silently — fetch will get actual state */
    }
    clearLocalCart();
    await fetchServerCart();
  }, [fetchServerCart]);

  useEffect(() => {
    if (initialised) return;

    if (isAuthenticated) {
      mergeLocalCartToServer().finally(() => setInitialised(true));
    } else {
      setItems(loadLocalCart());
      setInitialised(true);
    }
  }, [isAuthenticated, initialised, mergeLocalCartToServer]);

  useEffect(() => {
    if (!initialised) return;

    const authed = isAuthenticated;
    const was = prevAuth.current;
    prevAuth.current = authed;

    if (authed && !was) {
      mergeLocalCartToServer();
    } else if (!authed && was) {
      saveLocalCart(items);
      setItems(loadLocalCart());
    }
  }, [isAuthenticated, initialised, items, mergeLocalCartToServer]);

  /**
   * Keep every line at today's price.
   *
   * Neither source of a cart knows about product offers: a guest cart is
   * whatever localStorage kept from the moment the line was added, and GET
   * /cart returns the plain variant price. So the catalogue is asked, and the
   * lines are patched with what the shopper actually pays plus the list price
   * to strike through. `repriceCartItems` returns null when nothing moved,
   * which is what keeps this from re-triggering itself.
   */
  useEffect(() => {
    if (!initialised || items.length === 0) return;

    let cancelled = false;
    void repriceCartItems(items)
      .then((repriced) => {
        if (cancelled || !repriced) return;
        setItems(repriced);
        if (!isAuthenticated) saveLocalCart(repriced);
      })
      .catch(() => {
        /* Offers are a nicety — a failed lookup leaves the cart as it was. */
      });

    return () => {
      cancelled = true;
    };
  }, [items, initialised, isAuthenticated]);

  const addItem = useCallback(
    (input: Omit<CartItem, "quantity"> & { quantity?: number }, options?: { silent?: boolean }) => {
      const isSilent = options?.silent ?? false;
      if (isAuthenticated) {
        const qty = input.quantity ?? 1;
        const vId = input.variantId;
        if (!vId) {
          toast.error("Cannot add item: missing variant");
          return Promise.reject(new Error("Cannot add item: missing variant"));
        }
        return addCartItem(vId, qty)
          .then((data) => {
            const next = sortItems(mapBackendCart(data));
            setItems(next);
            if (!isSilent) {
              toast.success("Added to cart");
            }

            // Remove from wishlist if it exists there
            const wishlistMatch = wishlistItems.find(
              (item) => item.slug === input.slug || (item.variantId && vId && item.variantId === vId)
            );
            if (wishlistMatch) {
              toggleWishlist(wishlistMatch);
            }

            // The server owns the cart-item id that keys the selection, so the
            // line can only be read back off the refreshed cart.
            return next.find((i) => i.variantId === vId) ?? ({ ...input, quantity: qty } as CartItem);
          })
          .catch((err: Error) => {
            toast.error(err.message);
            throw err;
          });
      } else {
        // Mirrors the merge the updater performs below, so the caller learns
        // which line it ended up with.
        const existing = items.find((i) => i.slug === input.slug);
        const merged = {
          ...(existing ?? input),
          quantity: (existing?.quantity ?? 0) + (input.quantity ?? 1),
        } as CartItem;

        setItems((prev) => {
          const existing = prev.find((i) => i.slug === input.slug);
          const next = existing
            ? sortItems(
                prev.map((i) =>
                  i.slug === input.slug
                    ? { ...i, quantity: i.quantity + (input.quantity ?? 1) }
                    : i,
                ),
              )
            : sortItems([...prev, { ...input, quantity: input.quantity ?? 1 } as CartItem]);
          saveLocalCart(next);
          return next;
        });
        if (!isSilent) {
          toast.success("Added to cart");
        }

        // Remove from wishlist if it exists there
        const wishlistMatch = wishlistItems.find(
          (item) => item.slug === input.slug || (item.variantId && input.variantId && item.variantId === input.variantId)
        );
        if (wishlistMatch) {
          toggleWishlist(wishlistMatch);
        }
        return Promise.resolve(merged);
      }
    },
    [isAuthenticated, items, wishlistItems, toggleWishlist],
  );

  const removeItem = useCallback(
    (slug: string) => {
      if (isAuthenticated) {
        const target = items.find((i) => i.slug === slug);
        const cartItemId = target?.id;
        if (!cartItemId) return;
        removeCartItem(cartItemId)
          .then((data) => {
            setItems(sortItems(mapBackendCart(data)));
            toast.success("Removed from cart");
          })
          .catch((err: Error) => toast.error(err.message));
      } else {
        setItems((prev) => {
          const next = prev.filter((i) => i.slug !== slug);
          saveLocalCart(next);
          return next;
        });
        toast.success("Removed from cart");
      }
    },
    [isAuthenticated, items],
  );

  const updateQuantity = useCallback(
    (slug: string, quantity: number) => {
      if (isAuthenticated) {
        if (quantity <= 0) {
          removeItem(slug);
          return;
        }
        const target = items.find((i) => i.slug === slug);
        const cartItemId = target?.id;
        if (!cartItemId) return;
        updateCartItemQuantity(cartItemId, quantity)
          .then((data) => setItems(sortItems(mapBackendCart(data))))
          .catch((err: Error) => toast.error(err.message));
      } else {
        setItems((prev) => {
          if (quantity <= 0) {
            const next = prev.filter((i) => i.slug !== slug);
            saveLocalCart(next);
            return next;
          }
          const next = prev.map((i) =>
            i.slug === slug ? { ...i, quantity } : i,
          );
          saveLocalCart(next);
          return next;
        });
      }
    },
    [isAuthenticated, items, removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (!isAuthenticated) {
      clearLocalCart();
    }
    toast.success("Cart cleared");
  }, [isAuthenticated]);

  const [selectedKeys, setSelectedKeysState] = useState<string[]>([]);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedKeysState([]);
      return;
    }
    const allKeys = items.map(getItemKey);
    const stored = loadSelectedKeys();
    if (stored !== null) {
      const validStored = stored.filter((k) => allKeys.includes(k));
      if (validStored.length > 0) {
        setSelectedKeysState(validStored);
      } else {
        setSelectedKeysState(allKeys);
      }
    } else {
      setSelectedKeysState(allKeys);
    }
  }, [items]);

  const setSelectedKeys = useCallback((keys: string[]) => {
    setSelectedKeysState(keys);
    saveSelectedKeys(keys);
  }, []);

  const toggleSelectItem = useCallback((key: string) => {
    setSelectedKeysState((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      saveSelectedKeys(next);
      return next;
    });
  }, []);

  const selectAllItems = useCallback((select: boolean) => {
    setSelectedKeysState((prev) => {
      const next = select ? items.map(getItemKey) : [];
      saveSelectedKeys(next);
      return next;
    });
  }, [items]);

  /**
   * Buy Now is a single-product checkout: the line is added silently — a toast
   * is pointless when the shopper is already on their way — and then pinned as
   * the only selected line, so checkout bills just this product while the rest
   * of the cart stays put. With `includeCart` (the phone sheet) everything
   * already in the cart is selected too, so checkout opens with the whole
   * cart ticked and the shopper unticks what they do not want.
   */
  const buyNow = useCallback(
    async (
      input: Omit<CartItem, "quantity"> & { quantity?: number },
      options?: { includeCart?: boolean },
    ) => {
      const line = await addItem(input, { silent: true });
      const key = getItemKey(line);
      setSelectedKeys(
        options?.includeCart ? [...new Set([...items.map(getItemKey), key])] : [key],
      );
    },
    [addItem, items, setSelectedKeys],
  );

  const selectedItems = useMemo(() => {
    if (selectedKeys.length === 0) return [];
    return items.filter((item) => selectedKeys.includes(getItemKey(item)));
  }, [items, selectedKeys]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        selectedItems,
        selectedKeys,
        itemCount,
        addItem,
        buyNow,
        removeItem,
        updateQuantity,
        clearCart,
        toggleSelectItem,
        selectAllItems,
        setSelectedKeys,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
