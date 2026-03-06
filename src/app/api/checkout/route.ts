import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  cookies as cookieData,
  BATCH_SIZES,
  BATCH_DISCOUNTS,
  calcSubtotal,
  calcShipping,
  type BatchSize,
} from "@/data/cookies";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type OrderItem = { id: string; qty: number };

export async function POST(req: NextRequest) {
  let body: {
    batchSize: number;
    items: OrderItem[];
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

  const { batchSize, items, customerName, customerEmail, addressLine1, addressLine2, city, postalCode, notes, isGift, giftMessage } = body;

  // Validate batchSize
  if (!(BATCH_SIZES as readonly number[]).includes(batchSize)) {
    return NextResponse.json({ error: "Invalid batch size" }, { status: 400 });
  }
  const validBatchSize = batchSize as BatchSize;

  // Validate total quantity
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  if (totalQty !== batchSize) {
    return NextResponse.json(
      { error: `Total quantity must equal ${batchSize}` },
      { status: 400 }
    );
  }

  // Validate each item
  for (const item of items) {
    if (item.qty % 4 !== 0) {
      return NextResponse.json(
        { error: `Quantity for ${item.id} must be a multiple of 4` },
        { status: 400 }
      );
    }
    const cookie = cookieData.find((c) => c.id === item.id);
    if (!cookie) {
      return NextResponse.json(
        { error: `Unknown cookie: ${item.id}` },
        { status: 400 }
      );
    }
    if (!cookie.available) {
      return NextResponse.json(
        { error: `${cookie.name} is not currently available` },
        { status: 400 }
      );
    }
  }

  const subtotalCents = calcSubtotal(validBatchSize);
  const shippingCents = calcShipping(validBatchSize);
  const discountRate = BATCH_DISCOUNTS[validBatchSize];

  const boxName = discountRate > 0
    ? `Ele's Cookies — Box of ${batchSize} (${Math.round(discountRate * 100)}% off)`
    : `Ele's Cookies — Box of ${batchSize}`;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        unit_amount: subtotalCents,
        currency: "eur",
        product_data: { name: boxName },
      },
      quantity: 1,
    },
  ];

  if (shippingCents > 0) {
    lineItems.push({
      price_data: {
        unit_amount: shippingCents,
        currency: "eur",
        product_data: { name: "Delivery" },
      },
      quantity: 1,
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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
      customerName,
      customerEmail,
      addressLine1,
      addressLine2: addressLine2 ?? "",
      city,
      postalCode,
      notes: notes ?? "",
      items: JSON.stringify(items),
      batchSize: String(batchSize),
      subtotalCents: String(subtotalCents),
      shippingCents: String(shippingCents),
      isGift: isGift ? "true" : "false",
      giftMessage: giftMessage ?? "",
    },
    success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/order?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
