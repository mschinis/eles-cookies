"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
export type SeasonalProduct = {
  name: string;
  priceLabel: string;
  boxSize?: number | null;
  checkoutItems?: { id: string; qty: number }[] | null;
};

type FieldErrors = Partial<
  Record<"name" | "email" | "address1" | "city" | "postalCode", string>
>;

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/30 focus:outline-none transition-colors ${
    hasError ? "border-red-400 focus:border-red-400" : "border-sand focus:border-caramel"
  }`;
}

function CheckoutModal({
  product,
  onClose,
}: {
  product: SeasonalProduct;
  onClose: () => void;
}) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const address1Ref = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const postalRef = useRef<HTMLInputElement>(null);

  // Freeze Lenis while open
  useEffect(() => {
    window.dispatchEvent(new Event("lenis:stop"));
    return () => { window.dispatchEvent(new Event("lenis:start")); };
  }, []);

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit() {
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

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstRef =
        errors.name ? nameRef :
        errors.email ? emailRef :
        errors.address1 ? address1Ref :
        errors.city ? cityRef :
        postalRef;
      firstRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstRef.current?.focus();
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSize: product.boxSize,
          items: product.checkoutItems,
          customerName,
          customerEmail,
          addressLine1,
          addressLine2,
          city,
          postalCode,
          notes,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-cocoa/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-sand px-6 py-5">
          <div>
            <p className="font-display text-lg font-bold text-cocoa">{product.name}</p>
            <p className="text-xs text-cocoa/50">{product.priceLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-cocoa/40 transition-colors hover:bg-sand hover:text-cocoa"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable form */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6" data-lenis-prevent>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-cocoa">
                Name <span className="text-caramel">*</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); if (fieldErrors.name) setFieldErrors(p => ({ ...p, name: undefined })); }}
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
                onChange={(e) => { setCustomerEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined })); }}
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
                onChange={(e) => { setAddressLine1(e.target.value); if (fieldErrors.address1) setFieldErrors(p => ({ ...p, address1: undefined })); }}
                placeholder="123 Makarios Avenue"
                className={inputClass(!!fieldErrors.address1)}
              />
              {fieldErrors.address1 && <p className="mt-1 text-xs text-red-500">{fieldErrors.address1}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-cocoa">
                Apartment, floor, etc. <span className="text-cocoa/40">(optional)</span>
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
                  onChange={(e) => { setCity(e.target.value); if (fieldErrors.city) setFieldErrors(p => ({ ...p, city: undefined })); }}
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
                  onChange={(e) => { setPostalCode(e.target.value); if (fieldErrors.postalCode) setFieldErrors(p => ({ ...p, postalCode: undefined })); }}
                  placeholder="3036"
                  className={inputClass(!!fieldErrors.postalCode)}
                />
                {fieldErrors.postalCode && <p className="mt-1 text-xs text-red-500">{fieldErrors.postalCode}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-cocoa">
                Notes <span className="text-cocoa/40">(optional)</span>
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
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 border-t border-sand px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-full bg-caramel py-3.5 text-sm font-semibold text-white transition-colors hover:bg-caramel/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Redirecting to payment…" : `Order now — ${product.priceLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SeasonalCheckoutButton({ product }: { product: SeasonalProduct }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-1 items-center justify-center rounded-full bg-caramel px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-caramel/90"
      >
        Order now
      </button>
      {open && <CheckoutModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
