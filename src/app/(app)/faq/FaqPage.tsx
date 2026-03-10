"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Data ────────────────────────────────────────────────────────────────────

const deliveryDetails = [
  {
    icon: "📍",
    title: "Cyprus only",
    body: "We currently deliver anywhere across Cyprus — Nicosia, Limassol, Larnaca, Paphos, Famagusta, and surrounding areas.",
  },
  {
    icon: "⏱️",
    title: "2–3 days",
    body: "Every order is baked fresh after payment. Expect your cookies to arrive within 2–3 business days.",
  },
  {
    icon: "📦",
    title: "€2.50 flat shipping",
    body: "A flat €2.50 shipping fee applies to all orders. Shipping is free on orders of 48 cookies (subtotal ≥ €50).",
  },
  {
    icon: "🎁",
    title: "Gift-ready packaging",
    body: "Every box is packaged beautifully. Add a gift message at checkout and we'll include a handwritten card.",
  },
];

const faqSections = [
  {
    heading: "Ordering & Pricing",
    items: [
      {
        q: "What batch sizes are available?",
        a: "We offer three batch sizes: 12, 24, and 48 cookies. These sizes let us bake consistently fresh, full batches without waste.",
      },
      {
        q: "How much do the cookies cost?",
        a: "Cookies are €2.00 each. We also offer volume discounts: 10% off a box of 24, and 15% off a box of 48 — which also qualifies for free shipping.",
      },
      {
        q: "Can I mix different flavours?",
        a: "Absolutely. You can mix any combination of flavours in multiples of 4 (e.g. 8 chocolate chip + 4 caramel). Just select your quantities in the order form.",
      },
      {
        q: "How do I pay?",
        a: "We accept all major credit and debit cards, Apple Pay, and Google Pay — processed securely via Stripe. You'll receive a confirmation email once payment is complete.",
      },
      {
        q: "Can I cancel or change my order after paying?",
        a: "Because every order is baked fresh, we begin preparation shortly after payment. Please contact us as soon as possible at hello@elescookies.com if you need to make a change — we'll do our best to help.",
      },
    ],
  },
  {
    heading: "Delivery",
    items: [
      {
        q: "Where do you deliver?",
        a: "We deliver across Cyprus only. This includes Nicosia, Limassol, Larnaca, Paphos, Famagusta, and surrounding towns and villages.",
      },
      {
        q: "How long does delivery take?",
        a: "Orders are baked fresh and typically delivered within 2–3 business days of your order being confirmed.",
      },
      {
        q: "How much does shipping cost?",
        a: "Shipping is a flat €2.50 for all orders. Orders of 48 cookies (subtotal €40.80 after discount) qualify for free shipping as the subtotal exceeds €50 — wait, orders of 48 cookies have a subtotal of €81.60 after the 15% discount, so they always qualify for free shipping.",
      },
      {
        q: "Do you offer same-day or next-day delivery?",
        a: "Not at the moment. Every order is made fresh to order, which means we need a little time to bake. We're working on offering express options in future.",
      },
      {
        q: "What happens if I'm not home for delivery?",
        a: "Our courier will attempt redelivery or leave the parcel in a safe place. You'll receive delivery updates by email. If you have a preferred delivery time or note, add it in the notes field at checkout.",
      },
    ],
  },
  {
    heading: "The Cookies",
    items: [
      {
        q: "What allergens do the cookies contain?",
        a: "Our cookies contain gluten (wheat flour), dairy (butter), and eggs. Some flavours also contain nuts (pistachio, peanut) or soy. All cookies are produced in the same kitchen, so cross-contamination is possible. If you have a severe allergy, please contact us before ordering.",
      },
      {
        q: "How long do the cookies stay fresh?",
        a: "Cookies are best enjoyed within 3–4 days of delivery at room temperature. They can also be frozen for up to 3 months — just warm them in the oven for a few minutes and they'll taste freshly baked.",
      },
      {
        q: "Are your cookies suitable for vegetarians?",
        a: "Yes, all our cookies are vegetarian. They are not vegan as they contain butter and eggs.",
      },
      {
        q: "Do you use artificial flavours or preservatives?",
        a: "Never. We use real butter, quality chocolate, fresh citrus zest, and natural extracts. No artificial flavours, colours, or preservatives — ever.",
      },
      {
        q: "Do you offer gluten-free or vegan options?",
        a: "Not currently, but it's something we'd love to explore. If this is important to you, drop us an email at hello@elescookies.com and we'll let you know when it becomes available.",
      },
    ],
  },
  {
    heading: "Gifts & Special Orders",
    items: [
      {
        q: "Can I send cookies as a gift?",
        a: "Yes! At checkout, tick the 'This is a gift' option and add a personal message. We'll include a handwritten card and make sure the packaging is extra special.",
      },
      {
        q: "Do you offer wholesale or event catering?",
        a: "Yes, we'd love to hear from you. Whether it's a corporate event, wedding favour, or regular wholesale supply, email us at hello@elescookies.com with details and we'll get back to you with a quote.",
      },
      {
        q: "Can I request a custom flavour?",
        a: "We occasionally take custom flavour requests for large orders. Get in touch and we'll see what we can do.",
      },
    ],
  },
];

// ─── Accordion item ───────────────────────────────────────────────────────────

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (open) {
      el.style.maxHeight = el.scrollHeight + "px";
      el.style.opacity = "1";
    } else {
      el.style.maxHeight = "0px";
      el.style.opacity = "0";
    }
  }, [open]);

  return (
    <div className="border-b border-sand last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-base font-semibold text-cocoa md:text-lg">
          {q}
        </span>
        <span
          className="flex-shrink-0 text-caramel transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        ref={bodyRef}
        style={{ maxHeight: "0px", opacity: 0, overflow: "hidden", transition: "max-height 0.35s ease, opacity 0.3s ease" }}
      >
        <p className="pb-5 text-sm leading-relaxed text-cocoa/70">{a}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FaqPageClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const deliveryRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 }
    );

    const cards = deliveryRef.current?.querySelectorAll<HTMLDivElement>(".delivery-card");
    if (cards) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: deliveryRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    const sectionEls = sectionsRef.current?.querySelectorAll<HTMLDivElement>(".faq-section");
    if (sectionEls) {
      sectionEls.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream">
        {/* Hero */}
        <div className="pt-32 pb-16 text-center px-6">
          <div ref={heroRef} style={{ opacity: 0 }}>
            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-caramel">
              Help
            </span>
            <h1 className="font-display text-4xl font-bold text-cocoa md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-cocoa/60 max-w-xl mx-auto leading-relaxed">
              Everything you need to know about ordering, delivery, and our cookies. Can&apos;t find your answer?{" "}
              <a
                href="mailto:hello@elescookies.com"
                className="text-caramel underline underline-offset-2 hover:text-caramel/80 transition-colors"
              >
                Drop us an email.
              </a>
            </p>
          </div>
        </div>

        {/* Delivery details */}
        <section className="bg-cocoa py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-8">
            <div className="mb-10 text-center">
              <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-caramel">
                Delivery
              </span>
              <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
                How we get cookies to you
              </h2>
            </div>
            <div
              ref={deliveryRef}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {deliveryDetails.map((d) => (
                <div
                  key={d.title}
                  className="delivery-card rounded-2xl bg-white/5 p-6"
                  style={{ opacity: 0 }}
                >
                  <span className="mb-4 block text-3xl">{d.icon}</span>
                  <h3 className="mb-2 font-display text-lg font-semibold text-white">
                    {d.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">{d.body}</p>
                </div>
              ))}
            </div>

            {/* Pricing table */}
            <div className="mt-10 rounded-2xl bg-white/5 p-6 md:p-8">
              <h3 className="mb-6 font-display text-xl font-semibold text-white text-center">
                Pricing at a glance
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-white/70">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-3 text-left font-medium text-white/50">Box size</th>
                      <th className="pb-3 text-right font-medium text-white/50">Discount</th>
                      <th className="pb-3 text-right font-medium text-white/50">Subtotal</th>
                      <th className="pb-3 text-right font-medium text-white/50">Shipping</th>
                      <th className="pb-3 text-right font-medium text-white/50">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="py-3 font-semibold text-white">12 cookies</td>
                      <td className="py-3 text-right">—</td>
                      <td className="py-3 text-right">€24.00</td>
                      <td className="py-3 text-right">€2.50</td>
                      <td className="py-3 text-right font-semibold text-white">€26.50</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 font-semibold text-white">24 cookies</td>
                      <td className="py-3 text-right text-caramel">10% off</td>
                      <td className="py-3 text-right">€43.20</td>
                      <td className="py-3 text-right">€2.50</td>
                      <td className="py-3 text-right font-semibold text-white">€45.70</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-white">48 cookies</td>
                      <td className="py-3 text-right text-caramel">15% off</td>
                      <td className="py-3 text-right">€81.60</td>
                      <td className="py-3 text-right text-caramel">Free</td>
                      <td className="py-3 text-right font-semibold text-white">€81.60</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ sections */}
        <section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <div ref={sectionsRef} className="space-y-14">
            {faqSections.map((section) => (
              <div key={section.heading} className="faq-section" style={{ opacity: 0 }}>
                <h2 className="mb-6 font-display text-2xl font-bold text-cocoa md:text-3xl">
                  {section.heading}
                </h2>
                <div className="rounded-2xl bg-white px-6 shadow-sm">
                  {section.items.map((item) => (
                    <AccordionItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 rounded-3xl bg-sand/60 p-8 text-center md:p-12">
            <h3 className="mb-3 font-display text-2xl font-semibold text-cocoa">
              Still have a question?
            </h3>
            <p className="mb-8 text-sm text-cocoa/60">
              We&apos;re always happy to help. Email us and we&apos;ll reply within one business day.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="mailto:hello@elescookies.com"
                className="rounded-full bg-caramel px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-caramel/90"
              >
                Email us
              </a>
              <a
                href="/order"
                className="rounded-full border border-cocoa/20 px-8 py-3.5 text-sm font-semibold text-cocoa transition-colors hover:border-cocoa/40 hover:bg-cocoa/5"
              >
                Place an order
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
