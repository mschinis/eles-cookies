"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Menu", href: "/#menu" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Order", href: "/order" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      start: "top-=80",
      onEnter: () =>
        gsap.to(navRef.current, {
          backgroundColor: "#FAF6F1",
          boxShadow: "0 1px 24px rgba(61,35,20,0.08)",
          duration: 0.4,
          ease: "power2.out",
        }),
      onLeaveBack: () =>
        gsap.to(navRef.current, {
          backgroundColor: "transparent",
          boxShadow: "none",
          duration: 0.4,
          ease: "power2.out",
        }),
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-8 py-5"
    >
      <a
        href="#"
        className="font-display text-xl font-bold tracking-tight text-cocoa"
      >
        Ele&apos;s Cookies
      </a>
      <ul className="hidden items-center gap-8 md:flex">
        {navLinks.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-cocoa/80 transition-colors duration-200 hover:text-caramel"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
