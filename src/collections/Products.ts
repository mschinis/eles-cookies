import type { CollectionConfig } from "payload";

async function triggerVercelDeploy() {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) return;
  try {
    await fetch(url, { method: "POST" });
  } catch (err) {
    console.error("[Products] Failed to trigger Vercel deploy:", err);
  }
}

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "isPublished", "isAvailable"],
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        if (doc.isPublished) {
          await triggerVercelDeploy();
        }
      },
    ],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-friendly identifier, e.g. valentines-collection",
      },
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Curated", value: "seasonal" },
        { label: "Seasonal (Limited Time)", value: "limited" },
        { label: "Custom Box", value: "custom" },
      ],
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "tagline",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "details",
      type: "array",
      fields: [
        {
          name: "text",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "images",
      type: "array",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
    {
      name: "priceLabel",
      type: "text",
      required: true,
    },
    {
      name: "badge",
      type: "text",
    },
    {
      name: "isPublished",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "isAvailable",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "boxSize",
      type: "number",
      admin: {
        condition: (data) => data.type === "seasonal",
        description: "Total number of cookies in this box",
      },
    },
    {
      name: "contents",
      type: "array",
      admin: {
        condition: (data) => data.type === "seasonal",
        description: "What's inside — shown on the product detail page and used for checkout",
      },
      fields: [
        {
          name: "cookie",
          type: "relationship",
          relationTo: "cookies",
          required: true,
        },
        {
          name: "qty",
          type: "number",
          required: true,
        },
      ],
    },
    {
      name: "ingredients",
      type: "textarea",
      admin: {
        description: "Full ingredients list shown in the product accordion",
      },
    },
    {
      name: "allergens",
      type: "textarea",
      admin: {
        description: 'Allergens this product contains, e.g. "Gluten (wheat flour), Dairy (butter), Eggs, Soy (lecithin)"',
      },
    },
    {
      name: "mayContain",
      type: "textarea",
      admin: {
        description: 'May contain traces of, e.g. "Tree nuts, Peanuts, Sesame"',
      },
    },
    {
      name: "nutritionPerCookie",
      type: "group",
      admin: {
        description: "Nutritional values per single cookie",
      },
      fields: [
        { name: "calories", type: "number", admin: { description: "kcal" } },
        { name: "fat", type: "number", admin: { description: "g" } },
        { name: "saturatedFat", type: "number", admin: { description: "g" } },
        { name: "carbohydrates", type: "number", admin: { description: "g" } },
        { name: "sugars", type: "number", admin: { description: "g" } },
        { name: "protein", type: "number", admin: { description: "g" } },
        { name: "salt", type: "number", admin: { description: "g" } },
      ],
    },
  ],
};
