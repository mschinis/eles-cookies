import type { Metadata } from "next";
import FaqPageClient from "./FaqPage";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about ordering, delivery, pricing, and the cookies themselves. Ele's Cookies delivers handmade cookies across Cyprus.",
  openGraph: {
    title: "FAQ | Ele's Cookies",
    description:
      "Answers to common questions about ordering, delivery, pricing, and the cookies themselves. Ele's Cookies delivers handmade cookies across Cyprus.",
    url: "/faq",
  },
};

export default function FaqPage() {
  return <FaqPageClient />;
}
