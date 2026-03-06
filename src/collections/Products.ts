import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "isPublished", "isAvailable"],
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
        { label: "Seasonal / Curated", value: "seasonal" },
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
        description: "What's inside — shown on the product detail page",
      },
      fields: [
        {
          name: "name",
          type: "text",
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
      name: "checkoutItems",
      type: "array",
      admin: {
        condition: (data) => data.type === "seasonal",
        description: "Cookie IDs + quantities sent to /api/checkout",
      },
      fields: [
        {
          name: "id",
          type: "text",
          required: true,
        },
        {
          name: "qty",
          type: "number",
          required: true,
        },
      ],
    },
  ],
};
