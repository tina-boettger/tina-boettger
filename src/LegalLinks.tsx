import type { MouseEvent } from "react";

type LegalLinksProps = {
  variant?: "light" | "dark";
  language?: "de" | "en";
};

function navigateLegal(e: MouseEvent<HTMLAnchorElement>, path: string) {
  e.preventDefault();
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function LegalLinks({ variant = "light", language = "de" }: LegalLinksProps) {
  const classes =
    variant === "dark"
      ? "text-brand-paper/70 hover:text-brand-paper"
      : "text-brand-muted hover:text-brand-green";
  const links =
    language === "de"
      ? [
          { href: "/datenschutz", label: "Datenschutz" },
          { href: "/impressum", label: "Impressum" },
        ]
      : [
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/legal-notice", label: "Legal Notice" },
        ];

  return (
    <nav className={`flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.05em] ${classes}`}>
      {links.map((link) => (
        <a key={link.href} href={link.href} onClick={(e) => navigateLegal(e, link.href)} className="transition-colors">
          {link.label}
        </a>
      ))}
    </nav>
  );
}
