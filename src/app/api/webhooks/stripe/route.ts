import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { renderOrderConfirmation } from "@/emails/OrderConfirmation";
import { renderOwnerNotification } from "@/emails/OwnerNotification";
import { cookies as cookieData } from "@/data/cookies";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    const customerName = meta.customerName ?? "Customer";
    const customerEmail = meta.customerEmail ?? session.customer_email ?? "";
    const notes = meta.notes || undefined;
    const batchSize = parseInt(meta.batchSize ?? "0", 10);
    const subtotalCents = parseInt(meta.subtotalCents ?? "0", 10);
    const shippingCents = parseInt(meta.shippingCents ?? "0", 10);
    const totalCents = subtotalCents + shippingCents;

    const rawItems: { id: string; qty: number }[] = JSON.parse(
      meta.items ?? "[]"
    );

    const items = rawItems.map((item) => {
      const cookie = cookieData.find((c) => c.id === item.id);
      return { ...item, name: cookie?.name };
    });

    // Build shipping address if Stripe has collected it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionAny = session as any;
    const addr = sessionAny?.shipping_details?.address;
    const shippingAddress: string | undefined = addr
      ? [addr.line1, addr.line2, addr.city, addr.postal_code, addr.country]
          .filter(Boolean)
          .join(", ")
      : undefined;

    const confirmationHtml = renderOrderConfirmation({
      customerName,
      batchSize,
      items,
      subtotalCents,
      shippingCents,
      totalCents,
    });

    const notificationHtml = renderOwnerNotification({
      customerName,
      customerEmail,
      batchSize,
      items,
      notes,
      totalCents,
      shippingAddress,
    });

    await Promise.all([
      resend.emails.send({
        from: "Ele's Cookies <orders@elescookies.com>",
        to: customerEmail,
        subject: "Your Ele's Cookies order is confirmed",
        html: confirmationHtml,
      }),
      resend.emails.send({
        from: "Ele's Cookies <orders@elescookies.com>",
        to: process.env.OWNER_EMAIL!,
        subject: `New order — Box of ${batchSize} cookies`,
        html: notificationHtml,
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
