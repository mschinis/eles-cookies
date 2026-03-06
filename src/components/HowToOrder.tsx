"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const OrderModal = dynamic(() => import("./OrderModal"), { ssr: false });

const steps = [
  {
    number: "01",
    title: "Pick your box",
    description:
      "Choose a curated seasonal box or build your own — mix any flavours in multiples of 4, from 12 to 48 cookies.",
  },
  {
    number: "02",
    title: "Pay securely online",
    description:
      "Enter your delivery details and pay via card, Apple Pay, or Google Pay. We deliver across Cyprus.",
  },
  {
    number: "03",
    title: "Fresh to your door",
    description:
      "We bake your order fresh and deliver it straight to you. Expect your cookies within 2–3 days.",
  },
];

export default function HowToOrder() {
  const [modalOpen, setModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const stepEls =
      stepsRef.current?.querySelectorAll<HTMLDivElement>(".step-item");
    if (stepEls) {
      gsap.fromTo(
        stepEls,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    gsap.fromTo(
      contactRef.current,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contactRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="order"
      className="bg-cocoa py-24 text-white md:py-36"
    >
      <div className="mx-auto max-w-5xl px-8">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-caramel">
            How to Order
          </span>
          <h2 className="font-display text-4xl font-bold text-white md:text-5xl">
            Order in minutes
          </h2>
        </div>

        <div
          ref={stepsRef}
          className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {steps.map((step) => (
            <div
              key={step.number}
              className="step-item"
              style={{ opacity: 0 }}
            >
              <span className="mb-4 block font-display text-5xl font-bold text-caramel/40">
                {step.number}
              </span>
              <h3 className="mb-3 font-display text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div
          ref={contactRef}
          id="contact"
          className="rounded-3xl bg-white/5 p-8 md:p-12"
          style={{ opacity: 0 }}
        >
          <h3 className="mb-3 text-center font-display text-2xl font-semibold text-white">
            Ready to order?
          </h3>
          <p className="mb-8 text-center text-sm text-white/50">
            Place a retail order online, or get in touch about wholesale pricing.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {/* Order now — modal on desktop, full page on mobile */}
            <a
              href="/order"
              className="block w-full rounded-full bg-caramel px-8 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-caramel/90 sm:hidden"
            >
              Order now
            </a>
            <button
              onClick={() => setModalOpen(true)}
              className="hidden w-full rounded-full bg-caramel px-8 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-caramel/90 sm:block sm:w-auto"
            >
              Order now
            </button>

            {/* Wholesale enquiries */}
            <a
              href="mailto:hello@elescookies.com?subject=Wholesale%20Enquiry"
              className="w-full rounded-full border border-white/20 px-8 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:w-auto"
            >
              Wholesale enquiries
            </a>
          </div>
        </div>

        {modalOpen && <OrderModal onClose={() => setModalOpen(false)} />}
      </div>
    </section>
  );
}
