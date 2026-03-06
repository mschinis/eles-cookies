"use client";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/payload-types";

type NutritionPerCookie = NonNullable<Product["nutritionPerCookie"]>;

type Props = {
  ingredients?: string | null;
  allergens?: string | null;
  mayContain?: string | null;
  nutritionPerCookie?: NutritionPerCookie | null;
};

const nutritionRows: { key: keyof NutritionPerCookie; label: string; unit: string }[] = [
  { key: "calories", label: "Energy", unit: "kcal" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "saturatedFat", label: "of which saturated", unit: "g" },
  { key: "carbohydrates", label: "Carbohydrates", unit: "g" },
  { key: "sugars", label: "of which sugars", unit: "g" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "salt", label: "Salt", unit: "g" },
];

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.maxHeight = open ? el.scrollHeight + "px" : "0px";
    el.style.opacity = open ? "1" : "0";
  }, [open]);

  return (
    <div className="border-b border-sand last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-display text-sm font-semibold text-cocoa">{title}</span>
        <span
          className="shrink-0 text-caramel transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3.75v10.5M3.75 9h10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <div
        ref={bodyRef}
        style={{ maxHeight: "0px", opacity: 0, overflow: "hidden", transition: "max-height 0.3s ease, opacity 0.25s ease" }}
      >
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}

export default function ProductAccordion({ ingredients, allergens, mayContain, nutritionPerCookie }: Props) {
  const hasNutrition = nutritionPerCookie &&
    nutritionRows.some(({ key }) => nutritionPerCookie[key] != null);

  if (!ingredients && !allergens && !mayContain && !hasNutrition) return null;

  return (
    <div className="mt-8 rounded-2xl border border-sand bg-white px-6">
      {ingredients && (
        <AccordionItem title="Ingredients">
          <p className="text-sm leading-relaxed text-cocoa/70">{ingredients}</p>
        </AccordionItem>
      )}

      {(allergens || mayContain) && (
        <AccordionItem title="Allergens">
          {allergens && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-caramel">Contains</p>
              <p className="text-sm leading-relaxed text-cocoa/70">{allergens}</p>
            </div>
          )}
          {mayContain && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cocoa/40">May contain traces of</p>
              <p className="text-sm leading-relaxed text-cocoa/70">{mayContain}</p>
            </div>
          )}
        </AccordionItem>
      )}

      {hasNutrition && (
        <AccordionItem title="Nutritional Information">
          <p className="mb-3 text-xs text-cocoa/40">Per cookie (approximate values)</p>
          <table className="w-full text-sm">
            <tbody>
              {nutritionRows.map(({ key, label, unit }) => {
                const value = nutritionPerCookie![key];
                if (value == null) return null;
                const isSubRow = label.startsWith("of which");
                return (
                  <tr key={key} className="border-b border-sand/60 last:border-0">
                    <td className={`py-2 text-cocoa/70 ${isSubRow ? "pl-4" : ""}`}>{label}</td>
                    <td className="py-2 text-right font-semibold text-cocoa">
                      {value} {unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AccordionItem>
      )}
    </div>
  );
}
