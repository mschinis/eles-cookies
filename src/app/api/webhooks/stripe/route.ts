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

    const orderType = meta.orderType === "basket" ? "basket" : "custom";
    const customerName = meta.customerName ?? "Customer";
    const customerEmail = meta.customerEmail ?? session.customer_email ?? "";
    const notes = meta.notes || undefined;
    const isGift = meta.isGift === "true";
    const giftMessage = meta.giftMessage || undefined;
    const subtotalCents = parseInt(meta.subtotalCents ?? "0", 10);
    const shippingCents = parseInt(meta.shippingCents ?? "0", 10);
    const totalCents = subtotalCents + shippingCents;

    const shippingAddress = [meta.addressLine1, meta.addressLine2, meta.city, meta.postalCode, "Cyprus"]
      .filter(Boolean)
      .join(", ");

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const trackingUrl = `${baseUrl}/order/track/${session.id}`;

    // ── Save order to Payload ─────────────────────────────────────────────────
    try {
      const payload = await getPayload({ config });

      if (orderType === "basket") {
        // Basket order — items are product-level
        type BasketMeta = { slug: string; name: string; qty: number; subtotalCents: number; boxSize: number };
        const basketMeta: BasketMeta[] = JSON.parse(meta.items ?? "[]");
        const batchSize = basketMeta.reduce((s, i) => s + (i.boxSize ?? 0) * i.qty, 0);

        // Expand custom box cookies into individual basketItems entries
        const customBoxCookies: { id: string; qty: number }[] = JSON.parse(meta.customBoxCookies || "[]");
        const basketItems: { productName: string; qty: number; subtotalCents: number }[] = [];
        for (const i of basketMeta) {
          if (i.slug === "custom" && customBoxCookies.length > 0) {
            for (const cc of customBoxCookies) {
              const cookieName = cookieData.find((c) => c.id === cc.id)?.name ?? cc.id;
              basketItems.push({ productName: cookieName, qty: cc.qty * i.qty, subtotalCents: 0 });
            }
          } else {
            basketItems.push({ productName: i.name, qty: i.qty, subtotalCents: i.subtotalCents });
          }
        }

        await payload.create({
          collection: "orders",
          data: {
            orderType: "basket",
            stripeSessionId: session.id,
            status: "confirmed",
            customerName,
            customerEmail,
            batchSize,
            items: [],
            basketItems,
            subtotalCents,
            shippingCents,
            totalCents,
            shippingAddress: { line1: meta.addressLine1 ?? "", line2: meta.addressLine2 ?? "", city: meta.city ?? "", postalCode: meta.postalCode ?? "" },
            notes: notes ?? "",
            isGift,
            giftMessage: giftMessage ?? "",
          },
        });
      } else {
        // Custom box order — items are cookie-level
        const batchSize = parseInt(meta.batchSize ?? "0", 10);
        const rawItems: { id: string; qty: number }[] = JSON.parse(meta.items ?? "[]");
        const orderItems: { cookie: string; qty: number }[] = [];
        for (const item of rawItems) {
          const result = await payload.find({ collection: "cookies", where: { slug: { equals: item.id } }, limit: 1 });
          if (result.docs[0]) orderItems.push({ cookie: String(result.docs[0].id), qty: item.qty });
        }
        await payload.create({
          collection: "orders",
          data: {
            orderType: "custom",
            stripeSessionId: session.id,
            status: "confirmed",
            customerName,
            customerEmail,
            batchSize,
            items: orderItems,
            subtotalCents,
            shippingCents,
            totalCents,
            shippingAddress: { line1: meta.addressLine1 ?? "", line2: meta.addressLine2 ?? "", city: meta.city ?? "", postalCode: meta.postalCode ?? "" },
            notes: notes ?? "",
            isGift,
            giftMessage: giftMessage ?? "",
          },
        });
      }
    } catch (err) {
      console.error("Failed to save order to Payload:", err);
    }

    // ── Build email items list ─────────────────────────────────────────────────
    let emailItems: { id: string; qty: number; name?: string }[];
    let batchSizeForEmail: number;

    if (orderType === "basket") {
      type BasketMeta = { slug: string; name: string; qty: number; boxSize: number };
      const basketMeta: BasketMeta[] = JSON.parse(meta.items ?? "[]");
      const customBoxCookiesForEmail: { id: string; qty: number }[] = JSON.parse(meta.customBoxCookies || "[]");
      emailItems = [];
      for (const i of basketMeta) {
        if (i.slug === "custom" && customBoxCookiesForEmail.length > 0) {
          for (const cc of customBoxCookiesForEmail) {
            const cookieName = cookieData.find((c) => c.id === cc.id)?.name ?? cc.id;
            emailItems.push({ id: cc.id, qty: cc.qty * i.qty, name: cookieName });
          }
        } else {
          emailItems.push({ id: i.slug, qty: i.qty, name: `${i.name} (${i.boxSize} cookies)` });
        }
      }
      batchSizeForEmail = basketMeta.reduce((s, i) => s + i.boxSize * i.qty, 0);
    } else {
      const rawItems: { id: string; qty: number }[] = JSON.parse(meta.items ?? "[]");
      emailItems = rawItems.map((item) => {
        const cookie = cookieData.find((c) => c.id === item.id);
        return { ...item, name: cookie?.name };
      });
      batchSizeForEmail = parseInt(meta.batchSize ?? "0", 10);
    }

    // ── Send confirmation emails ──────────────────────────────────────────────
    const confirmationHtml = renderOrderConfirmation({
      customerName,
      batchSize: batchSizeForEmail,
      items: emailItems,
      subtotalCents,
      shippingCents,
      totalCents,
      trackingUrl,
      isGift,
      giftMessage,
    });

    const notificationHtml = renderOwnerNotification({
      customerName,
      customerEmail,
      batchSize: batchSizeForEmail,
      items: emailItems,
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
        subject: `New order — Box of ${batchSizeForEmail} cookies`,
        html: notificationHtml,
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
