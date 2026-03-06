/**
 * Backfill script — adds ingredients, allergens, mayContain, and
 * nutritionPerCookie to all existing product documents.
 *
 * Run with:  npm run backfill:product-info
 */
import { getPayload } from "payload";
import config from "../../payload.config";

// ─── Per-flavour nutrition (per single cookie, approximate) ──────────────────

const nutrition = {
  classicChocolateChip:  { calories: 210, fat: 10,   saturatedFat: 6,   carbohydrates: 27, sugars: 17, protein: 2.5, salt: 0.3  },
  brownButterCaramel:    { calories: 220, fat: 11,   saturatedFat: 6.5, carbohydrates: 28, sugars: 18, protein: 2,   salt: 0.35 },
  espressoDarkChocolate: { calories: 215, fat: 11,   saturatedFat: 6,   carbohydrates: 26, sugars: 15, protein: 3,   salt: 0.3  },
  lemonPoppySeed:        { calories: 185, fat: 9,    saturatedFat: 5,   carbohydrates: 24, sugars: 14, protein: 2.5, salt: 0.25 },
  pistachioRose:         { calories: 200, fat: 10.5, saturatedFat: 5.5, carbohydrates: 24, sugars: 15, protein: 3,   salt: 0.25 },
  peanutButterPretzel:   { calories: 230, fat: 13,   saturatedFat: 5,   carbohydrates: 25, sugars: 14, protein: 5,   salt: 0.5  },
};

type NutritionKey = keyof typeof nutrition;
type NutritionValues = (typeof nutrition)[NutritionKey];

function avg(items: { key: NutritionKey; qty: number }[]): NutritionValues {
  const total = items.reduce((s, i) => s + i.qty, 0);
  const keys: (keyof NutritionValues)[] = ["calories", "fat", "saturatedFat", "carbohydrates", "sugars", "protein", "salt"];
  const result = {} as NutritionValues;
  for (const k of keys) {
    const weighted = items.reduce((s, i) => s + nutrition[i.key][k] * i.qty, 0);
    result[k] = Math.round((weighted / total) * 10) / 10;
  }
  return result;
}

// ─── Per-flavour ingredients / allergens ─────────────────────────────────────

const info = {
  classicChocolateChip: {
    ingredients: "Wheat flour, butter, caster sugar, soft brown sugar, free-range eggs, milk chocolate chips (sugar, cocoa mass, cocoa butter, milk powder, emulsifier: soya lecithin, vanilla extract), vanilla extract, baking soda, sea salt",
    allergens: "Gluten (wheat flour), Dairy (butter, milk chocolate), Eggs, Soy (soya lecithin in chocolate)",
  },
  brownButterCaramel: {
    ingredients: "Wheat flour, brown butter, caster sugar, soft brown sugar, salted caramel (sugar, double cream, butter, sea salt), free-range eggs, vanilla extract, baking soda, sea salt",
    allergens: "Gluten (wheat flour), Dairy (butter, cream), Eggs",
  },
  espressoDarkChocolate: {
    ingredients: "Wheat flour, butter, caster sugar, soft brown sugar, dark chocolate chips (min. 70% cocoa — cocoa mass, sugar, cocoa butter, emulsifier: soya lecithin, vanilla extract), espresso powder, free-range eggs, vanilla extract, baking soda, sea salt",
    allergens: "Gluten (wheat flour), Dairy (butter), Eggs, Soy (soya lecithin in chocolate)",
  },
  lemonPoppySeed: {
    ingredients: "Wheat flour, butter, caster sugar, free-range eggs, fresh lemon zest, lemon juice, poppy seeds, vanilla extract, baking powder, sea salt",
    allergens: "Gluten (wheat flour), Dairy (butter), Eggs",
  },
  pistachioRose: {
    ingredients: "Wheat flour, butter, caster sugar, free-range eggs, roasted pistachios, rose water, vanilla extract, baking soda, sea salt",
    allergens: "Gluten (wheat flour), Dairy (butter), Eggs, Tree nuts (pistachios)",
  },
  peanutButterPretzel: {
    ingredients: "Wheat flour, peanut butter (peanuts, salt), butter, caster sugar, soft brown sugar, free-range eggs, pretzel pieces (wheat flour, salt), vanilla extract, baking soda, sea salt",
    allergens: "Gluten (wheat flour), Dairy (butter), Eggs, Peanuts",
  },
};

const DEFAULT_MAY_CONTAIN = "Tree nuts, Peanuts, Sesame, Soy — all cookies are baked in the same kitchen";

// Combine unique ingredients from multiple flavours
function combineIngredients(flavours: (keyof typeof info)[]): string {
  const seen = new Set<string>();
  const combined: string[] = [];
  for (const f of flavours) {
    for (const part of info[f].ingredients.split(", ")) {
      const key = part.toLowerCase().replace(/\(.*?\)/g, "").trim();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(part);
      }
    }
  }
  return combined.join(", ");
}

// Union of allergen strings
function combineAllergens(flavours: (keyof typeof info)[]): string {
  const parts = new Set<string>();
  for (const f of flavours) {
    for (const part of info[f].allergens.split(", ")) {
      parts.add(part.split(" (")[0]); // normalise to base allergen
    }
  }
  // Rebuild with details from first matching flavour that mentions each allergen
  const detailed: string[] = [];
  for (const allergen of parts) {
    for (const f of flavours) {
      const match = info[f].allergens.split(", ").find((a) => a.startsWith(allergen));
      if (match) { detailed.push(match); break; }
    }
  }
  return detailed.join(", ");
}

// ─── Product definitions ──────────────────────────────────────────────────────

type ProductInfo = {
  ingredients: string;
  allergens: string;
  mayContain: string;
  nutritionPerCookie: NutritionValues;
};

const productData: Record<string, ProductInfo> = {
  "make-your-own": {
    ingredients: "Ingredients vary by flavour selection. All cookies are made with: wheat flour, butter, caster sugar, free-range eggs, vanilla extract, baking soda or baking powder, sea salt. Additional ingredients per flavour include: milk chocolate chips, dark chocolate chips, salted caramel, espresso powder, lemon zest, poppy seeds, roasted pistachios, rose water, peanut butter, pretzel pieces.",
    allergens: "Gluten (wheat flour), Dairy (butter), Eggs. Additional allergens depending on flavour: Tree nuts (pistachios — Pistachio & Rose), Peanuts (Peanut Butter Pretzel), Soy (soya lecithin in chocolate chips)",
    mayContain: DEFAULT_MAY_CONTAIN,
    nutritionPerCookie: avg([
      { key: "classicChocolateChip", qty: 1 },
      { key: "brownButterCaramel", qty: 1 },
      { key: "espressoDarkChocolate", qty: 1 },
      { key: "lemonPoppySeed", qty: 1 },
      { key: "pistachioRose", qty: 1 },
      { key: "peanutButterPretzel", qty: 1 },
    ]),
  },

  "valentines-collection": {
    // Brown Butter Caramel ×4, Pistachio & Rose ×4, Classic Chocolate Chip ×4
    ingredients: combineIngredients(["brownButterCaramel", "pistachioRose", "classicChocolateChip"]),
    allergens: combineAllergens(["brownButterCaramel", "pistachioRose", "classicChocolateChip"]),
    mayContain: DEFAULT_MAY_CONTAIN,
    nutritionPerCookie: avg([
      { key: "brownButterCaramel", qty: 4 },
      { key: "pistachioRose", qty: 4 },
      { key: "classicChocolateChip", qty: 4 },
    ]),
  },

  "easter-basket": {
    // Lemon Poppy Seed ×4, Pistachio & Rose ×4, Brown Butter Caramel ×4
    ingredients: combineIngredients(["lemonPoppySeed", "pistachioRose", "brownButterCaramel"]),
    allergens: combineAllergens(["lemonPoppySeed", "pistachioRose", "brownButterCaramel"]),
    mayContain: DEFAULT_MAY_CONTAIN,
    nutritionPerCookie: avg([
      { key: "lemonPoppySeed", qty: 4 },
      { key: "pistachioRose", qty: 4 },
      { key: "brownButterCaramel", qty: 4 },
    ]),
  },

  "coffee-lovers-box": {
    // Espresso Dark Chocolate ×8, Brown Butter Caramel ×4
    ingredients: combineIngredients(["espressoDarkChocolate", "brownButterCaramel"]),
    allergens: combineAllergens(["espressoDarkChocolate", "brownButterCaramel"]),
    mayContain: DEFAULT_MAY_CONTAIN,
    nutritionPerCookie: avg([
      { key: "espressoDarkChocolate", qty: 8 },
      { key: "brownButterCaramel", qty: 4 },
    ]),
  },

  "classic-collection": {
    // All 6 flavours ×4 each
    ingredients: combineIngredients(["classicChocolateChip", "brownButterCaramel", "espressoDarkChocolate", "lemonPoppySeed", "pistachioRose", "peanutButterPretzel"]),
    allergens: combineAllergens(["classicChocolateChip", "brownButterCaramel", "espressoDarkChocolate", "lemonPoppySeed", "pistachioRose", "peanutButterPretzel"]),
    mayContain: DEFAULT_MAY_CONTAIN,
    nutritionPerCookie: avg([
      { key: "classicChocolateChip", qty: 4 },
      { key: "brownButterCaramel", qty: 4 },
      { key: "espressoDarkChocolate", qty: 4 },
      { key: "lemonPoppySeed", qty: 4 },
      { key: "pistachioRose", qty: 4 },
      { key: "peanutButterPretzel", qty: 4 },
    ]),
  },

  "christmas-box": {
    // Espresso ×4, Brown Butter Caramel ×4, Peanut Butter Pretzel ×4
    ingredients: combineIngredients(["espressoDarkChocolate", "brownButterCaramel", "peanutButterPretzel"]),
    allergens: combineAllergens(["espressoDarkChocolate", "brownButterCaramel", "peanutButterPretzel"]),
    mayContain: DEFAULT_MAY_CONTAIN,
    nutritionPerCookie: avg([
      { key: "espressoDarkChocolate", qty: 4 },
      { key: "brownButterCaramel", qty: 4 },
      { key: "peanutButterPretzel", qty: 4 },
    ]),
  },

  "birthday-for-him": {
    // Peanut Butter Pretzel ×4, Espresso ×4, Brown Butter Caramel ×4
    ingredients: combineIngredients(["peanutButterPretzel", "espressoDarkChocolate", "brownButterCaramel"]),
    allergens: combineAllergens(["peanutButterPretzel", "espressoDarkChocolate", "brownButterCaramel"]),
    mayContain: DEFAULT_MAY_CONTAIN,
    nutritionPerCookie: avg([
      { key: "peanutButterPretzel", qty: 4 },
      { key: "espressoDarkChocolate", qty: 4 },
      { key: "brownButterCaramel", qty: 4 },
    ]),
  },

  "birthday-for-her": {
    // Pistachio & Rose ×4, Lemon Poppy Seed ×4, Brown Butter Caramel ×4
    ingredients: combineIngredients(["pistachioRose", "lemonPoppySeed", "brownButterCaramel"]),
    allergens: combineAllergens(["pistachioRose", "lemonPoppySeed", "brownButterCaramel"]),
    mayContain: DEFAULT_MAY_CONTAIN,
    nutritionPerCookie: avg([
      { key: "pistachioRose", qty: 4 },
      { key: "lemonPoppySeed", qty: 4 },
      { key: "brownButterCaramel", qty: 4 },
    ]),
  },

  "newborn-box": {
    // Lemon Poppy Seed ×4, Pistachio & Rose ×4, Classic Chocolate Chip ×4
    ingredients: combineIngredients(["lemonPoppySeed", "pistachioRose", "classicChocolateChip"]),
    allergens: combineAllergens(["lemonPoppySeed", "pistachioRose", "classicChocolateChip"]),
    mayContain: DEFAULT_MAY_CONTAIN,
    nutritionPerCookie: avg([
      { key: "lemonPoppySeed", qty: 4 },
      { key: "pistachioRose", qty: 4 },
      { key: "classicChocolateChip", qty: 4 },
    ]),
  },

  "furry-friends-box": {
    ingredients: "Oat flour, natural peanut butter (peanuts, salt — xylitol-free), ripe banana, free-range eggs, honey, baking powder",
    allergens: "Eggs, Peanuts",
    mayContain: "Gluten — made in a kitchen that also handles wheat flour",
    nutritionPerCookie: { calories: 65, fat: 2.5, saturatedFat: 0.5, carbohydrates: 8, sugars: 3, protein: 2.5, salt: 0.1 },
  },
};

// ─── Runner ───────────────────────────────────────────────────────────────────

async function run() {
  const payload = await getPayload({ config });

  for (const [slug, data] of Object.entries(productData)) {
    const found = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    const doc = found.docs[0];
    if (!doc) {
      console.warn(`  ⚠ Not found: ${slug}`);
      continue;
    }

    await payload.update({
      collection: "products",
      id: doc.id,
      data: {
        ingredients: data.ingredients,
        allergens: data.allergens,
        mayContain: data.mayContain,
        nutritionPerCookie: data.nutritionPerCookie,
      },
    });

    console.log(`  ✓ ${slug}`);
  }

  console.log("\nBackfill complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
