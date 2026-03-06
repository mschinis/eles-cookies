"use client";
import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

type FieldErrors = Partial<
  Record<"name" | "email" | "address1" | "city" | "postalCode" | "giftMessage", string>
>;

type Props = {
  /** "page" uses a fixed bottom bar; "modal" uses sticky so it stays inside the scroll container */
  variant: "page" | "modal";
};

export default function OrderForm({ variant }: Props) {
  const router = useRouter();

  const [batchSize, setBatchSize] = useState<BatchSize>(12);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(cookies.map((c) => [c.id, 0]))
  );
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const cookiePickerRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const address1Ref = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const postalRef = useRef<HTMLInputElement>(null);
  const giftMessageRef = useRef<HTMLTextAreaElement>(null);

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

  function adjustQty(id: string, delta: number) {
    const cookie = cookies.find((c) => c.id === id);
    if (!cookie?.available) return;
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  async function handleCheckout() {
    if (!isComplete) {
      cookiePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const errors: FieldErrors = {};
    if (!customerName.trim()) errors.name = "Please enter your name.";
    if (!customerEmail.trim()) {
      errors.email = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!addressLine1.trim()) errors.address1 = "Please enter your street address.";
    if (!city.trim()) errors.city = "Please enter your city.";
    if (!postalCode.trim()) errors.postalCode = "Please enter your postal code.";
    if (isGift && !giftMessage.trim()) errors.giftMessage = "Please enter a gift message.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstRef =
        errors.name ? nameRef :
        errors.email ? emailRef :
        errors.address1 ? address1Ref :
        errors.city ? cityRef :
        errors.postalCode ? postalRef :
        giftMessageRef;
      firstRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstRef.current?.focus();
      return;
    }

    setFieldErrors({});
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ id, qty }));

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSize,
          items,
          customerName,
          customerEmail,
          addressLine1,
          addressLine2,
          city,
          postalCode,
          notes,
          isGift,
          giftMessage: isGift ? giftMessage : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(data.url);
    } catch (err) {
      setFieldErrors({ name: err instanceof Error ? err.message : "Something went wrong" });
      setLoading(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/30 focus:outline-none transition-colors ${
      hasError ? "border-red-400 focus:border-red-400" : "border-sand focus:border-caramel"
    }`;

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
              isComplete ? "bg-green-500 text-white" : "bg-sand text-cocoa"
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
          onClick={handleCheckout}
          disabled={loading}
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-caramel/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Redirecting…" : "Place Order"}
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
                setQuantities(Object.fromEntries(cookies.map((c) => [c.id, 0])));
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

      {/* Step 3 — Your details */}
      <section className="mb-6">
        <h2 className="mb-6 font-display text-2xl font-semibold text-cocoa">
          3. Your details
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa">
              Name <span className="text-caramel">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="Elena Papadopoulos"
              className={inputClass(!!fieldErrors.name)}
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa">
              Email <span className="text-caramel">*</span>
            </label>
            <input
              ref={emailRef}
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="elena@example.com"
              className={inputClass(!!fieldErrors.email)}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa">
              Street address <span className="text-caramel">*</span>
            </label>
            <input
              ref={address1Ref}
              type="text"
              value={addressLine1}
              onChange={(e) => {
                setAddressLine1(e.target.value);
                if (fieldErrors.address1) setFieldErrors((p) => ({ ...p, address1: undefined }));
              }}
              placeholder="123 Makarios Avenue"
              className={inputClass(!!fieldErrors.address1)}
            />
            {fieldErrors.address1 && <p className="mt-1 text-xs text-red-500">{fieldErrors.address1}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa">
              Apartment, floor, etc.{" "}
              <span className="text-cocoa/40">(optional)</span>
            </label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Apt 4B"
              className={inputClass(false)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-cocoa">
                City <span className="text-caramel">*</span>
              </label>
              <input
                ref={cityRef}
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (fieldErrors.city) setFieldErrors((p) => ({ ...p, city: undefined }));
                }}
                placeholder="Limassol"
                className={inputClass(!!fieldErrors.city)}
              />
              {fieldErrors.city && <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-cocoa">
                Postal code <span className="text-caramel">*</span>
              </label>
              <input
                ref={postalRef}
                type="text"
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                  if (fieldErrors.postalCode) setFieldErrors((p) => ({ ...p, postalCode: undefined }));
                }}
                placeholder="3036"
                className={inputClass(!!fieldErrors.postalCode)}
              />
              {fieldErrors.postalCode && <p className="mt-1 text-xs text-red-500">{fieldErrors.postalCode}</p>}
            </div>
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

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-sand bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={isGift}
              onChange={(e) => setIsGift(e.target.checked)}
              className="h-4 w-4 accent-caramel"
            />
            <span className="text-sm font-medium text-cocoa">This is a gift</span>
          </label>

          {isGift && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-cocoa">
                Gift message <span className="text-caramel">*</span>
              </label>
              <textarea
                ref={giftMessageRef}
                value={giftMessage}
                onChange={(e) => { setGiftMessage(e.target.value); if (fieldErrors.giftMessage) setFieldErrors((p) => ({ ...p, giftMessage: undefined })); }}
                placeholder="Happy birthday! Hope these make your day a little sweeter."
                rows={3}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/30 focus:outline-none transition-colors bg-white ${fieldErrors.giftMessage ? "border-red-400 focus:border-red-400" : "border-sand focus:border-caramel"}`}
              />
              {fieldErrors.giftMessage && <p className="mt-1 text-xs text-red-500">{fieldErrors.giftMessage}</p>}
            </div>
          )}
        </div>
      </section>

      {counterBar}
    </div>
  );
}
