const socials = [
  { label: "Instagram", href: "#" },
  { label: "WhatsApp", href: "#" },
  { label: "Email", href: "#" },
];

const footerLinks = [
  { label: "FAQ", href: "/faq" },
];

export default function Footer() {
  return (
    <footer className="bg-cocoa py-12 text-white/60">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex flex-col items-center gap-6 border-b border-white/10 pb-8 md:flex-row md:justify-between">
          <div>
            <p className="font-display text-xl font-bold text-white">
              Ele&apos;s Cookies
            </p>
            <p className="mt-1 text-sm text-white/50">
              Handmade with love, baked to order.
            </p>
          </div>

          <ul className="flex gap-6">
            {footerLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-sm text-white/50 transition-colors duration-200 hover:text-caramel"
                >
                  {l.label}
                </a>
              </li>
            ))}
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="text-sm text-white/50 transition-colors duration-200 hover:text-caramel"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="pt-8 text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} Ele&apos;s Cookies. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
