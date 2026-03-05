"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const steps = [
  {
    number: "01",
    title: "Choose your flavours",
    description:
      "Browse our menu and pick your favourites. Mix and match — minimum order of 12 cookies.",
  },
  {
    number: "02",
    title: "Message us",
    description:
      "Reach out via Instagram, WhatsApp, or email with your order details and preferred pickup date.",
  },
  {
    number: "03",
    title: "Receive your cookies",
    description:
      "We'll confirm your order and have it ready fresh. Collection or local delivery available.",
  },
];

const contacts = [
  { label: "Instagram", handle: "@elescookies", href: "#order" },
  { label: "WhatsApp", handle: "+44 000 000 0000", href: "#order" },
  { label: "Email", handle: "hello@elescookies.com", href: "#order" },
];

export default function HowToOrder() {
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
            Three simple steps
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
          <h3 className="mb-8 text-center font-display text-2xl font-semibold text-white">
            Get in touch
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-white/10 p-6 text-center transition-colors duration-200 hover:border-caramel/40 hover:bg-white/5"
              >
                <span className="text-xs font-medium uppercase tracking-widest text-caramel">
                  {c.label}
                </span>
                <span className="text-sm text-white/70 group-hover:text-white transition-colors duration-200">
                  {c.handle}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
