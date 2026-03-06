"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCart } from "@/context/CartContext";

function CartIcon() {
  const { totalItems, openCart } = useCart();
  return (
    <button onClick={openCart} aria-label="Open basket" className="relative flex h-9 w-9 items-center justify-center rounded-full text-cocoa/70 transition-colors hover:bg-sand hover:text-cocoa">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-caramel text-[10px] font-bold text-white">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </button>
  );
}

// ─── Order dropdown (desktop) ─────────────────────────────────────────────────

function OrderDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <li className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="flex items-center gap-1.5 rounded-full bg-caramel px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-caramel/90">
        Order
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full pt-3 z-50">
          <div className="flex w-72 flex-col gap-2 rounded-2xl bg-white p-3 shadow-xl shadow-cocoa/10 ring-1 ring-cocoa/5">
            <a
              href="/products"
              className="group flex flex-col gap-0.5 rounded-xl p-4 transition-colors hover:bg-sand/40"
            >
              <span className="text-sm font-semibold text-cocoa group-hover:text-caramel transition-colors">
                Shop seasonal boxes
              </span>
              <span className="text-xs leading-relaxed text-cocoa/50">
                Ready-made curated collections, fresh every season.
              </span>
            </a>
            <a
              href="/order"
              className="group flex flex-col gap-0.5 rounded-xl bg-caramel/8 p-4 transition-colors hover:bg-caramel/15"
            >
              <span className="text-sm font-semibold text-cocoa group-hover:text-caramel transition-colors">
                Customise your own
              </span>
              <span className="text-xs leading-relaxed text-cocoa/50">
                Mix any flavours, any combination, your way.
              </span>
            </a>
          </div>
        </div>
      )}
    </li>
  );
}

// ─── Mobile menu ──────────────────────────────────────────────────────────────

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
              className="border-b border-sand/60"
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

          {/* Order options — two equal buttons */}
          <li
            ref={(el) => { if (el) itemRefs.current[navLinks.length] = el; }}
            style={{ opacity: 0 }}
            className="flex flex-col gap-3 pt-7"
          >
            <a
              href="/products"
              onClick={() => selfRef.current?.close()}
              className="block rounded-full border border-cocoa/20 px-8 py-4 text-center font-display text-xl font-semibold text-cocoa transition-colors hover:border-caramel hover:text-caramel"
            >
              Shop seasonal boxes
            </a>
            <a
              href="/order"
              onClick={() => selfRef.current?.close()}
              className="block rounded-full bg-caramel px-8 py-4 text-center font-display text-xl font-semibold text-white transition-colors hover:bg-caramel/90"
            >
              Customise your own
            </a>
          </li>
        </ul>
      </div>
    );
  }
);

// ─── Nav links ────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Our Flavours", href: "/#menu" },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<{ close: () => void }>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      start: "top-=80",
      onEnter: () =>
        gsap.to(navRef.current, {
          duration: 0.4,
          ease: "power2.out",
        }),
      onLeaveBack: () =>
        gsap.to(navRef.current, {
          backgroundColor: "transparent",
          duration: 0.4,
          ease: "power2.out",
        }),
    });

    return () => { trigger.kill(); };
  }, []);

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
          <OrderDropdown />
          <CartIcon />
        </ul>

        {/* Cart + hamburger — mobile only */}
        <div className="flex items-center gap-1 md:hidden">
          <CartIcon />
          <button
            onClick={() => {
              if (mobileOpen) {
                menuRef.current?.close();
              } else {
                setMobileOpen(true);
                setMenuVisible(true);
              }
            }}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
            aria-label={menuVisible ? "Close menu" : "Open menu"}
          >
            <span className={`block h-0.5 w-5 bg-cocoa transition-all duration-300 ${menuVisible ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-cocoa transition-all duration-300 ${menuVisible ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-cocoa transition-all duration-300 ${menuVisible ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
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
