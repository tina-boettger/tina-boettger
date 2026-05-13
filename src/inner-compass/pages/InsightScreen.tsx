import { useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { generateInsight } from "../lib/insightEngine";
import { translations } from "../lib/translations";
import type { ReflectionData } from "../types/reflection";
import { Button } from "../components/ui/Button";
import { FoxCompanion } from "../components/FoxCompanion";
import { ScreenContainer } from "../components/ScreenContainer";

export function InsightScreen({ data, onNext }: { data: ReflectionData; onNext: () => void }) {
  const { language } = useLanguage();
  const t = translations[language];
  const insight = useMemo(() => generateInsight(data, language), [data, language]);

  return (
    <ScreenContainer>
      <FoxCompanion />
      <div className="w-full max-w-[680px] mx-auto animate-fade-in pb-16 pt-12 px-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-10 h-px bg-primary" />
          <span className="eyebrow">Insight</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-foreground">{t.insight.title}</h1>

        <blockquote className="bg-card border-l-2 border-primary py-6 px-7 mb-10 text-lg leading-relaxed text-foreground/90 font-serif">
          {insight}
        </blockquote>

        <div className="mb-10">
          <h3 className="eyebrow mb-4">{t.insight.actionTitle}</h3>
          <div className="space-y-2">
            {t.insight.actions.map((action) => (
              <Button key={action} variant="outline" className="w-full justify-start h-auto py-4 px-5 text-left font-normal normal-case tracking-normal text-sm md:text-base" onClick={onNext}>
                {action}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={onNext} size="lg">
          {t.insight.continueButton}
        </Button>
      </div>
    </ScreenContainer>
  );
}
