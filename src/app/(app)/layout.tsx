import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://elescookies.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Ele's Cookies — Handmade with love, baked to order",
    template: "%s | Ele's Cookies",
  },
  description:
    "Small-batch, made-to-order artisan cookies crafted with quality ingredients and a whole lot of heart. Delivered fresh across Cyprus.",
  openGraph: {
    siteName: "Ele's Cookies",
    type: "website",
    locale: "en_CY",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} antialiased`}
      >
        <CartProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
