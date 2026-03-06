import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Product } from "@/payload-types";
import { calcSubtotal, type BatchSize, BATCH_SIZES } from "@/data/cookies";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const FREE_SHIPPING_THRESHOLD = 5000; // €50.00
const SHIPPING_CENTS = 250;

type BasketItem = { slug: string; qty: number };

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
  type ResolvedItem = { product: Product; qty: number; subtotalCents: number };
  const resolved: ResolvedItem[] = [];

  for (const item of items) {
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
    resolved.push({ product, qty: item.qty, subtotalCents });
  }

  const basketSubtotalCents = resolved.reduce((s, i) => s + i.subtotalCents * i.qty, 0);
  const shippingCents = basketSubtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CENTS;
  const totalCents = basketSubtotalCents + shippingCents;

  // Build Stripe line items — one per product type
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = resolved.map(({ product, qty, subtotalCents }) => ({
    price_data: {
      currency: "eur",
      unit_amount: subtotalCents,
      product_data: { name: `${product.name} (${product.boxSize} cookies)` },
    },
    quantity: qty,
  }));

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

  // Metadata for the webhook — store basket items as JSON
  const basketItemsMeta = resolved.map(({ product, qty, subtotalCents }) => ({
    slug: product.slug,
    name: product.name,
    qty,
    subtotalCents,
    boxSize: product.boxSize,
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
