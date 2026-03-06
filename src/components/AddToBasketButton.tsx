"use client";
import { useCart } from "@/context/CartContext";

type Props = {
  slug: string;
  name: string;
  subtotalCents: number;
  boxSize: number;
  className?: string;
};

export default function AddToBasketButton({ slug, name, subtotalCents, boxSize, className }: Props) {
  const { add } = useCart();

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // prevent Link navigation if inside a Link
        add({ slug, name, subtotalCents, boxSize });
      }}
      className={className ?? "w-full rounded-full bg-caramel px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-caramel/90"}
    >
      Add to basket
    </button>
  );
}
