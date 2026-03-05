"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    tl.fromTo(
      imageRef.current,
      { opacity: 0, scale: 1.06 },
      { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" },
      "-=0.5"
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="mx-auto max-w-7xl px-8 py-24 md:py-36"
    >
      <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
        <div ref={textRef} className="order-2 md:order-1" style={{ opacity: 0 }}>
          <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-caramel">
            Our Story
          </span>
          <h2 className="mb-6 font-display text-4xl font-bold leading-snug text-cocoa md:text-5xl">
            Baked with love,
            <br />
            one batch at a time.
          </h2>
          <p className="mb-5 leading-relaxed text-cocoa/70">
            Hi, I&apos;m Ele — a home baker with a deep love for creating
            cookies that bring genuine joy. What started as weekend baking for
            friends and family quickly turned into something I couldn&apos;t
            stop doing.
          </p>
          <p className="leading-relaxed text-cocoa/70">
            Every cookie is made to order, using quality ingredients — real
            butter, fine chocolate, and no shortcuts. I believe in slow baking,
            honest flavours, and packaging that makes every order feel like a
            gift.
          </p>
        </div>

        <div
          ref={imageRef}
          className="order-1 overflow-hidden rounded-3xl md:order-2"
          style={{ opacity: 0 }}
        >
          <div className="relative aspect-[4/5] w-full">
            <Image
              src="/images/about-baker.jpg"
              alt="Ele holding a fresh tray of cookies"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
