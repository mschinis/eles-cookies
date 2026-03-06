import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getPayload } from "payload";
import config from "@payload-config";
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
    const isGift = meta.isGift === "true";
    const giftMessage = meta.giftMessage || undefined;
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

    const shippingAddress = [
      meta.addressLine1,
      meta.addressLine2,
      meta.city,
      meta.postalCode,
      "Cyprus",
    ]
      .filter(Boolean)
      .join(", ");

    // ── Save order to Payload ─────────────────────────────────────────────────
    try {
      const payload = await getPayload({ config });

      // Resolve cookie slugs → Payload cookie doc IDs
      const orderItems: { cookie: string; qty: number }[] = [];
      for (const item of rawItems) {
        const result = await payload.find({
          collection: "cookies",
          where: { slug: { equals: item.id } },
          limit: 1,
        });
        if (result.docs[0]) {
          orderItems.push({ cookie: String(result.docs[0].id), qty: item.qty });
        }
      }

      await payload.create({
        collection: "orders",
        data: {
          stripeSessionId: session.id,
          status: "confirmed",
          customerName,
          customerEmail,
          batchSize,
          items: orderItems,
          subtotalCents,
          shippingCents,
          totalCents,
          shippingAddress: {
            line1: meta.addressLine1 ?? "",
            line2: meta.addressLine2 ?? "",
            city: meta.city ?? "",
            postalCode: meta.postalCode ?? "",
          },
          notes: notes ?? "",
          isGift,
          giftMessage: giftMessage ?? "",
        },
      });
    } catch (err) {
      // Log but don't fail the webhook — emails still send
      console.error("Failed to save order to Payload:", err);
    }

    // ── Send confirmation emails ──────────────────────────────────────────────
    const confirmationHtml = renderOrderConfirmation({
      customerName,
      batchSize,
      items,
      subtotalCents,
      shippingCents,
      totalCents,
      isGift,
      giftMessage,
    });

    const notificationHtml = renderOwnerNotification({
      customerName,
      customerEmail,
      batchSize,
      items,
      notes,
      totalCents,
      shippingAddress,
      isGift,
      giftMessage,
    });

    await Promise.all([
      resend.emails.send({
        from: "Ele's Cookies <elescookies@emails.codelia.studio>",
        to: customerEmail,
        subject: "Your Ele's Cookies order is confirmed",
        html: confirmationHtml,
      }),
      resend.emails.send({
        from: "Ele's Cookies <elescookies@emails.codelia.studio>",
        to: process.env.OWNER_EMAIL!,
        subject: `New order — Box of ${batchSize} cookies`,
        html: notificationHtml,
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
