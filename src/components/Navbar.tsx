"use client";
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const MobileMenu = forwardRef<{ close: () => void }, { onClose: () => void }>(
  function MobileMenu({ onClose }, ref) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<HTMLLIElement[]>([]);
    const selfRef = useRef<{ close: () => void } | null>(null);

    function close() {
      const tl = gsap.timeline({ onComplete: onClose });
      tl.to(itemRefs.current, {
        opacity: 0,
        x: -32,
        stagger: 0.04,
        duration: 0.25,
        ease: "power2.in",
      });
      tl.to(
        backdropRef.current,
        { opacity: 0, duration: 0.2, ease: "power2.out" },
        "-=0.05"
      );
    }

    useImperativeHandle(ref, () => ({ close }));

    // Store close in selfRef so nav links can call it
    selfRef.current = { close };

    useEffect(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      tl.fromTo(
        itemRefs.current,
        { opacity: 0, x: -32 },
        { opacity: 1, x: 0, stagger: 0.07, duration: 0.4, ease: "power3.out" },
        "-=0.05"
      );
      return () => { tl.kill(); };
    }, []);

    return (
      <div
        ref={backdropRef}
        style={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex flex-col bg-cream pt-20 md:hidden"
      >
        <ul className="flex flex-col px-8 pt-8">
          {navLinks.map((link, i) => (
            <li
              key={link.label}
              ref={(el) => { if (el) itemRefs.current[i] = el; }}
              style={{ opacity: 0 }}
              className="border-b border-sand/60 last:border-0"
            >
              <a
                href={link.href}
                onClick={() => selfRef.current?.close()}
                className="block py-5 font-display text-2xl font-semibold text-cocoa transition-colors hover:text-caramel"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Menu", href: "/#menu" },
  { label: "Shop", href: "/products" },
  { label: "Order", href: "/order" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<{ close: () => void }>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // stays true while the exit animation is playing so hamburger keeps showing X
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      start: "top-=80",
      onEnter: () =>
        gsap.to(navRef.current, {
          // boxShadow: "0 1px 24px rgba(61,35,20,0.08)",
          duration: 0.4,
          ease: "power2.out",
        }),
      onLeaveBack: () =>
        gsap.to(navRef.current, {
          backgroundColor: "transparent",
          // boxShadow: "none",
          duration: 0.4,
          ease: "power2.out",
        }),
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-8 py-5 bg-cream"
        style={{ boxShadow: "0 1px 24px rgba(61,35,20,0.08)" }}
      >
        <a
          href="/"
          className="font-display text-xl font-bold tracking-tight text-cocoa"
        >
          Ele&apos;s Cookies
        </a>

        {/* Desktop links */}
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

        {/* Hamburger — mobile only */}
        <button
          onClick={() => {
            if (mobileOpen) {
              menuRef.current?.close();
            } else {
              setMobileOpen(true);
              setMenuVisible(true);
            }
          }}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={menuVisible ? "Close menu" : "Open menu"}
        >
          <span
            className={`block h-0.5 w-5 bg-cocoa transition-all duration-300 ${
              menuVisible ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-cocoa transition-all duration-300 ${
              menuVisible ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-cocoa transition-all duration-300 ${
              menuVisible ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {mobileOpen && (
        <MobileMenu
          ref={menuRef}
          onClose={() => { setMobileOpen(false); setMenuVisible(false); }}
        />
      )}
    </>
  );
}
