"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const OrderModal = dynamic(() => import("./OrderModal"), { ssr: false });

type Props = {
  label?: string;
  className?: string;
};

export default function OrderTrigger({ label = "Order now", className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop — modal */}
      <button
        onClick={() => setOpen(true)}
        className={`hidden sm:inline-flex ${className ?? ""}`}
      >
        {label}
      </button>
      {/* Mobile — full page */}
      <a href="/order" className={`inline-flex sm:hidden ${className ?? ""}`}>
        {label}
      </a>
      {open && <OrderModal onClose={() => setOpen(false)} />}
    </>
  );
}
