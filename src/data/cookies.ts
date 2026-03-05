export type Cookie = {
  id: string;
  name: string;
  description: string;
  image: string;
  available: boolean;
};

export const PRICE_PER_COOKIE_CENTS = 200; // €2.00
export const SHIPPING_CENTS = 250; // €2.50
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000; // €50.00
export const BATCH_SIZES = [12, 24, 48] as const;
export type BatchSize = (typeof BATCH_SIZES)[number];

export const BATCH_DISCOUNTS: Record<BatchSize, number> = {
  12: 0,
  24: 0.1,
  48: 0.15,
};

export function calcSubtotal(batchSize: BatchSize): number {
  const gross = batchSize * PRICE_PER_COOKIE_CENTS;
  return Math.round(gross * (1 - BATCH_DISCOUNTS[batchSize]));
}

export function calcShipping(batchSize: BatchSize): number {
  return calcSubtotal(batchSize) >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_CENTS;
}

export function calcTotal(batchSize: BatchSize): number {
  return calcSubtotal(batchSize) + calcShipping(batchSize);
}

export const cookies: Cookie[] = [
  {
    id: "classic-chocolate-chip",
    name: "Classic Chocolate Chip",
    description: "Golden-edged, chewy centres loaded with premium milk chocolate chunks.",
    image: "/images/menu-choc-chip.jpg",
    available: true,
  },
  {
    id: "brown-butter-caramel",
    name: "Brown Butter Caramel",
    description: "Nutty brown butter dough swirled with ribbons of salted caramel.",
    image: "/images/menu-caramel.jpg",
    available: true,
  },
  {
    id: "espresso-dark-chocolate",
    name: "Espresso Dark Chocolate",
    description: "Bold espresso notes paired with 70% dark chocolate chips.",
    image: "/images/menu-espresso.jpg",
    available: true,
  },
  {
    id: "lemon-poppy-seed",
    name: "Lemon Poppy Seed",
    description: "Bright citrus zest and poppy seeds in a soft, buttery base.",
    image: "/images/menu-lemon.jpg",
    available: true,
  },
  {
    id: "pistachio-rose",
    name: "Pistachio & Rose",
    description: "Delicate rose water and crushed pistachios in every delicate bite.",
    image: "/images/menu-pistachio.jpg",
    available: true,
  },
  {
    id: "peanut-butter-pretzel",
    name: "Peanut Butter Pretzel",
    description: "Creamy peanut butter dough with crunchy pretzel pieces and sea salt.",
    image: "/images/menu-peanut.jpg",
    available: true,
  },
];
