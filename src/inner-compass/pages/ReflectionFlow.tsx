import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";
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
  const { language } = useLanguage();
  const t = translations[language];

  const getDemoData = (): ReflectionData => ({
    energy: { selected: [t.words.energy.building, t.words.energy.solving, t.words.energy.organizing], custom: "" },
    strengths: { selected: [t.words.strengths.clarity, t.words.strengths["systems-thinking"], t.words.strengths.persistence], custom: "" },
    impact: { selected: [t.words.impact.clarity, t.words.impact.reliability, t.words.impact.order], custom: "" },
    recognition: { selected: [t.words.recognition.speed, t.words.recognition.flexibility, t.words.recognition.talking], custom: "" },
    environment: { selected: [t.words.environment["clear tasks"], t.words.environment.autonomy, t.words.environment["helpful feedback"]], custom: "" },
  });

  useEffect(() => {
    const saved = localStorage.getItem("reflection-data");
    const savedStep = localStorage.getItem("reflection-step");
    if (saved && savedStep) {
      try {
        const parsed = JSON.parse(saved);
        if (window.confirm(t.welcome.resumeDescription)) {
          setReflectionData(parsed);
          setStep(Number(savedStep));
        } else {
          localStorage.removeItem("reflection-data");
          localStorage.removeItem("reflection-step");
        }
      } catch {
        localStorage.removeItem("reflection-data");
        localStorage.removeItem("reflection-step");
      }
    }
  }, [t.welcome.resumeDescription]);

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
    setReflectionData(emptyData());
    setStep(0);
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

      {step === 0 ? (
        <ScreenContainer>
          <div className="w-full max-w-[640px] mx-auto animate-fade-in pb-8 px-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-10 h-px bg-primary" />
              <span className="eyebrow">Reflection</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl mb-6 text-foreground leading-[1.05]">{t.welcome.title}</h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-[520px]">{t.welcome.subtitle}</p>
            <div className="space-y-8 mb-10">
              <div className="p-8 bg-card border border-foreground/10 rounded-2xl">
                <h2 className="font-serif text-2xl mb-5 text-primary">{t.welcome.expectTitle}</h2>
                <ul className="space-y-3 text-base text-muted-foreground">
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
              <Button onClick={() => { setReflectionData(getDemoData()); setStep(6); }} variant="outline" size="lg">{t.welcome.loadDemo}</Button>
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
