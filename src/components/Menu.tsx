"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const flavours = [
  {
    name: "Classic Chocolate Chip",
    description:
      "Golden-edged, chewy centres loaded with premium milk chocolate chunks.",
    image: "/images/menu-choc-chip.jpg",
  },
  {
    name: "Brown Butter Caramel",
    description:
      "Nutty brown butter dough swirled with ribbons of salted caramel.",
    image: "/images/menu-caramel.jpg",
  },
  {
    name: "Espresso Dark Chocolate",
    description:
      "Bold espresso notes paired with 70% dark chocolate chips.",
    image: "/images/menu-espresso.jpg",
  },
  {
    name: "Lemon Poppy Seed",
    description:
      "Bright citrus zest and poppy seeds in a soft, buttery base.",
    image: "/images/menu-lemon.jpg",
  },
  {
    name: "Pistachio & Rose",
    description:
      "Delicate rose water and crushed pistachios in every delicate bite.",
    image: "/images/menu-pistachio.jpg",
  },
  {
    name: "Peanut Butter Pretzel",
    description:
      "Creamy peanut butter dough with crunchy pretzel pieces and sea salt.",
    image: "/images/menu-peanut.jpg",
  },
];

export default function Menu() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const cards =
      cardsRef.current?.querySelectorAll<HTMLDivElement>(".menu-card");
    if (!cards) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
    });

    tl.fromTo(
      cards,
      { opacity: 0, y: 48 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" }
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} id="menu" className="py-24 md:py-36 bg-sand/25">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-caramel">
            The Menu
          </span>
          <h2 className="font-display text-4xl font-bold text-cocoa md:text-5xl">
            Our Flavours
          </h2>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {flavours.map((flavour) => (
            <div
              key={flavour.name}
              className="menu-card group rounded-2xl bg-white shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md"
              style={{ opacity: 0 }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={flavour.image}
                  alt={flavour.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 font-display text-xl font-semibold text-cocoa">
                  {flavour.name}
                </h3>
                <p className="text-sm leading-relaxed text-cocoa/60">
                  {flavour.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
