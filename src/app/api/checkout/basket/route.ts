import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Product } from "@/payload-types";
import { calcSubtotal, type BatchSize, BATCH_SIZES, cookies as cookieData } from "@/data/cookies";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const FREE_SHIPPING_THRESHOLD = 5000; // €50.00
const SHIPPING_CENTS = 250;

type BasketItem = {
  slug: string;
  qty: number;
  boxSize?: number;
  customCookies?: { id: string; qty: number }[];
};

export async function POST(req: NextRequest) {
  let body: {
    items: BasketItem[];
    customerName: string;
    customerEmail: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    notes?: string;
    isGift?: boolean;
    giftMessage?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items, customerName, customerEmail, addressLine1, addressLine2, city, postalCode, notes, isGift, giftMessage } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "Basket is empty" }, { status: 400 });
  }

  // Look up each product and compute pricing
  const payload = await getPayload({ config });
  type ResolvedItem = {
    slug: string;
    name: string;
    qty: number;
    subtotalCents: number;
    boxSize: number;
    customCookies?: { id: string; qty: number }[];
  };
  const resolved: ResolvedItem[] = [];

  for (const item of items) {
    if (item.customCookies?.length) {
      // Custom-built box — identified by customCookies presence; validate box size and compute price server-side
      if (!item.boxSize || !(BATCH_SIZES as readonly number[]).includes(item.boxSize)) {
        return NextResponse.json({ error: "Custom box has no valid size" }, { status: 400 });
      }
      const subtotalCents = calcSubtotal(item.boxSize as BatchSize);
      resolved.push({
        slug: item.slug,
        name: `Custom Box (${item.boxSize} cookies)`,
        qty: item.qty,
        subtotalCents,
        boxSize: item.boxSize,
        customCookies: item.customCookies,
      });
    } else {
      const result = await payload.find({
        collection: "products",
        where: { slug: { equals: item.slug }, isPublished: { equals: true } },
        limit: 1,
      });
      const product = result.docs[0] as Product | undefined;
      if (!product) return NextResponse.json({ error: `Product not found: ${item.slug}` }, { status: 400 });
      if (!product.isAvailable) return NextResponse.json({ error: `${product.name} is not currently available` }, { status: 400 });
      if (!product.boxSize || !(BATCH_SIZES as readonly number[]).includes(product.boxSize)) {
        return NextResponse.json({ error: `${product.name} has no valid box size` }, { status: 400 });
      }
      const subtotalCents = calcSubtotal(product.boxSize as BatchSize);
      resolved.push({ slug: product.slug, name: product.name, qty: item.qty, subtotalCents, boxSize: product.boxSize });
    }
  }

  const basketSubtotalCents = resolved.reduce((s, i) => s + i.subtotalCents * i.qty, 0);
  const shippingCents = basketSubtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CENTS;
  const totalCents = basketSubtotalCents + shippingCents;

  // Build Stripe line items — one per basket item
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = resolved.map(({ name, qty, subtotalCents, boxSize, customCookies }) => {
    const isCustom = !!customCookies?.length;
    const lineItemName = isCustom ? name : `${name} (${boxSize} cookies)`;
    const description = isCustom
      ? customCookies.map((cc) => {
          const cookieName = cookieData.find((c) => c.id === cc.id)?.name ?? cc.id;
          return `${cookieName} ×${cc.qty}`;
        }).join(", ")
      : undefined;
    return {
      price_data: {
        currency: "eur",
        unit_amount: subtotalCents,
        product_data: { name: lineItemName, ...(description ? { description } : {}) },
      },
      quantity: qty,
    };
  });

  if (shippingCents > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        unit_amount: shippingCents,
        product_data: { name: "Delivery" },
      },
      quantity: 1,
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const basketSessionId = req.headers.get("x-basket-session") ?? "";

  // Metadata for the webhook — keep compact; webhook fetches customCookies from the Basket document
  const basketItemsMeta = resolved.map(({ slug, name, qty, subtotalCents, boxSize }) => ({
    slug, name, qty, subtotalCents, boxSize,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: customerEmail,
    payment_intent_data: {
      shipping: {
        name: customerName,
        address: {
          line1: addressLine1,
          ...(addressLine2 ? { line2: addressLine2 } : {}),
          city,
          postal_code: postalCode,
          country: "CY",
        },
      },
    },
    metadata: {
      orderType: "basket",
      customerName,
      customerEmail,
      addressLine1,
      addressLine2: addressLine2 ?? "",
      city,
      postalCode,
      notes: notes ?? "",
      basketSessionId,
      items: JSON.stringify(basketItemsMeta),
      subtotalCents: String(basketSubtotalCents),
      shippingCents: String(shippingCents),
      totalCents: String(totalCents),
      isGift: isGift ? "true" : "false",
      giftMessage: giftMessage ?? "",
    },
    success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/products?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
