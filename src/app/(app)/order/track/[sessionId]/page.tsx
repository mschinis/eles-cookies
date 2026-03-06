import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Order, Cooky } from "@/payload-types";
import { cookies as cookieData } from "@/data/cookies";

function centsToEur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

async function getOrder(sessionId: string): Promise<Order | null> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "orders",
    where: { stripeSessionId: { equals: sessionId } },
    depth: 1,
    limit: 1,
  });
  return (result.docs[0] as Order) ?? null;
}

// ─── Status stepper ───────────────────────────────────────────────────────────

const steps = [
  { key: "confirmed",  label: "Order confirmed",  description: "Payment received and order placed." },
  { key: "baking",     label: "Being prepared",   description: "Your cookies are being freshly baked." },
  { key: "fulfilled",  label: "Delivered",         description: "Your box has been delivered. Enjoy!" },
];

function stepIndex(status: Order["status"]): number {
  if (status === "fulfilled") return 2;
  if (status === "confirmed") return 1;
  return 0;
}

function Stepper({ status }: { status: Order["status"] }) {
  const current = stepIndex(status);

  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const done    = i < current;
        const active  = i === current;
        const isLast  = i === steps.length - 1;

        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            {/* Connector + circle row */}
            <div className="flex w-full items-center">
              {/* Left line */}
              <div className={`h-0.5 flex-1 transition-colors ${i === 0 ? "invisible" : done || active ? "bg-caramel" : "bg-sand"}`} />
              {/* Circle */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done    ? "border-caramel bg-caramel text-white" :
                  active  ? "border-caramel bg-white text-caramel" :
                            "border-sand bg-white text-cocoa/30"
                }`}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              {/* Right line */}
              <div className={`h-0.5 flex-1 transition-colors ${isLast ? "invisible" : done ? "bg-caramel" : "bg-sand"}`} />
            </div>

            {/* Label + description */}
            <div className="mt-3 px-1 text-center">
              <p className={`text-xs font-semibold ${active ? "text-caramel" : done ? "text-cocoa" : "text-cocoa/30"}`}>
                {step.label}
              </p>
              {active && (
                <p className="mt-1 text-xs leading-snug text-cocoa/50">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TrackPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const order = await getOrder(sessionId);

  if (!order) notFound();

  const isCancelled = order.status === "cancelled";

  const isBasket = order.orderType === "basket";

  type TrackItem = { name: string; qty: number; subItems?: { name: string; qty: number }[] };
  const items: TrackItem[] = isBasket
    ? (order.basketItems ?? []).map((item) => {
        const cc = item.customCookies as { id: string; qty: number }[] | null | undefined;
        if (cc?.length) {
          return { name: item.productName, qty: item.qty, subItems: cc.map((c) => ({ name: cookieData.find((d) => d.id === c.id)?.name ?? c.id, qty: c.qty * item.qty })) };
        }
        return { name: item.productName, qty: item.qty };
      })
    : (order.items ?? []).map((item) => ({ name: (item.cookie as Cooky).name, qty: item.qty }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-24">
        <div className="mx-auto max-w-lg px-6 py-12">
          {/* Header */}
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-caramel">
              Order tracking
            </span>
            <h1 className="font-display text-3xl font-bold text-cocoa md:text-4xl">
              Hi, {order.customerName.split(" ")[0]}!
            </h1>
            <p className="mt-2 text-sm text-cocoa/60">
              Here&apos;s the latest on your order of {order.batchSize} cookies.
            </p>
          </div>

          {/* Status */}
          {isCancelled ? (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-6 text-center">
              <p className="font-display text-lg font-semibold text-red-700">Order cancelled</p>
              <p className="mt-1 text-sm text-red-600/80">
                This order has been cancelled. If you have any questions, please{" "}
                <a href="mailto:hello@elescookies.com" className="underline">contact us</a>.
              </p>
            </div>
          ) : (
            <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
              <Stepper status={order.status} />
            </div>
          )}

          {/* Order details */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-sand px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-caramel">
                Your order
              </p>
            </div>

            <div className="divide-y divide-sand px-6">
              {items.map((item, i) => (
                <div key={i} className="py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cocoa">{item.name}</span>
                    <span className="font-semibold text-cocoa">× {item.qty}</span>
                  </div>
                  {item.subItems && (
                    <ul className="mt-1.5 space-y-0.5 border-l-2 border-sand pl-3">
                      {item.subItems.map((sub) => (
                        <li key={sub.name} className="flex items-center justify-between text-xs text-cocoa/50">
                          <span>{sub.name}</span>
                          <span>× {sub.qty}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-sand px-6 py-4 text-sm">
              <div className="flex justify-between text-cocoa/60">
                <span>Subtotal</span>
                <span>{centsToEur(order.subtotalCents)}</span>
              </div>
              <div className="mt-1 flex justify-between text-cocoa/60">
                <span>Delivery</span>
                <span>{order.shippingCents === 0 ? "Free" : centsToEur(order.shippingCents)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-sand pt-3 font-semibold">
                <span className="text-cocoa">Total</span>
                <span className="text-caramel">{centsToEur(order.totalCents)}</span>
              </div>
            </div>

            {/* Delivery address */}
            {order.shippingAddress?.line1 && (
              <div className="border-t border-sand px-6 py-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cocoa/40">
                  Delivering to
                </p>
                <p className="text-sm leading-relaxed text-cocoa/70">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
                  <br />
                  {order.shippingAddress.city}
                  {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
                  <br />
                  Cyprus
                </p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex-1 rounded-full border border-sand py-3 text-center text-sm font-semibold text-cocoa transition-colors hover:border-cocoa/20 hover:bg-cocoa/5"
            >
              Back to home
            </Link>
            <a
              href="mailto:hello@elescookies.com"
              className="flex-1 rounded-full bg-caramel py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-caramel/90"
            >
              Contact us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
