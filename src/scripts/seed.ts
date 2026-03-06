import path from "path";
import { getPayload } from "payload";
import config from "../../payload.config";
import { products } from "../data/products";

async function seed() {
  const payload = await getPayload({ config });

  console.log("Collecting unique image paths...");
  const imagePaths = new Set<string>();
  for (const p of products) {
    imagePaths.add(p.coverImage);
    for (const img of p.images) {
      imagePaths.add(img);
    }
  }

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

  console.log(`\nCreating ${products.length} product documents...`);
  for (const product of products) {
    try {
      const coverImageId = mediaMap.get(product.coverImage);
      if (!coverImageId) throw new Error(`No media ID for coverImage: ${product.coverImage}`);

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
          contents: product.contents,
          checkoutItems: product.checkoutItems,
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
