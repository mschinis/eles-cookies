"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const galleryItems = [
  { src: "/images/gallery-1.jpg", alt: "Stacked chocolate chip cookies on marble", speed: -40, aspect: "aspect-[3/4]" },
  { src: "/images/gallery-2.jpg", alt: "Salted cookies fresh from the tray", speed: -70, aspect: "aspect-square" },
  { src: "/images/gallery-3.jpg", alt: "Cookies in a rustic bowl", speed: -25, aspect: "aspect-[4/5]" },
  { src: "/images/gallery-4.jpg", alt: "Gingerbread cookies on cooling rack", speed: -55, aspect: "aspect-[3/4]" },
  { src: "/images/gallery-5.jpg", alt: "Cookies on a wooden board", speed: -35, aspect: "aspect-square" },
  { src: "/images/gallery-6.jpg", alt: "Cookies going into the oven", speed: -50, aspect: "aspect-[4/5]" },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggers: ScrollTrigger[] = [];

    itemRefs.current.forEach((item, i) => {
      if (!item) return;

      gsap.fromTo(
        item,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      tl.to(item, { y: galleryItems[i].speed, ease: "none" });
      if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="gallery" className="py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-caramel">
            Gallery
          </span>
          <h2 className="font-display text-4xl font-bold text-cocoa md:text-5xl">
            Fresh from the Oven
          </h2>
        </div>

        <div className="columns-2 gap-4 md:columns-3">
          {galleryItems.map((item, i) => (
            <div
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="mb-4 break-inside-avoid will-change-transform"
              style={{ opacity: 0 }}
            >
              <div className={`relative w-full overflow-hidden rounded-2xl ${item.aspect}`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
