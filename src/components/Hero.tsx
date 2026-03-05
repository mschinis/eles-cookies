"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const headline = "Handmade with love, baked to order.";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const cookieImgRef = useRef<HTMLDivElement>(null);
  const cookieMedRef = useRef<HTMLDivElement>(null);
  const cookieSmallRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Word-by-word headline reveal on load
    const words =
      headlineRef.current?.querySelectorAll<HTMLSpanElement>(".word");
    if (words) {
      gsap.fromTo(
        words,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.07,
          duration: 0.7,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.9 }
    );

    // Cookie parallax on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    tl.to(cookieImgRef.current, { y: 160, ease: "none" }, 0);
    tl.to(cookieMedRef.current, { y: 100, ease: "none" }, 0);
    tl.to(cookieSmallRef.current, { y: 60, ease: "none" }, 0);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream"
    >
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Floating cookie image */}
      <div
        ref={cookieImgRef}
        className="absolute right-[5%] top-[10%] h-72 w-72 overflow-hidden rounded-full shadow-2xl will-change-transform md:h-96 md:w-96"
      >
        <Image
          src="/images/hero-cookies.jpg"
          alt="Fresh baked chocolate chip cookies"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Medium floating cookie — bottom left */}
      <div
        ref={cookieMedRef}
        className="absolute left-[5%] bottom-[15%] h-48 w-48 overflow-hidden rounded-full shadow-xl will-change-transform md:h-56 md:w-56"
      >
        <Image
          src="/images/gallery-1.jpg"
          alt="Stacked cookies"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Small floating cookie — bottom centre-right */}
      <div
        ref={cookieSmallRef}
        className="absolute right-[28%] bottom-[8%] h-20 w-20 overflow-hidden rounded-full shadow-lg will-change-transform md:h-28 md:w-28"
      >
        <Image
          src="/images/gallery-5.jpg"
          alt="Cookies on a board"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-8 text-center">
        <h1
          ref={headlineRef}
          className="mb-6 font-display text-5xl font-bold leading-tight tracking-tight text-cocoa md:text-7xl"
        >
          {headline.split(" ").map((word, i) => (
            <span
              key={i}
              className="word mr-[0.25em] inline-block"
              style={{ opacity: 0 }}
            >
              {word}
            </span>
          ))}
        </h1>

        <div ref={contentRef} style={{ opacity: 0 }}>
          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-cocoa/65 md:text-xl">
            Small-batch, made-to-order cookies crafted with quality ingredients
            and a whole lot of heart.
          </p>
          <a
            href="#menu"
            className="inline-block rounded-full bg-caramel px-10 py-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-cocoa"
          >
            See our cookies
          </a>
        </div>
      </div>
    </section>
  );
}
