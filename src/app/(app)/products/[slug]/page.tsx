import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderTrigger from "@/components/OrderTrigger";
import SeasonalCheckoutButton from "@/components/SeasonalCheckoutButton";
import ImageGallery from "./ImageGallery";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Product, Media, Cooky } from "@/payload-types";

export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

async function getProduct(slug: string): Promise<Product | null> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "products",
    where: { slug: { equals: slug }, isPublished: { equals: true } },
    depth: 2,
    limit: 1,
  });
  return (result.docs[0] as Product) ?? null;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const imageUrls = (product.images ?? []).map(
    (item) => (item.image as Media).url ?? ""
  );
  const details = (product.details ?? []).map((d) => d.text);
  const contents = (product.contents ?? []).map((item) => ({
    cookie: item.cookie as Cooky,
    qty: item.qty,
  }));
  const checkoutItems = contents.map((item) => ({
    id: item.cookie.slug,
    qty: item.qty ?? 0,
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-24">
        <div className="mx-auto max-w-5xl px-8 py-12">
          {/* Back link */}
          <Link
            href="/products"
            className="mb-10 inline-flex items-center gap-2 text-sm text-cocoa/50 transition-colors hover:text-cocoa"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All products
          </Link>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Gallery */}
            <ImageGallery images={imageUrls} name={product.name} />

            {/* Info */}
            <div className="flex flex-col">
              {product.badge && (
                <span className="mb-4 inline-block self-start rounded-full bg-caramel/15 px-3 py-1 text-xs font-semibold text-caramel">
                  {product.badge}
                </span>
              )}

              <h1 className="mb-2 font-display text-4xl font-bold text-cocoa">
                {product.name}
              </h1>
              <p className="mb-4 text-base text-cocoa/60">{product.tagline}</p>

              <p className="mb-6 text-2xl font-semibold text-caramel">
                {product.priceLabel}
              </p>

              <p className="mb-8 text-sm leading-relaxed text-cocoa/70">
                {product.description}
              </p>

              {/* Details */}
              <ul className="mb-8 space-y-2 border-t border-sand pt-6">
                {details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-cocoa/70">
                    <span className="mt-0.5 shrink-0 text-caramel">✓</span>
                    {d}
                  </li>
                ))}
              </ul>

              {/* Contents */}
              {contents.length > 0 && (
                <div className="mb-8 rounded-2xl bg-sand/30 p-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-caramel">
                    What&apos;s inside
                  </p>
                  <ul className="space-y-2">
                    {contents.map((item) => (
                      <li key={item.cookie.id} className="flex items-center justify-between text-sm">
                        <span className="text-cocoa">{item.cookie.name}</span>
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-cocoa/60">
                          × {item.qty}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col gap-3 sm:flex-row">
                {product.type === "custom" ? (
                  <OrderTrigger
                    label="Build your box"
                    className="flex-1 items-center justify-center rounded-full bg-caramel px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-caramel/90"
                  />
                ) : product.isAvailable && checkoutItems.length > 0 ? (
                  <SeasonalCheckoutButton
                    product={{
                      name: product.name,
                      priceLabel: product.priceLabel,
                      boxSize: product.boxSize,
                      checkoutItems,
                    }}
                  />
                ) : product.isAvailable ? (
                  <a
                    href={`mailto:hello@elescookies.com?subject=Order%20enquiry%20%E2%80%94%20${encodeURIComponent(product.name)}`}
                    className="flex flex-1 items-center justify-center rounded-full bg-caramel px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-caramel/90"
                  >
                    Enquire to order
                  </a>
                ) : (
                  <a
                    href={`mailto:hello@elescookies.com?subject=Waitlist%20%E2%80%94%20${encodeURIComponent(product.name)}`}
                    className="flex flex-1 items-center justify-center rounded-full bg-sand px-8 py-4 text-sm font-semibold text-cocoa transition-colors hover:bg-sand/80"
                  >
                    Join the waitlist
                  </a>
                )}

                <Link
                  href="/products"
                  className="flex flex-1 items-center justify-center rounded-full border border-sand px-8 py-4 text-sm font-semibold text-cocoa transition-colors hover:border-cocoa/20 hover:bg-cocoa/5"
                >
                  See all boxes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
