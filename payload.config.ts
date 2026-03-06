import sharp from "sharp";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import { Cookies } from "./src/collections/Cookies";
import { Media } from "./src/collections/Media";
import { Orders } from "./src/collections/Orders";
import { Products } from "./src/collections/Products";

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({ url: process.env.MONGODB_URI || "" }),
  collections: [Cookies, Media, Orders, Products],
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
  ],
  sharp,
  typescript: { outputFile: "./src/payload-types.ts" },
});
