import type { CollectionConfig } from "payload";

export const Baskets: CollectionConfig = {
  slug: "baskets",
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: "sessionId",
    defaultColumns: ["sessionId", "updatedAt"],
  },
  fields: [
    {
      name: "sessionId",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "slug",           type: "text",   required: true },
        { name: "name",           type: "text",   required: true },
        { name: "subtotalCents",  type: "number", required: true },
        { name: "boxSize",        type: "number", required: true },
        { name: "qty",            type: "number", required: true },
      ],
    },
  ],
};
