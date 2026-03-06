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
      name: "orderType",
      type: "select",
      required: true,
      defaultValue: "custom",
      options: [
        { label: "Custom Box", value: "custom" },
        { label: "Basket", value: "basket" },
      ],
      admin: { position: "sidebar" },
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
      admin: {
        position: "sidebar",
        components: {
          Cell: "/src/components/admin/StatusCell#StatusCell",
        },
      },
    },
    {
      name: "customerName",
      type: "text",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "customerEmail",
      type: "email",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "stripeSessionId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        description: "Stripe Checkout Session ID — used to prevent duplicate records",
      },
    },
    {
      name: "batchSize",
      type: "number",
      required: true,
    },
    {
      name: "items",
      type: "array",
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
      name: "basketItems",
      type: "array",
      admin: {
        description: "Product-level line items for basket orders",
        condition: (data) => data.orderType === "basket",
      },
      fields: [
        { name: "productName", type: "text", required: true },
        { name: "qty", type: "number", required: true },
        { name: "subtotalCents", type: "number", required: true },
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
      admin: {
        position: "sidebar",
      },
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
    {
      name: "isGift",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Order will be packaged as a gift",
      },
    },
    {
      name: "giftMessage",
      type: "textarea",
      admin: {
        position: "sidebar",
        condition: (data) => !!data.isGift,
        description: "Message to include with the gift",
      },
    },
  ],
};
