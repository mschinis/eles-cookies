import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://elescookies.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/order/success", "/order/track/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
