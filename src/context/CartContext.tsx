"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type CartItem = {
  slug: string;
  name: string;
  /** Per-unit subtotal in cents, excluding shipping */
  subtotalCents: number;
  boxSize: number;
  qty: number;
  /** Only present for custom-built boxes */
  customCookies?: { id: string; qty: number }[];
};

type CartContextType = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (slug: string) => void;
  updateQty: (slug: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  basketSubtotalCents: number;
  basketShippingCents: number;
  basketTotalCents: number;
};

const CartContext = createContext<CartContextType | null>(null);

const SESSION_KEY = "eles_basket_session";
const FREE_SHIPPING_THRESHOLD = 5000; // €50.00
const SHIPPING_CENTS = 250;
const SYNC_DEBOUNCE_MS = 800;

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from server on mount
  useEffect(() => {
    async function hydrate() {
      const sessionId = getOrCreateSessionId();
      sessionIdRef.current = sessionId;

      try {
        const res = await fetch("/api/basket", {
          headers: { "x-basket-session": sessionId },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items as CartItem[]);
          }
        }
      } catch {}

      setHydrated(true);
    }
    hydrate();
  }, []);

  // Debounced server sync on items change
  useEffect(() => {
    if (!hydrated || !sessionIdRef.current) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      fetch("/api/basket", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-basket-session": sessionIdRef.current!,
        },
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }, SYNC_DEBOUNCE_MS);
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (existing) return prev.map((i) => i.slug === item.slug ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const updateQty = useCallback((slug: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.slug !== slug));
    } else {
      setItems((prev) => prev.map((i) => i.slug === slug ? { ...i, qty } : i));
    }
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const basketSubtotalCents = items.reduce((s, i) => s + i.subtotalCents * i.qty, 0);
  const basketShippingCents = basketSubtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CENTS;
  const basketTotalCents = basketSubtotalCents + basketShippingCents;

  return (
    <CartContext.Provider value={{
      items, add, remove, updateQty, clear,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      totalItems, basketSubtotalCents, basketShippingCents, basketTotalCents,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
