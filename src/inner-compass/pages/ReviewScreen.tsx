import type { ReflectionData } from "../types/reflection";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
import { Button } from "../components/ui/Button";
import { CornerDoodles } from "../components/CornerDoodles";
import { FoxCompanion } from "../components/FoxCompanion";
import { FrostedFooter } from "../components/FrostedFooter";
import { ScreenContainer } from "../components/ScreenContainer";
import { StickyNoteCard } from "../components/StickyNoteCard";

export function ReviewScreen({
  data,
  onEdit,
  onNext,
  onBack,
}: {
  data: ReflectionData;
  onEdit: (category: keyof ReflectionData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { language } = useLanguage();
  const t = translations[language];
  const categories = [
    { key: "energy", label: t.review.labels.energy },
    { key: "strengths", label: t.review.labels.strengths },
    { key: "impact", label: t.review.labels.impact },
    { key: "recognition", label: t.review.labels.recognition },
    { key: "environment", label: t.review.labels.environment },
  ] as const;

  return (
    <ScreenContainer>
      <CornerDoodles />
      <FoxCompanion />
      <div className="w-full max-w-[960px] mx-auto pb-16 pt-4 animate-fade-in px-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-10 h-px bg-primary" />
          <span className="eyebrow">Review</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">{t.review.title}</h1>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-[640px]">{t.review.subtitle}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {categories.map(({ key, label }, index) => {
            const categoryData = data[key];
            const words = [...categoryData.selected, categoryData.custom].filter(Boolean);
            if (words.length === 0) return null;

            return (
              <div key={key} className="relative animate-slide-in-left" style={{ animationDelay: `${index * 80}ms` }}>
                <StickyNoteCard title={label} words={words} category={key} />
                <Button variant="ghost" size="sm" onClick={() => onEdit(key)} className="absolute top-4 right-4 text-xs uppercase tracking-[0.12em] text-primary hover:bg-transparent hover:underline">
                  {t.review.editButton}
                </Button>
              </div>
            );
          })}
        </div>

        <FrostedFooter onBack={onBack} onNext={onNext} backLabel={t.common.back} nextLabel={t.review.nextButton} />
      </div>
    </ScreenContainer>
  );
}
