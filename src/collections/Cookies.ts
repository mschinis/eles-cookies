import type { CollectionConfig } from "payload";

export const Cookies: CollectionConfig = {
  slug: "cookies",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "available"],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-friendly identifier used as the checkout item ID, e.g. classic-chocolate-chip",
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "available",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
