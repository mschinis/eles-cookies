import path from "path";
import { getPayload } from "payload";
import config from "../../payload.config";
import { cookies as cookieData } from "../data/cookies";
import { products } from "../data/products";

async function seed() {
  const payload = await getPayload({ config });

  // ── 1. Collect all unique image paths (cookies + products) ─────────────────
  console.log("Collecting unique image paths...");
  const imagePaths = new Set<string>();
  for (const c of cookieData) {
    imagePaths.add(c.image);
  }
  for (const p of products) {
    imagePaths.add(p.coverImage);
    for (const img of p.images) {
      imagePaths.add(img);
    }
  }

  // ── 2. Upload images to Vercel Blob ────────────────────────────────────────
  console.log(`Uploading ${imagePaths.size} images to Vercel Blob...`);
  const mediaMap = new Map<string, string>(); // imagePath → media doc ID

  for (const imgPath of imagePaths) {
    const absPath = path.join(process.cwd(), "public", imgPath);
    const filename = path.basename(imgPath);
    try {
      const media = await payload.create({
        collection: "media",
        data: { alt: filename },
        filePath: absPath,
      });
      mediaMap.set(imgPath, String(media.id));
      console.log(`  ✓ ${imgPath} → ${media.id}`);
    } catch (err) {
      console.error(`  ✗ Failed to upload ${imgPath}:`, err);
    }
  }

  // ── 3. Create cookie documents ─────────────────────────────────────────────
  console.log(`\nCreating ${cookieData.length} cookie documents...`);
  const cookieIdMap = new Map<string, string>(); // cookie slug → Payload doc ID

  for (const cookie of cookieData) {
    const imageId = mediaMap.get(cookie.image);
    if (!imageId) {
      console.error(`  ✗ No media ID for image: ${cookie.image}`);
      continue;
    }
    try {
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
    } catch (err) {
      console.error(`  ✗ Failed to create ${cookie.name}:`, err);
    }
  }

  // ── 4. Create product documents ────────────────────────────────────────────
  console.log(`\nCreating ${products.length} product documents...`);
  for (const product of products) {
    const coverImageId = mediaMap.get(product.coverImage);
    if (!coverImageId) {
      console.error(`  ✗ No media ID for coverImage: ${product.coverImage}`);
      continue;
    }

    const contents = (product.checkoutItems ?? []).map((item) => {
      const cookieDocId = cookieIdMap.get(item.id);
      if (!cookieDocId) throw new Error(`No cookie doc for ID: ${item.id}`);
      return { cookie: cookieDocId, qty: item.qty };
    });

    try {
      await payload.create({
        collection: "products",
        data: {
          slug: product.slug,
          type: product.type,
          name: product.name,
          tagline: product.tagline,
          description: product.description,
          details: product.details.map((text) => ({ text })),
          coverImage: coverImageId,
          images: product.images.map((imgPath) => ({
            image: mediaMap.get(imgPath)!,
          })),
          priceLabel: product.priceLabel,
          badge: product.badge,
          isPublished: product.isPublished,
          isAvailable: product.isAvailable,
          boxSize: product.boxSize,
          contents,
        },
      });
      console.log(`  ✓ ${product.name}`);
    } catch (err) {
      console.error(`  ✗ Failed to create ${product.name}:`, err);
    }
  }

  console.log("\nSeed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
