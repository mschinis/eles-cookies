import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "customerName",
    defaultColumns: ["customerName", "customerEmail", "batchSize", "totalCents", "status", "createdAt"],
  },
  fields: [
    {
      name: "stripeSessionId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Stripe Checkout Session ID — used to prevent duplicate records",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "confirmed",
      options: [
        { label: "Confirmed", value: "confirmed" },
        { label: "Fulfilled", value: "fulfilled" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      name: "customerName",
      type: "text",
      required: true,
    },
    {
      name: "customerEmail",
      type: "email",
      required: true,
    },
    {
      name: "batchSize",
      type: "number",
      required: true,
    },
    {
      name: "items",
      type: "array",
      required: true,
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
      name: "subtotalCents",
      type: "number",
      required: true,
    },
    {
      name: "shippingCents",
      type: "number",
      required: true,
    },
    {
      name: "totalCents",
      type: "number",
      required: true,
    },
    {
      name: "shippingAddress",
      type: "group",
      fields: [
        { name: "line1", type: "text" },
        { name: "line2", type: "text" },
        { name: "city", type: "text" },
        { name: "postalCode", type: "text" },
      ],
    },
    {
      name: "notes",
      type: "textarea",
    },
  ],
};
