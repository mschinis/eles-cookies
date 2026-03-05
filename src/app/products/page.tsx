import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderTrigger from "@/components/OrderTrigger";
import { products } from "@/data/products";

const customBox = products.find((p) => p.type === "custom" && p.isPublished)!;
const curatedBoxes = products.filter((p) => p.type === "seasonal" && p.isPublished);

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-24">
        {/* Header */}
        <div className="mx-auto max-w-5xl px-8 pb-16 pt-12 text-center">
          <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-caramel">
            Our Shop
          </span>
          <h1 className="font-display text-5xl font-bold text-cocoa md:text-6xl">
            Every box, made with love.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-cocoa/60">
            Choose a curated box for every occasion, or build your own perfect
            mix from scratch.
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-8 pb-32">
          {/* Make Your Own — featured card */}
          <div className="mb-20 overflow-hidden rounded-3xl bg-cocoa shadow-xl">
            <div className="flex flex-col md:flex-row">
              <div className="relative aspect-[4/3] w-full md:aspect-auto md:w-1/2">
                <Image
                  src={customBox.coverImage}
                  alt={customBox.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-cocoa/20" />
              </div>
              <div className="flex flex-1 flex-col justify-center p-10 md:p-14">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-caramel">
                  Most popular
                </span>
                <h2 className="mb-3 font-display text-3xl font-bold text-white md:text-4xl">
                  {customBox.name}
                </h2>
                <p className="mb-4 text-sm font-semibold text-caramel">
                  {customBox.priceLabel}
                </p>
                <p className="mb-8 text-base leading-relaxed text-white/70">
                  {customBox.description}
                </p>
                <ul className="mb-10 space-y-2">
                  {customBox.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="mt-0.5 shrink-0 text-caramel">✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-4">
                  <OrderTrigger
                    label="Build your box"
                    className="items-center justify-center rounded-full bg-caramel px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-caramel/90"
                  />
                  <Link
                    href={`/products/${customBox.slug}`}
                    className="flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Curated collections */}
          <div>
            <div className="mb-10">
              <span className="mb-2 block text-sm font-medium uppercase tracking-widest text-caramel">
                Curated Collections
              </span>
              <h2 className="font-display text-3xl font-bold text-cocoa">
                A box for every occasion
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {curatedBoxes.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.coverImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {product.badge && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-cocoa backdrop-blur-sm">
                        {product.badge}
                      </span>
                    )}
                    {!product.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-cocoa/40">
                        <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-cocoa">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="mb-1 font-display text-lg font-semibold text-cocoa">
                      {product.name}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-xs text-cocoa/50">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-caramel">
                        {product.priceLabel}
                      </span>
                      {product.boxSize && (
                        <span className="text-xs text-cocoa/40">
                          {product.boxSize} cookies
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
