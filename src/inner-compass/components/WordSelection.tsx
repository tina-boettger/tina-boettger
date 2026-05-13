import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
import { ProgressIndicator } from "./ProgressIndicator";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import { WordBubble } from "./WordBubble";

export function WordSelection({
  title,
  helper,
  words,
  category,
  maxSelections = 5,
  selectedWords,
  customWord,
  onSelectWord,
  onCustomWordChange,
  onNext,
  onBack,
  onSkip,
  currentStep,
  totalSteps,
}: {
  title: string;
  helper: string;
  words: string[];
  category: "energy" | "strengths" | "impact" | "recognition" | "environment";
  maxSelections?: number;
  selectedWords: string[];
  customWord: string;
  onSelectWord: (word: string) => void;
  onCustomWordChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  currentStep?: number;
  totalSteps?: number;
}) {
  const [showHints, setShowHints] = useState(true);
  const canContinue = selectedWords.length > 0 || customWord.trim().length > 0;
  const isAtMaxSelections = selectedWords.length >= maxSelections;
  const { language } = useLanguage();
  const t = translations[language];
  const wordKeys = Object.keys(translations.en.words[category]);

  return (
    <div className="flex flex-col pb-32 relative">
      {currentStep && totalSteps ? (
        <div className="px-6 pt-6 pb-4">
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      ) : null}

      <div className="flex-1 px-6 py-8">
        <div className="w-full mx-auto">
          <div className="mb-10">
            <h1 className="font-serif text-4xl md:text-5xl mb-4 text-foreground leading-[1.05]">{title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-[640px]">{helper}</p>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${isAtMaxSelections ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                {selectedWords.length} / {maxSelections}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowHints((current) => !current)}>
                <HelpCircle className="w-4 h-4 mr-2" />
                {showHints ? t.wordSelection.hideHints : t.wordSelection.showHints}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 mb-10">
            {words.map((word, index) => {
              const wordKey = wordKeys[index];
              const hint = t.hints[category]?.[wordKey as keyof typeof t.hints[typeof category]];
              return (
                <div key={word} className="animate-slide-in-right w-full" style={{ animationDelay: `${index * 20}ms` }}>
                  <WordBubble
                    word={word}
                    category={category}
                    isSelected={selectedWords.includes(word)}
                    onToggle={() => onSelectWord(word)}
                    isDisabled={!selectedWords.includes(word) && isAtMaxSelections}
                    hint={hint}
                    showHints={showHints}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-[680px] mx-auto mt-10">
          <label className="block eyebrow mb-3">{t.wordSelection.customLabel}</label>
          <Textarea
            value={customWord}
            onChange={(e) => onCustomWordChange(e.target.value)}
            placeholder={t.wordSelection.customPlaceholder}
            className="w-full min-h-[120px] text-base bg-card"
            maxLength={200}
          />
          {customWord ? <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">{customWord.length}/200 {t.wordSelection.charactersLabel}</p> : null}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/95 backdrop-blur-sm border-t border-border z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack} size="lg" className="flex-1">
            {t.common.back}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={() => {
              if (window.confirm(t.wordSelection.skipDescription)) {
                onSkip();
              }
            }}
          >
            {t.common.skip}
          </Button>
          <Button onClick={onNext} disabled={!canContinue} size="lg" className="flex-1">
            {t.common.continue}
          </Button>
        </div>
      </div>
    </div>
  );
}
