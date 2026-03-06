"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CartItem = {
  slug: string;
  name: string;
  /** Per-unit subtotal in cents, excluding shipping */
  subtotalCents: number;
  boxSize: number;
  qty: number;
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

const STORAGE_KEY = "eles_basket";
const FREE_SHIPPING_THRESHOLD = 5000; // €50.00
const SHIPPING_CENTS = 250;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
