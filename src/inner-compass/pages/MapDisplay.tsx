import { Download } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
import type { ReflectionData } from "../types/reflection";
import { Button } from "../components/ui/Button";
import { CornerDoodles } from "../components/CornerDoodles";
import { FoxCompanion } from "../components/FoxCompanion";
import { ScreenContainer } from "../components/ScreenContainer";
import { StickyNoteCard } from "../components/StickyNoteCard";
import { cn } from "../lib/utils";

function openPrintableMap(title: string, cards: Array<{ title: string; words: string[] }>, environmentLabel: string, environmentWords: string[], fitLabel: string) {
  const printable = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
  if (!printable) return;

  printable.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; padding: 32px; color: #1c1c1c; }
          h1, h2 { font-family: "Playfair Display", Georgia, serif; }
          .card { border: 1px solid rgba(28,28,28,.12); border-radius: 18px; padding: 20px; margin-bottom: 16px; }
          .pill { display: inline-block; border: 1px solid rgba(28,28,28,.12); border-radius: 999px; padding: 6px 12px; margin: 4px; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${cards.map((card) => `<div class="card"><h2>${card.title}</h2>${card.words.map((word) => `<span class="pill">${word}</span>`).join("")}</div>`).join("")}
        <div class="card"><h2>${environmentLabel}: ${fitLabel}</h2>${environmentWords.map((word) => `<span class="pill">${word}</span>`).join("")}</div>
      </body>
    </html>
  `);
  printable.document.close();
  printable.focus();
  printable.print();
}

export function MapDisplay({ data, onNext, onBack }: { data: ReflectionData; onNext: () => void; onBack: () => void }) {
  const { language } = useLanguage();
  const t = translations[language];
  const categories = ["energy", "strengths", "impact", "recognition", "environment"] as const;
  const hasAnySelections = categories.some((category) => [...data[category].selected, data[category].custom].filter(Boolean).length > 0);

  if (!hasAnySelections) {
    return (
      <ScreenContainer>
        <CornerDoodles />
        <div className="w-full max-w-[600px] mx-auto px-6 text-center animate-fade-in">
          <h1 className="font-serif text-3xl mb-3 text-foreground">{t.map.noSelectionsTitle}</h1>
          <p className="text-muted-foreground mb-8">{t.map.noSelectionsText}</p>
          <Button onClick={onBack} size="lg">{t.common.goBack}</Button>
        </div>
      </ScreenContainer>
    );
  }

  const categoryData = [
    { key: "energy", label: t.review.labels.energy, explainer: t.map.energyExplainer },
    { key: "strengths", label: t.review.labels.strengths, explainer: t.map.strengthsExplainer },
    { key: "impact", label: t.review.labels.impact, explainer: t.map.impactExplainer },
    { key: "recognition", label: t.review.labels.recognition, explainer: t.map.recognitionExplainer },
  ] as const;

  const environmentWords = [...data.environment.selected, data.environment.custom].filter(Boolean);
  const positiveKeys = ["clear tasks", "flexible time", "sensory quiet", "autonomy", "predictable routine", "helpful feedback", "enough rest"];
  const negativeKeys = ["too much noise", "unclear priorities", "many switches", "long meetings", "social pressure", "micro interruptions", "too many surprises", "body fatigue"];
  const rawEnvironmentWords = [...data.environment.selected, data.environment.custom].filter(Boolean);

  const lookup = Object.entries(translations.en.words.environment).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[value] = key;
    acc[key] = key;
    return acc;
  }, {});

  const score = rawEnvironmentWords.reduce((total, word) => {
    const key = lookup[word] ?? word;
    if (positiveKeys.includes(key)) return total + 1;
    if (negativeKeys.includes(key)) return total - 1;
    return total;
  }, 0);

  const environmentFit = score < 0 ? "low" : score <= 1 ? "medium" : "high";
  const fitLabel = environmentFit === "low" ? t.map.lowFitLabel : environmentFit === "medium" ? t.map.mediumFitLabel : t.map.highFitLabel;
  const filledSegments = environmentFit === "low" ? 2 : environmentFit === "medium" ? 4 : 6;

  return (
    <ScreenContainer>
      <CornerDoodles />
      <FoxCompanion />
      <div className="w-full max-w-[720px] mx-auto pb-16 animate-fade-in pt-12 px-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-10 h-px bg-primary" />
          <span className="eyebrow">Your Map</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-foreground">{t.map.title}</h1>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-[600px]">{t.map.subtitle}</p>

        <div className="relative mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {categoryData.map(({ key, label, explainer }, index) => {
              const words = [...data[key].selected, data[key].custom].filter(Boolean);
              if (words.length === 0) return null;
              return (
                <div key={key} className="animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                  <p className="text-xs text-muted-foreground mb-2 px-1">{explainer}</p>
                  <StickyNoteCard title={label} words={words} category={key} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="border border-border rounded-2xl p-7 mb-6 bg-card">
          <h3 className="font-serif text-2xl mb-1 text-primary">{t.map.environmentFit}</h3>
          <p className="text-xs text-muted-foreground mb-5">{t.map.environmentExplainer}</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="eyebrow text-muted-foreground">{t.map.lowFit}</span>
            <div className="flex-1 h-2 bg-muted rounded-sm overflow-hidden flex">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className={cn("flex-1 border-r border-background last:border-r-0 transition-colors duration-500", index < filledSegments ? "bg-primary" : "bg-transparent")} />
              ))}
            </div>
            <span className="eyebrow text-muted-foreground">{t.map.highFit}</span>
          </div>
          <div className="mb-4">
            <span className={cn("inline-block px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-[0.12em] border", environmentFit === "low" && "border-destructive text-destructive", environmentFit === "medium" && "border-foreground/40 text-foreground", environmentFit === "high" && "border-primary text-primary")}>
              {fitLabel}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {environmentWords.map((word) => (
              <span key={word} className="inline-block px-3 py-1 rounded-sm text-xs font-medium bg-background text-foreground border border-border">
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() =>
              openPrintableMap(
                t.map.title,
                categoryData.map(({ key, label }) => ({ title: label, words: [...data[key].selected, data[key].custom].filter(Boolean) })),
                t.map.environmentFit,
                environmentWords,
                fitLabel,
              )
            }
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {t.map.downloadPdf}
          </Button>
          <Button onClick={onNext} size="lg">
            {t.common.next}
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
}
