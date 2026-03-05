"use client";
import { useEffect } from "react";
import OrderForm from "./OrderForm";

type Props = {
  onClose: () => void;
};

export default function OrderModal({ onClose }: Props) {
  // Freeze page scroll while modal is open
  useEffect(() => {
    window.dispatchEvent(new Event("lenis:stop"));
    return () => { window.dispatchEvent(new Event("lenis:start")); };
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cocoa/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl">
        {/* Modal header */}
        <div className="flex shrink-0 items-center justify-between border-b border-sand px-8 py-5">
          <div>
            <p className="font-display text-xl font-bold text-cocoa">Place an Order</p>
            <p className="text-xs text-cocoa/50">
              Mix your flavours and pay securely.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-cocoa/40 transition-colors hover:bg-sand hover:text-cocoa"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable form */}
        <div className="min-h-0 flex-1 overflow-y-auto px-8 pt-8" data-lenis-prevent>
          <OrderForm variant="modal" />
        </div>
      </div>
    </div>
  );
}
