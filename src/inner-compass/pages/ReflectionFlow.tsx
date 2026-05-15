import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
import { getDemoReflectionData } from "../lib/printSummary";
import type { ReflectionData } from "../types/reflection";
import { Button } from "../components/ui/Button";
import { AccessibilityMenu } from "../components/AccessibilityMenu";
import { CornerDoodles } from "../components/CornerDoodles";
import { LanguageToggle } from "../components/LanguageToggle";
import { ScreenContainer } from "../components/ScreenContainer";
import { WordSelection } from "../components/WordSelection";
import { InsightScreen } from "./InsightScreen";
import { MapDisplay } from "./MapDisplay";
import { ReviewScreen } from "./ReviewScreen";
import { SaveScreen } from "./SaveScreen";

const emptyData = (): ReflectionData => ({
  energy: { selected: [], custom: "" },
  strengths: { selected: [], custom: "" },
  impact: { selected: [], custom: "" },
  recognition: { selected: [], custom: "" },
  environment: { selected: [], custom: "" },
});

export default function ReflectionFlow() {
  const [step, setStep] = useState(0);
  const [reflectionData, setReflectionData] = useState<ReflectionData>(emptyData);
  const [pendingResume, setPendingResume] = useState<{ data: ReflectionData; step: number } | null>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const resumeConfirmLabel = t.welcome.resumeConfirm || (language === "de" ? "Fortsetzen" : "Resume");
  const resumeCancelLabel = t.welcome.resumeCancel || (language === "de" ? "Neu beginnen" : "Start Fresh");

  useEffect(() => {
    const saved = localStorage.getItem("reflection-data");
    const savedStep = localStorage.getItem("reflection-step");
    if (saved && savedStep) {
      try {
        const parsed = JSON.parse(saved);
        setPendingResume({ data: parsed, step: Number(savedStep) });
      } catch {
        localStorage.removeItem("reflection-data");
        localStorage.removeItem("reflection-step");
      }
    }
  }, []);

  useEffect(() => {
    if (step > 0) {
      localStorage.setItem("reflection-data", JSON.stringify(reflectionData));
      localStorage.setItem("reflection-step", String(step));
    }
  }, [reflectionData, step]);

  const updateData = (category: keyof ReflectionData, data: { selected: string[]; custom: string }) => {
    setReflectionData((current) => ({ ...current, [category]: data }));
  };

  const restart = () => {
    localStorage.removeItem("reflection-data");
    localStorage.removeItem("reflection-step");
    setPendingResume(null);
    setReflectionData(emptyData());
    setStep(0);
  };

  const continueSavedReflection = () => {
    if (!pendingResume) return;
    setReflectionData(pendingResume.data);
    setStep(pendingResume.step);
    setPendingResume(null);
  };

  const discardSavedReflection = () => {
    localStorage.removeItem("reflection-data");
    localStorage.removeItem("reflection-step");
    setPendingResume(null);
  };

  const renderSelection = (
    category: keyof ReflectionData,
    title: string,
    helper: string,
    words: string[],
    currentStep: number,
  ) => (
    <ScreenContainer>
      <CornerDoodles />
      <WordSelection
        title={title}
        helper={helper}
        words={words}
        category={category as "energy" | "strengths" | "impact" | "recognition" | "environment"}
        selectedWords={reflectionData[category].selected}
        customWord={reflectionData[category].custom}
        onSelectWord={(word) => {
          const selected = reflectionData[category].selected.includes(word)
            ? reflectionData[category].selected.filter((item) => item !== word)
            : reflectionData[category].selected.length < 5
              ? [...reflectionData[category].selected, word]
              : reflectionData[category].selected;
          updateData(category, { selected, custom: reflectionData[category].custom });
        }}
        onCustomWordChange={(text) => updateData(category, { selected: reflectionData[category].selected, custom: text })}
        onNext={() => setStep(currentStep + 1)}
        onBack={() => setStep(currentStep - 1)}
        onSkip={() => setStep(currentStep + 1)}
        currentStep={currentStep}
        totalSteps={5}
      />
    </ScreenContainer>
  );

  return (
    <div className="animate-fade-in" key={step}>
      <LanguageToggle />
      <div className="fixed top-4 left-24 z-[70]">
        <AccessibilityMenu />
      </div>
      {pendingResume ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-2xl border border-foreground/10 bg-card p-7 shadow-[var(--shadow-lift)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="block h-px w-10 bg-primary" />
              <span className="eyebrow">Resume</span>
            </div>
            <h2 className="mb-3 font-serif text-3xl leading-tight text-foreground">{t.welcome.resumeTitle}</h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">{t.welcome.resumeDescription}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={continueSavedReflection} size="lg" className="flex-1 text-primary-foreground" aria-label={resumeConfirmLabel}>
                <span>{resumeConfirmLabel}</span>
              </Button>
              <Button onClick={discardSavedReflection} variant="outline" size="lg" className="flex-1 text-foreground" aria-label={resumeCancelLabel}>
                <span>{resumeCancelLabel}</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {step === 0 ? (
        <ScreenContainer>
          <div className="w-full max-w-[640px] mx-auto animate-fade-in px-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-10 h-px bg-primary" />
              <span className="eyebrow">Reflection</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl mb-4 text-foreground leading-[1.02]">{t.welcome.title}</h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed max-w-[520px]">{t.welcome.subtitle}</p>
            <div className="mb-6 rounded-2xl border border-foreground/10 bg-card p-6 md:p-7">
              <h2 className="font-serif text-2xl mb-3 text-primary">{t.welcome.introTitle}</h2>
              <div className="text-sm md:text-base text-muted-foreground leading-relaxed">
                <p>{t.welcome.introBody}</p>
              </div>
              <div className="mt-5 border-t border-foreground/10 pt-5">
                <h2 className="font-serif text-2xl mb-4 text-primary">{t.welcome.expectTitle}</h2>
                <ul className="grid gap-2 text-sm md:text-base text-muted-foreground">
                  {t.welcome.expectItems.map((item) => (
                    <li key={item} className="flex gap-4 items-center">
                      <span aria-hidden className="block w-6 h-px bg-primary/60 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setStep(1)} size="lg">{t.welcome.startButton}</Button>
              <Button onClick={() => { setReflectionData(getDemoReflectionData(language)); setStep(6); }} variant="outline" size="lg">{t.welcome.loadDemo}</Button>
            </div>
          </div>
        </ScreenContainer>
      ) : null}

      {step === 1 ? renderSelection("energy", t.steps.energy.title, t.steps.energy.helper, Object.values(t.words.energy), 1) : null}
      {step === 2 ? renderSelection("strengths", t.steps.strengths.title, t.steps.strengths.helper, Object.values(t.words.strengths), 2) : null}
      {step === 3 ? renderSelection("impact", t.steps.impact.title, t.steps.impact.helper, Object.values(t.words.impact), 3) : null}
      {step === 4 ? renderSelection("recognition", t.steps.recognition.title, t.steps.recognition.helper, Object.values(t.words.recognition), 4) : null}
      {step === 5 ? renderSelection("environment", t.steps.environment.title, t.steps.environment.helper, Object.values(t.words.environment), 5) : null}
      {step === 6 ? <ReviewScreen data={reflectionData} onEdit={(category) => setStep({ energy: 1, strengths: 2, impact: 3, recognition: 4, environment: 5 }[category])} onNext={() => setStep(7)} onBack={() => setStep(5)} /> : null}
      {step === 7 ? <MapDisplay data={reflectionData} onNext={() => setStep(8)} onBack={() => setStep(6)} /> : null}
      {step === 8 ? <InsightScreen data={reflectionData} onNext={() => setStep(9)} /> : null}
      {step === 9 ? <SaveScreen data={reflectionData} onRestart={restart} /> : null}
    </div>
  );
}
