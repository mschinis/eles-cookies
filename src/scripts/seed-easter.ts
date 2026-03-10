import { getPayload } from "payload";
import config from "../../payload.config";

async function seedEaster() {
  const payload = await getPayload({ config });

  // Reuse any existing media doc as cover image
  const mediaResult = await payload.find({ collection: "media", limit: 1 });
  const coverId = String(mediaResult.docs[0]?.id);
  if (!coverId) {
    console.error("No media docs found — upload at least one image first.");
    process.exit(1);
  }

  await payload.create({
    collection: "products",
    data: {
      slug: "easter-box-2025",
      type: "limited",
      name: "Easter Box 2025",
      tagline: "Spring flavours, fresh from the oven.",
      description:
        "Bright, zesty, and utterly delicious — a cheerful Easter treat for the whole family.",
      details: [
        { text: "12 freshly baked cookies" },
        { text: "Light spring-inspired flavours" },
        { text: "Gift-packaged in a seasonal box" },
        { text: "Available for a limited time" },
      ],
      coverImage: coverId,
      images: [{ image: coverId }],
      priceLabel: "€26.50",
      badge: "Easter",
      isPublished: true,
      isAvailable: true,
      boxSize: 12,
    },
  });

  console.log("Easter Box 2025 created.");
  process.exit(0);
}

seedEaster().catch((err) => {
  console.error(err);
  process.exit(1);
});
