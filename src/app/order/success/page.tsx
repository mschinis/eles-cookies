import Stripe from "stripe";
import Link from "next/link";
import { cookies as cookieData } from "@/data/cookies";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function centsToEur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return <ErrorState message="No session ID provided." />;
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    return <ErrorState message="Could not retrieve your order. Please contact us." />;
  }

  if (session.payment_status !== "paid") {
    return <ErrorState message="Payment not confirmed yet. Please contact us if you were charged." />;
  }

  const meta = session.metadata ?? {};
  const customerName = meta.customerName ?? "there";
  const batchSize = parseInt(meta.batchSize ?? "0", 10);
  const subtotalCents = parseInt(meta.subtotalCents ?? "0", 10);
  const shippingCents = parseInt(meta.shippingCents ?? "0", 10);
  const totalCents = subtotalCents + shippingCents;
  const rawItems: { id: string; qty: number }[] = JSON.parse(meta.items ?? "[]");
  const items = rawItems.map((item) => {
    const cookie = cookieData.find((c) => c.id === item.id);
    return { ...item, name: cookie?.name ?? item.id };
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-24">
      <div className="w-full max-w-lg">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-caramel/15">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C1813A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h1 className="mb-3 text-center font-display text-4xl font-bold text-cocoa">
          Order confirmed!
        </h1>
        <p className="mb-10 text-center text-cocoa/60">
          Thanks, {customerName}! Your box of {batchSize} cookies is on its way.
          We&apos;ll send a confirmation to {session.customer_email}.
        </p>

        {/* Order summary card */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-sand px-6 py-4">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-caramel">
              Order Summary
            </p>
          </div>
          <div className="px-6 py-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-cocoa">{item.name}</span>
                <span className="font-semibold text-cocoa">× {item.qty}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-sand px-6 py-4">
            <div className="flex justify-between text-sm text-cocoa/60">
              <span>Subtotal</span>
              <span>{centsToEur(subtotalCents)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-cocoa/60">
              <span>Delivery</span>
              <span>{shippingCents === 0 ? "Free" : centsToEur(shippingCents)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-sand pt-3 font-semibold">
              <span className="text-cocoa">Total</span>
              <span className="text-caramel">{centsToEur(totalCents)}</span>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="block w-full rounded-full bg-caramel py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-caramel/90"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <div className="max-w-md text-center">
        <p className="mb-6 font-display text-2xl font-bold text-cocoa">{message}</p>
        <Link
          href="/"
          className="rounded-full bg-caramel px-6 py-3 text-sm font-semibold text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
