"use client";
import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  cookies,
  BATCH_SIZES,
  BATCH_DISCOUNTS,
  calcSubtotal,
  calcShipping,
  calcTotal,
  type BatchSize,
} from "@/data/cookies";
import { useCart } from "@/context/CartContext";

function centsToEur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

type Props = {
  /** "page" uses a fixed bottom bar; "modal" uses sticky so it stays inside the scroll container */
  variant: "page" | "modal";
};

export default function OrderForm({ variant }: Props) {
  const cart = useCart();

  const [batchSize, setBatchSize] = useState<BatchSize>(12);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(cookies.map((c) => [c.id, 0]))
  );
  const [added, setAdded] = useState(false);

  const cookiePickerRef = useRef<HTMLElement>(null);

  const totalSelected = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities]
  );

  const subtotalCents = calcSubtotal(batchSize);
  const shippingCents = calcShipping(batchSize);
  const totalCents = calcTotal(batchSize);
  const discountRate = BATCH_DISCOUNTS[batchSize];

  // Savings vs full (undiscounted) price
  const saving24 = 24 * 200 - calcSubtotal(24); // €4.80
  const saving48 = 48 * 200 - calcSubtotal(48); // €14.40

  const upsell =
    batchSize === 12
      ? {
          message: "Add 12 more and save 10%",
          detail: `${centsToEur(calcTotal(24))} for 24 cookies — you save ${centsToEur(saving24)}`,
          nextSize: 24 as BatchSize,
          cta: "Upgrade to 24",
        }
      : batchSize === 24
      ? {
          message: "Add 24 more for 15% off + free delivery",
          detail: `${centsToEur(calcTotal(48))} for 48 cookies — you save ${centsToEur(saving48)}`,
          nextSize: 48 as BatchSize,
          cta: "Upgrade to 48",
        }
      : null;
  const isComplete = totalSelected === batchSize;
  const isOverSelected = totalSelected > batchSize;

  const existingCustom = cart.items.find((i) => i.slug === "custom");

  function adjustQty(id: string, delta: number) {
    const cookie = cookies.find((c) => c.id === id);
    if (!cookie?.available) return;
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  function handleAddToBasket() {
    if (!isComplete || isOverSelected) {
      cookiePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const customCookies = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ id, qty }));

    const newItem = {
      slug: "custom",
      name: `Custom Box (${batchSize} cookies)`,
      subtotalCents: calcSubtotal(batchSize),
      boxSize: batchSize,
      customCookies,
    };

    if (existingCustom) {
      cart.replace({ ...newItem, qty: existingCustom.qty });
    } else {
      cart.add(newItem);
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    cart.openCart();
  }

  const counterBar = (
    <div
      className={`z-10 border-t border-sand bg-white px-6 py-4 shadow-lg md:px-8 ${
        variant === "modal" ? "sticky bottom-0" : "fixed bottom-0 left-0 right-0"
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              isOverSelected ? "bg-red-500 text-white" : isComplete ? "bg-green-500 text-white" : "bg-sand text-cocoa"
            }`}
          >
            {totalSelected}
          </span>
          <div>
            <p className={`text-xs ${isOverSelected ? "font-semibold text-red-500" : "text-cocoa/50"}`}>
              {isOverSelected
                ? `${totalSelected - batchSize} too many — remove some cookies`
                : `${totalSelected} / ${batchSize} selected`}
            </p>
            <p className="text-sm font-semibold text-cocoa">
              {centsToEur(totalCents)}{" "}
              {shippingCents === 0 ? (
                <span className="text-xs font-normal text-green-600">· Free delivery</span>
              ) : (
                <span className="text-xs font-normal text-cocoa/50">
                  · incl. {centsToEur(shippingCents)} delivery
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleAddToBasket}
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-caramel/90"
        >
          {added ? "Added!" : existingCustom ? "Update basket" : "Add to basket"}
        </button>
      </div>
    </div>
  );

  return (
    <div className={variant === "page" ? "pb-24" : ""}>
      {/* Step 1 — Batch size */}
      <section className="mb-12">
        <h2 className="mb-6 font-display text-2xl font-semibold text-cocoa">
          1. Choose your box size
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {BATCH_SIZES.map((size) => {
            const sub = calcSubtotal(size);
            const total = calcTotal(size);
            const disc = BATCH_DISCOUNTS[size];
            const selected = batchSize === size;
            return (
              <button
                key={size}
                onClick={() => { setBatchSize(size); }}
                className={`relative flex flex-col items-center rounded-2xl border-2 p-6 text-center transition-all duration-200 ${
                  selected
                    ? "border-caramel bg-caramel/10 shadow-sm"
                    : "border-sand bg-white hover:border-caramel/50"
                }`}
              >
                {disc > 0 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-caramel px-3 py-0.5 text-xs font-semibold text-white">
                    Save {Math.round(disc * 100)}%
                  </span>
                )}
                <span className="font-display text-3xl font-bold text-cocoa">{size}</span>
                <span className="mt-1 text-xs text-cocoa/50">cookies</span>
                {disc > 0 ? (
                  <div className="mt-3">
                    <span className="text-xs text-cocoa/40 line-through">{centsToEur(size * 200)}</span>
                    <p className="font-semibold text-caramel">{centsToEur(sub)}</p>
                  </div>
                ) : (
                  <p className="mt-3 font-semibold text-cocoa">{centsToEur(total)}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Upsell nudge */}
        {upsell && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-caramel/30 bg-caramel/8 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-cocoa">{upsell.message}</p>
              <p className="mt-0.5 text-xs text-cocoa/60">{upsell.detail}</p>
            </div>
            <button
              onClick={() => {
                setBatchSize(upsell.nextSize);
              }}
              className="shrink-0 rounded-full bg-caramel px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-caramel/90"
            >
              {upsell.cta}
            </button>
          </div>
        )}
      </section>

      {/* Step 2 — Cookie picker */}
      <section ref={cookiePickerRef} className="mb-12">
        <h2 className="mb-6 font-display text-2xl font-semibold text-cocoa">
          2. Mix your flavours
        </h2>
        <p className="mb-6 text-sm text-cocoa/50">
          Each flavour in multiples of 4. Select exactly {batchSize} cookies.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cookies.map((cookie) => {
            const qty = quantities[cookie.id] ?? 0;
            return (
              <div
                key={cookie.id}
                className={`flex gap-4 rounded-2xl bg-white p-4 shadow-sm transition-opacity ${
                  cookie.available ? "" : "opacity-50"
                }`}
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={cookie.image} alt={cookie.name} fill className="object-cover" />
                  {!cookie.available && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-cocoa/60">
                      <span className="text-center text-xs font-semibold leading-tight text-white">
                        Coming<br />Soon
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold text-cocoa">{cookie.name}</p>
                    <p className="mt-0.5 text-xs leading-snug text-cocoa/50">{cookie.description}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => adjustQty(cookie.id, -4)}
                      disabled={!cookie.available || qty === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-sand text-cocoa transition-colors hover:bg-caramel hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={`Remove 4 ${cookie.name}`}
                    >
                      <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                        <rect width="10" height="2" rx="1" fill="currentColor" />
                      </svg>
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-cocoa">{qty}</span>
                    <button
                      onClick={() => adjustQty(cookie.id, 4)}
                      disabled={!cookie.available || totalSelected >= batchSize}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-sand text-cocoa transition-colors hover:bg-caramel hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={`Add 4 ${cookie.name}`}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <rect x="4" width="2" height="10" rx="1" fill="currentColor" />
                        <rect y="4" width="10" height="2" rx="1" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {counterBar}
    </div>
  );
}
