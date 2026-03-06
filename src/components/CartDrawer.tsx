"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { cookies as cookieData } from "@/data/cookies";

function eur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

type FieldErrors = Partial<Record<"name" | "email" | "address1" | "city" | "postalCode" | "giftMessage", string>>;

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/30 focus:outline-none transition-colors ${
    hasError ? "border-red-400 focus:border-red-400" : "border-sand focus:border-caramel"
  }`;
}

// ─── Cart step ────────────────────────────────────────────────────────────────

function CartStep({ onCheckout }: { onCheckout: () => void }) {
  const { items, remove, updateQty, basketSubtotalCents, basketShippingCents, basketTotalCents, closeCart } = useCart();

  return (
    <>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-sand px-6 py-5">
        <p className="font-display text-lg font-bold text-cocoa">Your Basket</p>
        <button onClick={closeCart} aria-label="Close basket" className="flex h-8 w-8 items-center justify-center rounded-full text-cocoa/40 transition-colors hover:bg-sand hover:text-cocoa">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Items */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="text-4xl">🍪</span>
            <p className="font-display text-lg font-semibold text-cocoa">Your basket is empty</p>
            <p className="text-sm text-cocoa/50">Add a box from the shop to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-sand px-6">
            {items.map((item) => (
              <div key={item.slug} className="flex items-center gap-4 py-5">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-cocoa truncate">{item.name}</p>
                  {item.customCookies && item.customCookies.length > 0 ? (
                    <p className="mt-0.5 text-xs leading-snug text-cocoa/50">
                      {item.customCookies.map((cc) => {
                        const name = cookieData.find((c) => c.id === cc.id)?.name ?? cc.id;
                        return `${name} ×${cc.qty}`;
                      }).join(" · ")}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-cocoa/50">{item.boxSize} cookies · {eur(item.subtotalCents)} each</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQty(item.slug, item.qty - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-sand text-cocoa transition-colors hover:bg-caramel hover:text-white"
                    aria-label="Remove one"
                  >
                    <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                      <rect width="10" height="2" rx="1" fill="currentColor" />
                    </svg>
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-cocoa">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.slug, item.qty + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-sand text-cocoa transition-colors hover:bg-caramel hover:text-white"
                    aria-label="Add one"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <rect x="4" width="2" height="10" rx="1" fill="currentColor" />
                      <rect y="4" width="10" height="2" rx="1" fill="currentColor" />
                    </svg>
                  </button>
                </div>
                <p className="w-14 shrink-0 text-right text-sm font-semibold text-cocoa">
                  {eur(item.subtotalCents * item.qty)}
                </p>
                <button onClick={() => remove(item.slug)} aria-label="Remove item" className="shrink-0 text-cocoa/30 transition-colors hover:text-red-400">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals + CTA */}
      {items.length > 0 && (
        <div className="shrink-0 border-t border-sand px-6 py-5">
          <div className="mb-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-cocoa/60">
              <span>Subtotal</span>
              <span>{eur(basketSubtotalCents)}</span>
            </div>
            <div className="flex justify-between text-cocoa/60">
              <span>Delivery</span>
              <span>{basketShippingCents === 0 ? <span className="text-green-600">Free</span> : eur(basketShippingCents)}</span>
            </div>
            <div className="flex justify-between border-t border-sand pt-2 font-semibold">
              <span className="text-cocoa">Total</span>
              <span className="text-caramel">{eur(basketTotalCents)}</span>
            </div>
          </div>
          <button
            onClick={onCheckout}
            className="w-full rounded-full bg-caramel py-3.5 text-sm font-semibold text-white transition-colors hover:bg-caramel/90"
          >
            Checkout →
          </button>
        </div>
      )}
    </>
  );
}

// ─── Checkout form step ───────────────────────────────────────────────────────

function CheckoutStep({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { items, basketSubtotalCents, basketShippingCents, basketTotalCents, clear, closeCart } = useCart();

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

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const address1Ref = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const postalRef = useRef<HTMLInputElement>(null);
  const giftMessageRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit() {
    const errors: FieldErrors = {};
    if (!customerName.trim()) errors.name = "Please enter your name.";
    if (!customerEmail.trim()) errors.email = "Please enter your email.";
    else if (!/\S+@\S+\.\S+/.test(customerEmail)) errors.email = "Please enter a valid email.";
    if (!addressLine1.trim()) errors.address1 = "Please enter your street address.";
    if (!city.trim()) errors.city = "Please enter your city.";
    if (!postalCode.trim()) errors.postalCode = "Please enter your postal code.";
    if (isGift && !giftMessage.trim()) errors.giftMessage = "Please enter a gift message.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstRef = errors.name ? nameRef : errors.email ? emailRef : errors.address1 ? address1Ref : errors.city ? cityRef : errors.postalCode ? postalRef : giftMessageRef;
      firstRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstRef.current?.focus();
      return;
    }

    setFieldErrors({});
    setLoading(true);
    const basketSessionId = localStorage.getItem("eles_basket_session") ?? "";
    try {
      const res = await fetch("/api/checkout/basket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(basketSessionId ? { "x-basket-session": basketSessionId } : {}),
        },
        body: JSON.stringify({
          items: items.map(({ slug, qty, boxSize, customCookies }) => ({
          slug,
          qty,
          boxSize,
          ...(customCookies ? { customCookies } : {}),
        })),
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
      clear();
      closeCart();
      router.push(data.url);
    } catch (err) {
      setFieldErrors({ name: err instanceof Error ? err.message : "Something went wrong" });
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-sand px-6 py-5">
        <button onClick={onBack} aria-label="Back to basket" className="flex h-8 w-8 items-center justify-center rounded-full text-cocoa/40 transition-colors hover:bg-sand hover:text-cocoa">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="font-display text-lg font-bold text-cocoa">Delivery details</p>
      </div>

      {/* Form */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6" data-lenis-prevent>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa">Name <span className="text-caramel">*</span></label>
            <input ref={nameRef} type="text" value={customerName} onChange={(e) => { setCustomerName(e.target.value); if (fieldErrors.name) setFieldErrors(p => ({ ...p, name: undefined })); }} placeholder="Elena Papadopoulos" className={inputClass(!!fieldErrors.name)} />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa">Email <span className="text-caramel">*</span></label>
            <input ref={emailRef} type="email" value={customerEmail} onChange={(e) => { setCustomerEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined })); }} placeholder="elena@example.com" className={inputClass(!!fieldErrors.email)} />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa">Street address <span className="text-caramel">*</span></label>
            <input ref={address1Ref} type="text" value={addressLine1} onChange={(e) => { setAddressLine1(e.target.value); if (fieldErrors.address1) setFieldErrors(p => ({ ...p, address1: undefined })); }} placeholder="123 Makarios Avenue" className={inputClass(!!fieldErrors.address1)} />
            {fieldErrors.address1 && <p className="mt-1 text-xs text-red-500">{fieldErrors.address1}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa">Apartment, floor, etc. <span className="text-cocoa/40">(optional)</span></label>
            <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apt 4B" className={inputClass(false)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-cocoa">City <span className="text-caramel">*</span></label>
              <input ref={cityRef} type="text" value={city} onChange={(e) => { setCity(e.target.value); if (fieldErrors.city) setFieldErrors(p => ({ ...p, city: undefined })); }} placeholder="Limassol" className={inputClass(!!fieldErrors.city)} />
              {fieldErrors.city && <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-cocoa">Postal code <span className="text-caramel">*</span></label>
              <input ref={postalRef} type="text" value={postalCode} onChange={(e) => { setPostalCode(e.target.value); if (fieldErrors.postalCode) setFieldErrors(p => ({ ...p, postalCode: undefined })); }} placeholder="3036" className={inputClass(!!fieldErrors.postalCode)} />
              {fieldErrors.postalCode && <p className="mt-1 text-xs text-red-500">{fieldErrors.postalCode}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa">Notes <span className="text-cocoa/40">(optional)</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any allergies or delivery instructions?" rows={3} className="w-full resize-none rounded-xl border border-sand bg-white px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/30 focus:border-caramel focus:outline-none" />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-sand bg-white px-4 py-3">
            <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="h-4 w-4 accent-caramel" />
            <span className="text-sm font-medium text-cocoa">This is a gift</span>
          </label>

          {isGift && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-cocoa">Gift message <span className="text-caramel">*</span></label>
              <textarea ref={giftMessageRef} value={giftMessage} onChange={(e) => { setGiftMessage(e.target.value); if (fieldErrors.giftMessage) setFieldErrors(p => ({ ...p, giftMessage: undefined })); }} placeholder="Happy birthday! Hope these make your day a little sweeter." rows={3} className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/30 focus:outline-none transition-colors bg-white ${fieldErrors.giftMessage ? "border-red-400 focus:border-red-400" : "border-sand focus:border-caramel"}`} />
              {fieldErrors.giftMessage && <p className="mt-1 text-xs text-red-500">{fieldErrors.giftMessage}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-sand px-6 py-5">
        <div className="mb-4 flex justify-between text-sm font-semibold">
          <span className="text-cocoa">Total</span>
          <span className="text-caramel">{eur(basketTotalCents)}</span>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="w-full rounded-full bg-caramel py-3.5 text-sm font-semibold text-white transition-colors hover:bg-caramel/90 disabled:cursor-not-allowed disabled:opacity-40">
          {loading ? "Redirecting to payment…" : `Pay now — ${eur(basketTotalCents)}`}
        </button>
      </div>
    </>
  );
}

// ─── Drawer shell ─────────────────────────────────────────────────────────────

export default function CartDrawer() {
  const { isOpen, closeCart } = useCart();
  const [step, setStep] = useState<"cart" | "checkout">("cart");

  // Reset to cart step whenever drawer closes
  useEffect(() => {
    if (!isOpen) setStep("cart");
  }, [isOpen]);

  // Freeze Lenis scroll while open
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new Event("lenis:stop"));
      document.body.style.overflow = "hidden";
    } else {
      window.dispatchEvent(new Event("lenis:start"));
      document.body.style.overflow = "";
    }
    return () => {
      window.dispatchEvent(new Event("lenis:start"));
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-cocoa/50 backdrop-blur-sm" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl">
        {step === "cart" ? (
          <CartStep onCheckout={() => setStep("checkout")} />
        ) : (
          <CheckoutStep onBack={() => setStep("cart")} />
        )}
      </div>
    </>
  );
}
