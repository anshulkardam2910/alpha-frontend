import Link from "next/link";
import { ModeToggle } from "../theme-toggle";
import Image from "next/image";
import { footerLinks, linkHrefs } from "@/utils/constants";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border px-6 py-16 md:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Main footer: brand left, links right */}
        <div className="flex flex-col md:flex-row md:justify-between gap-12 md:gap-20">
          {/* Brand column */}
          <div className="shrink-0 max-w-[280px]">
            <div className="flex items-center gap-3">
              <Image
                src="/alpha.jpg"
                alt="Alpha"
                width={28}
                height={28}
                className="object-contain rounded-sm"
              />
              <span className="font-display font-bold text-foreground text-base tracking-tight">
                Alpha
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mt-4">
              The AI-native GTM platform for modern revenue teams. From
              prospecting to close — unified.
            </p>
            <div className="mt-6">
              <ModeToggle />
            </div>
          </div>

          {/* Links grid — 3 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-20">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="font-display font-semibold text-foreground text-sm mb-4 tracking-tight">
                  {heading}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <Link
                        href={linkHrefs[link]}
                        className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-body text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} Alpha Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/terms"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/sitemap.xml"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
