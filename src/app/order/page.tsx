"use client";
import { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  cookies,
  BATCH_SIZES,
  BATCH_DISCOUNTS,
  calcSubtotal,
  calcShipping,
  calcTotal,
  type BatchSize,
} from "@/data/cookies";

function centsToEur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

function CanceledNotice() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  if (!canceled) return null;
  return (
    <div className="mb-8 rounded-xl border border-caramel/30 bg-caramel/10 px-6 py-4 text-sm text-cocoa">
      Your payment was cancelled. No charge was made — feel free to try again.
    </div>
  );
}

export default function OrderPage() {
  const router = useRouter();

  const [batchSize, setBatchSize] = useState<BatchSize>(12);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(cookies.map((c) => [c.id, 0]))
  );
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSelected = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities]
  );

  const subtotalCents = calcSubtotal(batchSize);
  const shippingCents = calcShipping(batchSize);
  const totalCents = calcTotal(batchSize);
  const discountRate = BATCH_DISCOUNTS[batchSize];
  const isComplete = totalSelected === batchSize;

  function adjustQty(id: string, delta: number) {
    const cookie = cookies.find((c) => c.id === id);
    if (!cookie?.available) return;
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  async function handleCheckout() {
    setError(null);
    if (!customerName.trim() || !customerEmail.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ id, qty }));

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchSize, items, customerName, customerEmail, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream pt-24 pb-32">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <a
            href="/"
            className="mb-6 inline-block font-display text-xl font-bold tracking-tight text-cocoa"
          >
            Ele&apos;s Cookies
          </a>
          <h1 className="font-display text-4xl font-bold text-cocoa md:text-5xl">
            Place an Order
          </h1>
          <p className="mt-4 text-cocoa/60">
            Pick your batch size, mix your flavours, and pay securely.
          </p>
        </div>

        {/* Cancellation notice */}
        <Suspense fallback={null}>
          <CanceledNotice />
        </Suspense>

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
                  onClick={() => {
                    setBatchSize(size);
                    setQuantities(Object.fromEntries(cookies.map((c) => [c.id, 0])));
                  }}
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
                  <span className="font-display text-3xl font-bold text-cocoa">
                    {size}
                  </span>
                  <span className="mt-1 text-xs text-cocoa/50">cookies</span>
                  {disc > 0 ? (
                    <div className="mt-3">
                      <span className="text-xs text-cocoa/40 line-through">
                        {centsToEur(size * 200)}
                      </span>
                      <p className="font-semibold text-caramel">
                        {centsToEur(sub)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 font-semibold text-cocoa">
                      {centsToEur(total)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 — Cookie picker */}
        <section className="mb-12">
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
                    <Image
                      src={cookie.image}
                      alt={cookie.name}
                      fill
                      className="object-cover"
                    />
                    {!cookie.available && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-cocoa/60">
                        <span className="text-center text-xs font-semibold leading-tight text-white">
                          Coming
                          <br />
                          Soon
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-display text-sm font-semibold text-cocoa">
                        {cookie.name}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-cocoa/50">
                        {cookie.description}
                      </p>
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
                      <span className="w-6 text-center text-sm font-semibold text-cocoa">
                        {qty}
                      </span>
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

        {/* Customer details — shown once box is full */}
        {isComplete && (
          <section className="mb-12">
            <h2 className="mb-6 font-display text-2xl font-semibold text-cocoa">
              3. Your details
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-cocoa">
                  Name <span className="text-caramel">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Elena Papadopoulos"
                  className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/30 focus:border-caramel focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-cocoa">
                  Email <span className="text-caramel">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="elena@example.com"
                  className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/30 focus:border-caramel focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-cocoa">
                  Notes / special requests{" "}
                  <span className="text-cocoa/40">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any allergies or delivery instructions?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-sand bg-white px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/30 focus:border-caramel focus:outline-none"
                />
              </div>
            </div>
          </section>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Sticky counter bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-sand bg-white px-6 py-4 shadow-lg md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                isComplete
                  ? "bg-green-500 text-white"
                  : "bg-sand text-cocoa"
              }`}
            >
              {totalSelected}
            </span>
            <div>
              <p className="text-xs text-cocoa/50">
                {totalSelected} / {batchSize} selected
              </p>
              <p className="text-sm font-semibold text-cocoa">
                {centsToEur(totalCents)}{" "}
                {shippingCents === 0 ? (
                  <span className="text-xs font-normal text-green-600">
                    · Free delivery
                  </span>
                ) : (
                  <span className="text-xs font-normal text-cocoa/50">
                    · incl. {centsToEur(shippingCents)} delivery
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!isComplete || loading}
            className="rounded-full bg-caramel px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-caramel/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Redirecting…" : "Place Order"}
          </button>
        </div>
      </div>
    </main>
  );
}
