import { Heart, Leaf, Sparkles, Sprout, UserRound, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { generateInsight } from "../lib/insightEngine";
import { getWords, loadPrintableSummary, PRINT_CATEGORIES, type PrintCategory, type PrintSummaryState } from "../lib/printSummary";
import { translations } from "../lib/translations";
import { getStructuredData, usePageSeo } from "../../lib/seo";

const CATEGORY_COLORS: Record<PrintCategory, string> = {
  energy: "#2d6a3f",
  strengths: "#a5752a",
  impact: "#3f7656",
  recognition: "#a45f4b",
  environment: "#756c60",
};

const CATEGORY_ICONS = {
  energy: Zap,
  strengths: Sparkles,
  impact: Leaf,
  recognition: Heart,
  environment: Sprout,
};

const POSITIVE_ENVIRONMENT_KEYS = ["clear tasks", "flexible time", "sensory quiet", "autonomy", "predictable routine", "helpful feedback", "enough rest"];
const NEGATIVE_ENVIRONMENT_KEYS = ["too much noise", "unclear priorities", "many switches", "long meetings", "social pressure", "micro interruptions", "too many surprises", "body fatigue"];

const copy = {
  en: {
    eyebrow: "Reflection",
    title: "Inner Compass",
    introTitle: "Human-first AI begins with human clarity.",
    intro:
      "The Inner Compass is a short reflection designed to make your human layer visible before technology starts to assist, optimize, or automate.",
    suggestionsTitle: "What your map suggests",
    whyTitle: "Why it matters for human-first AI",
    why:
      "AI can accelerate planning, writing, analysis, communication, and execution. But acceleration without direction can create noise instead of clarity. A human-first approach starts before the tool. It asks what matters to the human, what kind of support is actually useful, and what technology should amplify. This map helps you use AI as support for your own direction, instead of letting the system define it for you.",
    noWords: "No words selected yet",
    printButton: "Print or save PDF",
    footerNote: "© Tina Böttger · tina-boettger.com · Impressum: tina-boettger.com/impressum",
    footerPrivacy: "Your information stays on your device unless you choose to share it.",
  },
  de: {
    eyebrow: "Reflexion",
    title: "Inner Compass",
    introTitle: "Human-first AI beginnt mit menschlicher Klarheit.",
    intro:
      "Der Inner Compass ist eine kurze Reflexion, die sichtbar macht, was dich als Mensch ausrichtet, bevor Technologie unterstützt, optimiert oder automatisiert.",
    suggestionsTitle: "Was deine Karte nahelegt",
    whyTitle: "Warum das für Human-First AI wichtig ist",
    why:
      "KI kann Planung, Schreiben, Analyse, Kommunikation und Umsetzung beschleunigen. Aber Beschleunigung ohne Richtung erzeugt schnell mehr Rauschen als Klarheit. Ein Human-First-Ansatz beginnt vor dem Tool. Er fragt, was für den Menschen wichtig ist, welche Unterstützung wirklich hilfreich ist und was Technologie verstärken soll. Diese Karte hilft dir, KI als Unterstützung für deine eigene Richtung zu nutzen, statt dich vom System definieren zu lassen.",
    noWords: "Noch keine Wörter ausgewählt",
    printButton: "Drucken oder PDF speichern",
    footerNote: "© Tina Böttger · tina-boettger.com · Impressum: tina-boettger.com/impressum",
    footerPrivacy: "Deine Informationen bleiben auf deinem Gerät, solange du sie nicht teilst.",
  },
};

function Pill({ children }: { children: string; key?: string }) {
  return <span className="ic-print-pill">{children}</span>;
}

function CompassMark({ className = "" }: { className?: string }) {
  return (
    <div className={`ic-print-compass ${className}`} aria-hidden="true">
      <div className="ic-print-compass-star" />
      <span className="ic-dot ic-dot-top" />
      <span className="ic-dot ic-dot-right" />
      <span className="ic-dot ic-dot-bottom" />
      <span className="ic-dot ic-dot-left" />
    </div>
  );
}

function CategoryCard({
  category,
  explainer,
  environmentFit,
  environmentFitLabel,
  label,
  words,
  noWords,
}: {
  key?: string;
  category: PrintCategory;
  explainer: string;
  environmentFit?: { filledSegments: number; fit: "low" | "medium" | "high" };
  environmentFitLabel?: string;
  label: string;
  words: string[];
  noWords: string;
}) {
  const Icon = CATEGORY_ICONS[category];

  return (
    <article className={`ic-category-card ic-category-card--${category}`} style={{ "--category-color": CATEGORY_COLORS[category] } as CSSProperties}>
      <div className="ic-category-heading">
        <Icon className="ic-category-icon" strokeWidth={1.45} />
        <div>
          <h2>{label}</h2>
          <p>{explainer}</p>
        </div>
      </div>
      <div className="ic-pill-row">
        {words.length ? words.map((word) => <Pill key={word}>{word}</Pill>) : <Pill>{noWords}</Pill>}
      </div>
      {category === "environment" && environmentFit && environmentFitLabel ? (
        <div className={`ic-inline-fit ic-inline-fit--${environmentFit.fit}`}>
          <div className="ic-fit-scale" aria-label={environmentFitLabel}>
            <span>{translations.en.map.lowFit}</span>
            <div className="ic-fit-bar">
              {Array.from({ length: 7 }).map((_, index) => (
                <i key={index} className={index < environmentFit.filledSegments ? "is-filled" : ""} />
              ))}
            </div>
            <span>{translations.en.map.highFit}</span>
          </div>
          <div className="ic-fit-label">{environmentFitLabel}</div>
        </div>
      ) : null}
    </article>
  );
}

function getEnvironmentFit(data: PrintSummaryState["data"]) {
  const lookup = Object.entries(translations.en.words.environment).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[value] = key;
    acc[key] = key;
    return acc;
  }, {});

  const rawWords = [...data.environment.selected, data.environment.custom].filter(Boolean);
  const score = rawWords.reduce((total, word) => {
    const key = lookup[word] ?? word;
    if (POSITIVE_ENVIRONMENT_KEYS.includes(key)) return total + 1;
    if (NEGATIVE_ENVIRONMENT_KEYS.includes(key)) return total - 1;
    return total;
  }, 0);

  const fit = score < 0 ? "low" : score <= 1 ? "medium" : "high";
  return {
    fit,
    filledSegments: fit === "low" ? 2 : fit === "medium" ? 4 : 6,
    words: rawWords,
  };
}

export default function PrintSummaryPage() {
  const [summary] = useState<PrintSummaryState>(() => loadPrintableSummary());
  const t = translations[summary.language];
  const c = copy[summary.language];
  const insight = useMemo(() => generateInsight(summary.data, summary.language), [summary.data, summary.language]);
  const environmentFit = useMemo(() => getEnvironmentFit(summary.data), [summary.data]);
  const environmentFitLabel =
    environmentFit.fit === "low" ? t.map.lowFitLabel : environmentFit.fit === "medium" ? t.map.mediumFitLabel : t.map.highFitLabel;

  usePageSeo({
    title: `${c.title} Printable Summary | Tina Boettger`,
    description: "Printable Inner Compass reflection summary generated locally in the browser.",
    path: "/print-summary",
    jsonLd: getStructuredData("/print-summary"),
  });

  useEffect(() => {
    document.body.classList.add("is-print-summary");
    document.documentElement.classList.add("is-print-summary");

    return () => {
      document.body.classList.remove("is-print-summary");
      document.documentElement.classList.remove("is-print-summary");
    };
  }, []);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("print")) {
      return;
    }

    // Printing immediately after navigation can produce a blank page in some browsers.
    // Waiting for React paint and web fonts gives the printable artifact time to exist.
    const printWhenReady = async () => {
      await document.fonts?.ready;
      window.setTimeout(() => window.print(), 350);
    };
    printWhenReady();
  }, []);

  const categoryRows = PRINT_CATEGORIES.map((category) => ({
    key: category,
    label: t.review.labels[category],
    explainer:
      category === "energy"
        ? t.map.energyExplainer
        : category === "strengths"
          ? t.map.strengthsExplainer
          : category === "impact"
            ? t.map.impactExplainer
            : category === "recognition"
              ? t.map.recognitionExplainer
              : t.map.environmentExplainer,
    words: getWords(summary.data, category),
  }));

  return (
    <main className="ic-print-shell">
      <style>{printStyles}</style>
      <button className="ic-print-action no-print" onClick={() => window.print()}>{c.printButton}</button>
      <section className="ic-print-page">
        <header className="ic-print-header">
          <div>
            <div className="ic-print-eyebrow">
              <span />
              {c.eyebrow}
            </div>
            <h1>{c.title}</h1>
            <p>
              <strong>{c.introTitle}</strong>
              <br />
              {c.intro}
            </p>
          </div>
          <CompassMark className="ic-print-header-mark" />
        </header>

        <div className="ic-print-content">
          <section className="ic-category-grid" aria-label={c.title}>
            {categoryRows.map((row) => (
              <CategoryCard
                key={row.key}
                category={row.key}
                label={row.label}
                explainer={row.explainer}
                words={row.words}
                noWords={c.noWords}
                environmentFit={row.key === "environment" ? environmentFit : undefined}
                environmentFitLabel={row.key === "environment" ? environmentFitLabel : undefined}
              />
            ))}
          </section>

          <section className="ic-insight-card">
            <div className="ic-section-heading">
              <div className="ic-section-icon ic-section-icon--filled">
                <Sparkles strokeWidth={1.4} />
              </div>
              <h2>{c.suggestionsTitle}</h2>
            </div>
            <p>{insight}</p>
          </section>

          <section className="ic-why-card">
            <div className="ic-section-heading">
              <div className="ic-section-icon">
                <UserRound strokeWidth={1.4} />
              </div>
              <h2>{c.whyTitle}</h2>
            </div>
            <p>{c.why}</p>
          </section>
        </div>

        <footer className="ic-print-footer">
          <CompassMark />
          <div>
            <p>{c.footerNote}</p>
            <span>{c.footerPrivacy}</span>
          </div>
        </footer>
      </section>
    </main>
  );
}

const printStyles = `
  :root {
    --paper: #f8f6ef;
    --paper-2: #fffdf8;
    --ink: #1f1f1d;
    --muted: #6f706b;
    --green: #2d5a27;
    --line: rgba(31, 31, 29, 0.15);
  }

  body.is-print-summary {
    margin: 0;
    background: #e7e3da;
    color: var(--ink);
  }

  .ic-print-shell {
    min-height: 100vh;
    padding: 24px;
    background: radial-gradient(circle at 10% 0%, rgba(45, 90, 39, 0.08), transparent 35%), #e7e3da;
    font-family: "Inter", "Aptos", Arial, sans-serif;
  }

  .ic-print-action {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 20;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--paper-2);
    color: var(--ink);
    padding: 12px 16px;
    font: 700 11px/1 "Inter", Arial, sans-serif;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .ic-print-page {
    display: flex;
    flex-direction: column;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 15mm 18mm 13mm;
    background:
      radial-gradient(circle at 78% 8%, rgba(45, 90, 39, 0.08), transparent 28%),
      linear-gradient(180deg, rgba(255,255,255,0.72), rgba(248,246,239,0.98)),
      var(--paper);
    box-shadow: 0 16px 44px rgba(31, 31, 29, 0.22);
  }

  .ic-print-content {
    flex: 1 1 auto;
  }

  .ic-print-header {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 24px;
    align-items: start;
    border-bottom: 1px solid rgba(45, 90, 39, 0.4);
    padding-bottom: 18px;
    margin-bottom: 22px;
  }

  .ic-print-eyebrow {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    color: var(--green);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .ic-print-eyebrow span {
    width: 34px;
    height: 1px;
    background: var(--green);
  }

  .ic-print-header h1 {
    margin: 0 0 18px;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 56px;
    font-weight: 500;
    line-height: 0.98;
    letter-spacing: -0.045em;
  }

  .ic-print-header p {
    max-width: 560px;
    margin: 0;
    color: var(--ink);
    font-size: 15px;
    line-height: 1.45;
  }

  .ic-print-header strong {
    font-weight: 500;
  }

  .ic-print-compass {
    position: relative;
    width: 62px;
    height: 62px;
    border: 1px dotted rgba(45, 90, 39, 0.55);
    border-radius: 999px;
    background: rgba(255, 253, 248, 0.45);
  }

  .ic-print-header-mark {
    margin-top: 4px;
    margin-right: 4px;
  }

  .ic-print-compass-star {
    position: absolute;
    inset: 10px;
    background: var(--green);
    clip-path: polygon(50% 0, 58% 38%, 100% 50%, 58% 62%, 50% 100%, 42% 62%, 0 50%, 42% 38%);
    opacity: 0.9;
  }

  .ic-dot {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: var(--green);
  }

  .ic-dot-top { left: 50%; top: -8px; transform: translateX(-50%); }
  .ic-dot-right { right: -8px; top: 50%; transform: translateY(-50%); }
  .ic-dot-bottom { left: 50%; bottom: -8px; transform: translateX(-50%); }
  .ic-dot-left { left: -8px; top: 50%; transform: translateY(-50%); }

  .ic-category-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 16px;
    margin-bottom: 10px;
  }

  .ic-category-card {
    --category-color: var(--green);
    min-height: 98px;
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 13px 16px;
    background: rgba(255, 253, 248, 0.56);
    box-sizing: border-box;
  }

  .ic-category-card--environment {
    grid-column: 1 / -1;
  }

  .ic-category-heading {
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 10px;
    align-items: start;
    margin-bottom: 8px;
  }

  .ic-category-icon {
    width: 25px;
    height: 25px;
    color: var(--category-color);
  }

  .ic-category-card h2,
  .ic-insight-card h2,
  .ic-why-card h2 {
    margin: 0;
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 500;
    line-height: 1.05;
  }

  .ic-category-card h2 {
    color: var(--category-color);
    font-size: 24px;
  }

  .ic-category-card p {
    margin: 5px 0 0;
    color: var(--ink);
    font-size: 10.8px;
    line-height: 1.25;
  }

  .ic-pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    padding-left: 0;
  }

  .ic-print-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 58px;
    border: 1px solid var(--category-color, var(--line));
    border-radius: 999px;
    background: rgba(255, 253, 248, 0.86);
    color: var(--ink);
    padding: 4px 11px;
    font-size: 10.5px;
    font-weight: 700;
    line-height: 1.1;
    box-shadow: 0 2px 8px rgba(31,31,29,0.04);
  }

  .ic-inline-fit {
    margin-top: 9px;
    padding-top: 9px;
    border-top: 1px solid rgba(31, 31, 29, 0.08);
  }

  .ic-fit-scale {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
    margin-bottom: 7px;
  }

  .ic-fit-scale span {
    color: var(--muted);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .ic-fit-bar {
    display: flex;
    height: 7px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(31, 31, 29, 0.06);
  }

  .ic-fit-bar i {
    flex: 1;
    border-right: 1px solid rgba(248, 246, 239, 0.8);
  }

  .ic-fit-bar i:last-child {
    border-right: 0;
  }

  .ic-fit-bar i.is-filled {
    background: var(--green);
  }

  .ic-fit-label {
    display: inline-flex;
    border: 1px solid var(--green);
    border-radius: 4px;
    color: var(--green);
    padding: 4px 10px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
    line-height: 1;
    text-transform: uppercase;
  }

  .ic-inline-fit--low .ic-fit-label {
    border-color: #c64232;
    color: #c64232;
  }

  .ic-inline-fit--medium .ic-fit-label {
    border-color: rgba(31, 31, 29, 0.52);
    color: var(--ink);
  }

  .ic-insight-card,
  .ic-why-card {
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 14px 18px;
  }

  .ic-insight-card {
    margin-bottom: 10px;
    background: rgba(45, 90, 39, 0.05);
  }

  .ic-why-card {
    border-color: transparent;
    padding-top: 0;
    padding-bottom: 0;
    margin-bottom: 10px;
  }

  .ic-section-heading {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 7px;
  }

  .ic-section-icon {
    width: 36px;
    height: 36px;
    border: 1px solid var(--green);
    border-radius: 999px;
    color: var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ic-section-icon--filled {
    background: var(--green);
    color: var(--paper);
  }

  .ic-section-icon svg {
    width: 21px;
    height: 21px;
  }

  .ic-insight-card h2,
  .ic-why-card h2 {
    color: var(--green);
    font-size: 21px;
  }

  .ic-insight-card p,
  .ic-why-card p {
    margin: 0;
    color: var(--ink);
    font-size: 11px;
    line-height: 1.35;
  }

  .ic-print-footer {
    display: flex;
    gap: 10px;
    align-items: center;
    border-top: 1px solid rgba(45, 90, 39, 0.4);
    margin-top: auto;
    padding-top: 8px;
    flex: 0 0 auto;
  }

  .ic-print-footer .ic-print-compass {
    width: 30px;
    height: 30px;
    flex: 0 0 auto;
  }

  .ic-print-footer .ic-print-compass-star {
    inset: 6px;
  }

  .ic-print-footer .ic-dot {
    width: 3px;
    height: 3px;
  }

  .ic-print-footer p {
    margin: 0 0 2px;
    color: var(--green);
    font-family: "Playfair Display", Georgia, serif;
    font-size: 11.5px;
  }

  .ic-print-footer span {
    display: block;
    color: var(--muted);
    font-size: 9.5px;
    line-height: 1.25;
  }

  @page {
    size: A4 portrait;
    margin: 0;
  }

  @media print {
    html.is-print-summary,
    body.is-print-summary {
      width: 210mm;
      min-height: 297mm;
      background: var(--paper);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print {
      display: none !important;
    }

    .ic-print-shell {
      padding: 0;
      background: var(--paper);
    }

    .ic-print-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      box-shadow: none;
    }
  }
`;
