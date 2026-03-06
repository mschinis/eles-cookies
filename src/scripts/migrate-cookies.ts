import path from "path";
import { getPayload } from "payload";
import config from "../../payload.config";
import { cookies as cookieData } from "../data/cookies";
import { products } from "../data/products";

async function migrate() {
  const payload = await getPayload({ config });

  // ── 1. Build filename → media ID map from existing uploads ─────────────────
  console.log("Loading existing media...");
  const mediaResult = await payload.find({
    collection: "media",
    limit: 200,
  });
  const mediaMap = new Map<string, string>(); // filename (basename) → media doc ID
  for (const doc of mediaResult.docs) {
    if (doc.filename) mediaMap.set(doc.filename, String(doc.id));
  }
  console.log(`  Found ${mediaMap.size} media docs`);

  // Helper: resolve imagePath (e.g. /images/foo.jpg) → media ID
  function resolveMedia(imgPath: string): string {
    const filename = path.basename(imgPath);
    const id = mediaMap.get(filename);
    if (!id) throw new Error(`No media doc found for: ${imgPath} (filename: ${filename})`);
    return id;
  }

  // ── 2. Drop existing cookies and products ──────────────────────────────────
  console.log("\nDeleting existing product docs...");
  const existingProducts = await payload.find({ collection: "products", limit: 200 });
  for (const doc of existingProducts.docs) {
    await payload.delete({ collection: "products", id: doc.id });
  }
  console.log(`  Deleted ${existingProducts.docs.length} products`);

  console.log("Deleting existing cookie docs...");
  const existingCookies = await payload.find({ collection: "cookies", limit: 200 });
  for (const doc of existingCookies.docs) {
    await payload.delete({ collection: "cookies", id: doc.id });
  }
  console.log(`  Deleted ${existingCookies.docs.length} cookies`);

  // ── 3. Create cookie documents ─────────────────────────────────────────────
  console.log(`\nCreating ${cookieData.length} cookie documents...`);
  const cookieIdMap = new Map<string, string>(); // cookie slug → Payload doc ID

  for (const cookie of cookieData) {
    const imageId = resolveMedia(cookie.image);
    const doc = await payload.create({
      collection: "cookies",
      data: {
        slug: cookie.id,
        name: cookie.name,
        description: cookie.description,
        image: imageId,
        available: cookie.available,
      },
    });
    cookieIdMap.set(cookie.id, String(doc.id));
    console.log(`  ✓ ${cookie.name}`);
  }

  // ── 4. Re-create product documents with cookie relationships ───────────────
  console.log(`\nCreating ${products.length} product documents...`);
  for (const product of products) {
    const contents = (product.checkoutItems ?? []).map((item) => {
      const cookieDocId = cookieIdMap.get(item.id);
      if (!cookieDocId) throw new Error(`No cookie doc for ID: ${item.id}`);
      return { cookie: cookieDocId, qty: item.qty };
    });

    await payload.create({
      collection: "products",
      data: {
        slug: product.slug,
        type: product.type,
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        details: product.details.map((text) => ({ text })),
        coverImage: resolveMedia(product.coverImage),
        images: product.images.map((imgPath) => ({ image: resolveMedia(imgPath) })),
        priceLabel: product.priceLabel,
        badge: product.badge,
        isPublished: product.isPublished,
        isAvailable: product.isAvailable,
        boxSize: product.boxSize,
        contents,
      },
    });
    console.log(`  ✓ ${product.name}`);
  }

  console.log("\nMigration complete.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
