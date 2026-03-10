import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Menu from "@/components/Menu";
import Gallery from "@/components/Gallery";
import HowToOrder from "@/components/HowToOrder";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ele's Cookies — Handmade with love, baked to order",
  description:
    "Small-batch, made-to-order artisan cookies crafted with quality ingredients and a whole lot of heart. Delivered fresh across Cyprus.",
  openGraph: {
    title: "Ele's Cookies — Handmade with love, baked to order",
    description:
      "Small-batch, made-to-order artisan cookies crafted with quality ingredients and a whole lot of heart. Delivered fresh across Cyprus.",
    url: "/",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Menu />
        <Gallery />
        <HowToOrder />
      </main>
      <Footer />
    </>
  );
}
