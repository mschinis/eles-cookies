import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderForm from "@/components/OrderForm";
import CanceledNotice from "./CanceledNotice";

export const metadata: Metadata = {
  title: "Build Your Box",
  description:
    "Pick your batch size, mix your favourite flavours, and order handmade cookies delivered fresh to your door across Cyprus.",
  openGraph: {
    title: "Build Your Box | Ele's Cookies",
    description:
      "Pick your batch size, mix your favourite flavours, and order handmade cookies delivered fresh to your door across Cyprus.",
    url: "/order",
  },
};

export default function OrderPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-24">
        <div className="mx-auto max-w-3xl px-6">
          {/* Header */}
          <div className="mb-12 pt-8 text-center">
            <h1 className="font-display text-4xl font-bold text-cocoa md:text-5xl">
              Build your box
            </h1>
            <p className="mt-4 text-cocoa/60">
              Pick your batch size, mix your flavours, and add to your basket.
            </p>
          </div>

          <Suspense fallback={null}>
            <CanceledNotice />
          </Suspense>

          <OrderForm variant="page" />
        </div>
      </main>
      <Footer />
    </>
  );
}
