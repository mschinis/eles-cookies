export type ProductContents = {
  /** Display name shown in "What's inside" list */
  name: string;
  qty: number;
};

export type ProductType = "seasonal" | "custom";

export type Product = {
  slug: string;
  type: ProductType;
  name: string;
  tagline: string;
  /** Short text used on listing cards */
  description: string;
  /** Bullet points shown on the detail page */
  details: string[];
  /** Used on the listing card */
  coverImage: string;
  /** Full set of images for the detail gallery — first is the hero */
  images: string[];
  priceLabel: string;
  badge?: string;
  /** Visible on the /products page */
  isPublished: boolean;
  /** Can be added to cart / purchased online */
  isAvailable: boolean;
  /** Display names shown in the "What's inside" list */
  contents?: ProductContents[];
  /** Seasonal / fixed boxes only — cookie IDs + quantities sent to /api/checkout */
  checkoutItems?: { id: string; qty: number }[];
  /** Total number of cookies in this box */
  boxSize?: number;
};

export const products: Product[] = [
  // ─── Custom ────────────────────────────────────────────────────────────────
  {
    slug: "make-your-own",
    type: "custom",
    name: "Make Your Own Box",
    tagline: "Your flavours, your way.",
    description:
      "Pick your batch size and mix as many flavours as you like — each in multiples of 4. Perfect for when you can't choose just one.",
    details: [
      "Choose from 12, 24, or 48 cookies",
      "Mix any combination of available flavours",
      "Volume discounts on 24 and 48 packs",
      "Delivered fresh to your door in Cyprus",
    ],
    coverImage: "/images/hero-cookies.jpg",
    images: [
      "/images/hero-cookies.jpg",
      "/images/gallery-1.jpg",
      "/images/gallery-3.jpg",
    ],
    priceLabel: "From €26.50",
    isPublished: true,
    isAvailable: true,
  },

  // ─── Seasonal ──────────────────────────────────────────────────────────────
  {
    slug: "valentines-collection",
    type: "seasonal",
    name: "Valentine's Collection",
    tagline: "Sweet gestures, beautifully packaged.",
    description:
      "A romantic trio of our most-loved flavours, gift-wrapped and ready to make someone's day.",
    details: [
      "12 freshly baked cookies",
      "Gift-wrapped in our signature packaging",
      "Perfect for sharing — or not",
      "Available around Valentine's Day",
    ],
    coverImage: "/images/gallery-2.jpg",
    images: [
      "/images/gallery-2.jpg",
      "/images/gallery-4.jpg",
      "/images/menu-caramel.jpg",
      "/images/menu-pistachio.jpg",
    ],
    priceLabel: "€26.50",
    badge: "Valentine's Day",
    isPublished: true,
    isAvailable: true,
    boxSize: 12,
    contents: [
      { name: "Brown Butter Caramel", qty: 4 },
      { name: "Pistachio & Rose", qty: 4 },
      { name: "Classic Chocolate Chip", qty: 4 },
    ],
    checkoutItems: [
      { id: "brown-butter-caramel", qty: 4 },
      { id: "pistachio-rose", qty: 4 },
      { id: "classic-chocolate-chip", qty: 4 },
    ],
  },
  {
    slug: "easter-basket",
    type: "seasonal",
    name: "Easter Basket Box",
    tagline: "Spring flavours, fresh from the oven.",
    description:
      "Bright, zesty, and utterly delicious — a cheerful Easter treat for the whole family.",
    details: [
      "12 freshly baked cookies",
      "Light spring-inspired flavours",
      "Gift-packaged in a seasonal box",
      "Available around Easter",
    ],
    coverImage: "/images/gallery-5.jpg",
    images: [
      "/images/gallery-5.jpg",
      "/images/gallery-3.jpg",
      "/images/menu-lemon.jpg",
      "/images/menu-pistachio.jpg",
    ],
    priceLabel: "€26.50",
    badge: "Easter",
    isPublished: true,
    isAvailable: true,
    boxSize: 12,
    contents: [
      { name: "Lemon Poppy Seed", qty: 4 },
      { name: "Pistachio & Rose", qty: 4 },
      { name: "Brown Butter Caramel", qty: 4 },
    ],
    checkoutItems: [
      { id: "lemon-poppy-seed", qty: 4 },
      { id: "pistachio-rose", qty: 4 },
      { id: "brown-butter-caramel", qty: 4 },
    ],
  },
  {
    slug: "coffee-lovers-box",
    type: "seasonal",
    name: "Coffee Lover's Box",
    tagline: "Bold flavours for serious cookie people.",
    description:
      "Espresso-forward and richly indulgent — a box built for those who take their coffee (and cookies) seriously.",
    details: [
      "12 freshly baked cookies",
      "Rich, coffee-forward flavour profile",
      "Pairs perfectly with your morning espresso",
      "Available all year round",
    ],
    coverImage: "/images/menu-espresso.jpg",
    images: [
      "/images/menu-espresso.jpg",
      "/images/gallery-6.jpg",
      "/images/menu-caramel.jpg",
    ],
    priceLabel: "€26.50",
    badge: "Coffee Lover",
    isPublished: true,
    isAvailable: true,
    boxSize: 12,
    contents: [
      { name: "Espresso Dark Chocolate", qty: 8 },
      { name: "Brown Butter Caramel", qty: 4 },
    ],
    checkoutItems: [
      { id: "espresso-dark-chocolate", qty: 8 },
      { id: "brown-butter-caramel", qty: 4 },
    ],
  },
  {
    slug: "classic-collection",
    type: "seasonal",
    name: "The Classic Collection",
    tagline: "Every flavour, one beautiful box.",
    description:
      "All six of our signature flavours in a single generous box. The ultimate introduction to Ele's Cookies.",
    details: [
      "24 freshly baked cookies",
      "All six signature flavours included",
      "10% volume discount applied",
      "Ideal for sharing with a crowd",
    ],
    coverImage: "/images/gallery-1.jpg",
    images: [
      "/images/gallery-1.jpg",
      "/images/gallery-4.jpg",
      "/images/menu-choc-chip.jpg",
      "/images/menu-peanut.jpg",
    ],
    priceLabel: "€45.70",
    badge: "Best Value",
    isPublished: true,
    isAvailable: true,
    boxSize: 24,
    contents: [
      { name: "Classic Chocolate Chip", qty: 4 },
      { name: "Brown Butter Caramel", qty: 4 },
      { name: "Espresso Dark Chocolate", qty: 4 },
      { name: "Lemon Poppy Seed", qty: 4 },
      { name: "Pistachio & Rose", qty: 4 },
      { name: "Peanut Butter Pretzel", qty: 4 },
    ],
    checkoutItems: [
      { id: "classic-chocolate-chip", qty: 4 },
      { id: "brown-butter-caramel", qty: 4 },
      { id: "espresso-dark-chocolate", qty: 4 },
      { id: "lemon-poppy-seed", qty: 4 },
      { id: "pistachio-rose", qty: 4 },
      { id: "peanut-butter-pretzel", qty: 4 },
    ],
  },
  {
    slug: "christmas-box",
    type: "seasonal",
    name: "Christmas Box",
    tagline: "Festive warmth in every bite.",
    description:
      "Cosy, indulgent flavours to fill the house with the smell of the holidays.",
    details: [
      "12 freshly baked cookies",
      "Warm, wintery flavour selection",
      "Festive gift packaging",
      "Available through the Christmas season",
    ],
    coverImage: "/images/gallery-4.jpg",
    images: [
      "/images/gallery-4.jpg",
      "/images/gallery-6.jpg",
      "/images/menu-espresso.jpg",
      "/images/menu-peanut.jpg",
    ],
    priceLabel: "€26.50",
    badge: "Christmas",
    isPublished: true,
    isAvailable: true,
    boxSize: 12,
    contents: [
      { name: "Espresso Dark Chocolate", qty: 4 },
      { name: "Brown Butter Caramel", qty: 4 },
      { name: "Peanut Butter Pretzel", qty: 4 },
    ],
    checkoutItems: [
      { id: "espresso-dark-chocolate", qty: 4 },
      { id: "brown-butter-caramel", qty: 4 },
      { id: "peanut-butter-pretzel", qty: 4 },
    ],
  },

  // ─── Occasions ─────────────────────────────────────────────────────────────
  {
    slug: "birthday-for-him",
    type: "seasonal",
    name: "Birthday Box — For Him",
    tagline: "Bold, indulgent, and totally irresistible.",
    description:
      "A box packed with rich, crowd-pleasing flavours — the perfect birthday treat for the cookie lover in your life.",
    details: [
      "12 freshly baked cookies",
      "Bold, full-flavoured selection",
      "Gift-wrapped with a personalised message option",
      "Available all year round",
    ],
    coverImage: "/images/gallery-6.jpg",
    images: [
      "/images/gallery-6.jpg",
      "/images/menu-peanut.jpg",
      "/images/menu-espresso.jpg",
      "/images/menu-caramel.jpg",
    ],
    priceLabel: "€26.50",
    badge: "Birthday",
    isPublished: true,
    isAvailable: true,
    boxSize: 12,
    contents: [
      { name: "Peanut Butter Pretzel", qty: 4 },
      { name: "Espresso Dark Chocolate", qty: 4 },
      { name: "Brown Butter Caramel", qty: 4 },
    ],
    checkoutItems: [
      { id: "peanut-butter-pretzel", qty: 4 },
      { id: "espresso-dark-chocolate", qty: 4 },
      { id: "brown-butter-caramel", qty: 4 },
    ],
  },
  {
    slug: "birthday-for-her",
    type: "seasonal",
    name: "Birthday Box — For Her",
    tagline: "Delicate, elegant, and utterly delicious.",
    description:
      "A beautifully curated selection of our most refined flavours — the ideal birthday gift for someone special.",
    details: [
      "12 freshly baked cookies",
      "Light, floral, and indulgent flavours",
      "Gift-wrapped with a personalised message option",
      "Available all year round",
    ],
    coverImage: "/images/gallery-2.jpg",
    images: [
      "/images/gallery-2.jpg",
      "/images/menu-pistachio.jpg",
      "/images/menu-lemon.jpg",
      "/images/menu-caramel.jpg",
    ],
    priceLabel: "€26.50",
    badge: "Birthday",
    isPublished: true,
    isAvailable: true,
    boxSize: 12,
    contents: [
      { name: "Pistachio & Rose", qty: 4 },
      { name: "Lemon Poppy Seed", qty: 4 },
      { name: "Brown Butter Caramel", qty: 4 },
    ],
    checkoutItems: [
      { id: "pistachio-rose", qty: 4 },
      { id: "lemon-poppy-seed", qty: 4 },
      { id: "brown-butter-caramel", qty: 4 },
    ],
  },
  {
    slug: "newborn-box",
    type: "seasonal",
    name: "Welcome, Little One",
    tagline: "A sweet welcome for a brand new arrival.",
    description:
      "Celebrate the newest member of the family with a delicate, thoughtfully chosen box of cookies for the new parents to enjoy.",
    details: [
      "12 freshly baked cookies",
      "Soft, comforting flavours",
      "Gift-wrapped with a 'New Arrival' card",
      "Available all year round",
    ],
    coverImage: "/images/gallery-3.jpg",
    images: [
      "/images/gallery-3.jpg",
      "/images/menu-lemon.jpg",
      "/images/menu-pistachio.jpg",
      "/images/menu-choc-chip.jpg",
    ],
    priceLabel: "€26.50",
    badge: "New Arrival",
    isPublished: true,
    isAvailable: true,
    boxSize: 12,
    contents: [
      { name: "Lemon Poppy Seed", qty: 4 },
      { name: "Pistachio & Rose", qty: 4 },
      { name: "Classic Chocolate Chip", qty: 4 },
    ],
    checkoutItems: [
      { id: "lemon-poppy-seed", qty: 4 },
      { id: "pistachio-rose", qty: 4 },
      { id: "classic-chocolate-chip", qty: 4 },
    ],
  },

  // ─── Furry Friends ─────────────────────────────────────────────────────────
  {
    slug: "furry-friends-box",
    type: "seasonal",
    name: "Furry Friends Box",
    tagline: "Because your dog deserves a treat too.",
    description:
      "Handmade dog-friendly cookies crafted with wholesome, dog-safe ingredients — no chocolate, no xylitol, no nasties. Just pure, tail-wagging joy.",
    details: [
      "12 dog-safe, handmade cookies",
      "No chocolate, no xylitol, no artificial sweeteners",
      "Made with wholesome, natural ingredients",
      "Vet-friendly recipe",
    ],
    coverImage: "/images/gallery-5.jpg",
    images: [
      "/images/gallery-5.jpg",
      "/images/gallery-1.jpg",
    ],
    priceLabel: "€22.00",
    badge: "For Dogs",
    isPublished: true,
    isAvailable: false,
    boxSize: 12,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
