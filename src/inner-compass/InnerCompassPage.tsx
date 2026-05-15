import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import LegalLinks from "../LegalLinks";
import Toaster from "./components/Toaster";
import ReflectionFlow from "./pages/ReflectionFlow";
import { navigateToAppPath } from "../lib/routing";
import { SITE_URL, buildPersonSchema, buildWebsiteSchema, usePageSeo } from "../lib/seo";

function navigateHome() {
  navigateToAppPath("/");
}

export default function InnerCompassPage() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("is-print-summary");
    body.classList.remove("is-print-summary");
    body.classList.add("is-inner-compass");

    html.style.removeProperty("width");
    body.style.removeProperty("width");
    html.style.removeProperty("min-height");
    body.style.removeProperty("min-height");
    html.style.overflowX = "hidden";
    body.style.overflowX = "hidden";
    html.style.overflowY = "auto";
    body.style.overflowY = "auto";

    return () => {
      body.classList.remove("is-inner-compass");
      html.style.removeProperty("overflow-x");
      body.style.removeProperty("overflow-x");
      html.style.removeProperty("overflow-y");
      body.style.removeProperty("overflow-y");
    };
  }, []);

  usePageSeo({
    title: "Inner Compass | Tina Boettger",
    description:
      "Inner Compass is Tina Boettger's interactive reflection tool for exploring AI leadership style, work patterns, energy, strengths, and environment fit.",
    path: "/inner-compass",
    jsonLd: [
      buildWebsiteSchema(),
      buildPersonSchema(),
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Inner Compass",
        url: `${SITE_URL}/inner-compass`,
        description:
          "Interactive reflection tool by Tina Boettger for exploring AI leadership style, work patterns, and environment fit.",
        applicationCategory: "BusinessApplication",
        creator: {
          "@id": `${SITE_URL}#person`,
        },
      },
    ],
  });

  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
          <button
            onClick={navigateHome}
            className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] shadow-[var(--shadow-soft)] hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </button>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,90,39,0.14),transparent_32%),radial-gradient(circle_at_75%_12%,rgba(28,28,28,0.08),transparent_22%),linear-gradient(180deg,rgba(249,248,244,0.96)_0%,rgba(249,248,244,1)_48%,rgba(245,243,238,1)_100%)]" />
          <p className="sr-only">
            Inner Compass is an interactive reflection tool by Tina Boettger. It helps users reflect on energy, strengths, impact, recognition, and work environment as part of a human-centered AI leadership perspective.
          </p>
          <Toaster />
          <div className="relative z-10">
            <ReflectionFlow />
          </div>
          <footer className="relative z-10 px-6 pb-8">
            <LegalLinks />
          </footer>
        </div>
      </AccessibilityProvider>
    </LanguageProvider>
  );
}
