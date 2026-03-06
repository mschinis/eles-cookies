import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Basket } from "@/payload-types";

function getSessionId(req: NextRequest): string | null {
  return req.headers.get("x-basket-session");
}

export async function GET(req: NextRequest) {
  const sessionId = getSessionId(req);
  if (!sessionId) return NextResponse.json({ items: [] });

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "baskets",
    where: { sessionId: { equals: sessionId } },
    limit: 1,
  });

  const basket = result.docs[0] as Basket | undefined;
  return NextResponse.json({ items: basket?.items ?? [] });
}

export async function PUT(req: NextRequest) {
  const sessionId = getSessionId(req);
  if (!sessionId) return NextResponse.json({ error: "Missing session ID" }, { status: 400 });

  let items: Basket["items"];
  try {
    const body = await req.json();
    items = body.items ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "baskets",
    where: { sessionId: { equals: sessionId } },
    limit: 1,
  });

  const existing = result.docs[0] as Basket | undefined;

  if (existing) {
    await payload.update({
      collection: "baskets",
      id: existing.id,
      data: { items },
    });
  } else {
    await payload.create({
      collection: "baskets",
      data: { sessionId, items },
    });
  }

  return NextResponse.json({ ok: true });
}
