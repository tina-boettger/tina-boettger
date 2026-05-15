import { translations } from "./translations";
import type { ReflectionData } from "../types/reflection";

export const PRINT_SUMMARY_KEY = "inner-compass-print-summary";

export const PRINT_CATEGORIES = ["energy", "strengths", "impact", "recognition", "environment"] as const;
export type PrintCategory = (typeof PRINT_CATEGORIES)[number];

export type PrintSummaryState = {
  data: ReflectionData;
  language: "en" | "de";
  createdAt: string;
};

export function getWords(data: ReflectionData, category: PrintCategory) {
  return [...data[category].selected, data[category].custom].map((word) => word.trim()).filter(Boolean);
}

export function getDemoReflectionData(language: "en" | "de"): ReflectionData {
  const t = translations[language];

  return {
    energy: { selected: [t.words.energy.building, t.words.energy.solving, t.words.energy.organizing], custom: "" },
    strengths: { selected: [t.words.strengths.clarity, t.words.strengths["systems-thinking"], t.words.strengths.persistence], custom: "" },
    impact: { selected: [t.words.impact.clarity, t.words.impact.reliability, t.words.impact.order], custom: "" },
    recognition: { selected: [t.words.recognition.speed, t.words.recognition.flexibility, t.words.recognition.talking], custom: "" },
    environment: { selected: [t.words.environment["clear tasks"], t.words.environment.autonomy, t.words.environment["helpful feedback"]], custom: "" },
  };
}

export function savePrintableSummary(data: ReflectionData, language: "en" | "de") {
  localStorage.setItem(
    PRINT_SUMMARY_KEY,
    JSON.stringify({
      data,
      language,
      createdAt: new Date().toISOString(),
    } satisfies PrintSummaryState),
  );
}

export function loadPrintableSummary(): PrintSummaryState {
  const stored = localStorage.getItem(PRINT_SUMMARY_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as PrintSummaryState;
      if (parsed?.data && (parsed.language === "en" || parsed.language === "de")) {
        return parsed;
      }
    } catch {
      localStorage.removeItem(PRINT_SUMMARY_KEY);
    }
  }

  const language = localStorage.getItem("inner-compass-language") === "de" ? "de" : "en";
  const savedReflection = localStorage.getItem("reflection-data");

  if (savedReflection) {
    try {
      return {
        data: JSON.parse(savedReflection) as ReflectionData,
        language,
        createdAt: new Date().toISOString(),
      };
    } catch {
      localStorage.removeItem("reflection-data");
    }
  }

  return {
    data: getDemoReflectionData(language),
    language,
    createdAt: new Date().toISOString(),
  };
}
