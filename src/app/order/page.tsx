"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OrderForm from "@/components/OrderForm";

function CanceledNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("canceled") !== "1") return null;
  return (
    <div className="mb-8 rounded-xl border border-caramel/30 bg-caramel/10 px-6 py-4 text-sm text-cocoa">
      Your payment was cancelled. No charge was made — feel free to try again.
    </div>
  );
}

export default function OrderPage() {
  return (
    <main className="min-h-screen bg-cream pt-24">
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

        <Suspense fallback={null}>
          <CanceledNotice />
        </Suspense>

        <OrderForm variant="page" />
      </div>
    </main>
  );
}
