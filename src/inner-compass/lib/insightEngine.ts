import { translations } from "./translations";
import type { ReflectionData } from "../types/reflection";

function allWords(category: { selected: string[]; custom: string }) {
  return [...category.selected, category.custom].filter(Boolean);
}

function formatWords(words: string[], lang: "en" | "de") {
  if (words.length === 0) return "";
  if (words.length === 1) return words[0];
  const conjunction = lang === "de" ? "und" : "and";
  if (words.length === 2) return `${words[0]} ${conjunction} ${words[1]}`;
  return `${words.slice(0, -1).join(", ")} ${conjunction} ${words[words.length - 1]}`;
}

export function generateInsight(data: ReflectionData, language: "en" | "de" = "en") {
  const t = translations[language];
  const energy = allWords(data.energy);
  const strengths = allWords(data.strengths);
  const impact = allWords(data.impact);
  const recognition = allWords(data.recognition);
  const environment = allWords(data.environment);

  const overlaps = energy.filter((word) => strengths.includes(word));
  const stressors = environment.filter((word) => /too much|too many|unclear|interruptions|switches|pressure|fatigue/i.test(word));
  const supportive = environment.filter((word) => /clear|flexible|quiet|autonomy|predictable|helpful|enough/i.test(word));
  const hiddenStrengths = strengths.filter((word) => !impact.includes(word) && !recognition.includes(word));
  const recognitionMismatch = recognition.filter((word) => !energy.includes(word) && !strengths.includes(word));

  if (overlaps.length >= 2) {
    return language === "de"
      ? `Zwischen deiner Energie und deinen Stärken gibt es eine klare Übereinstimmung: ${formatWords(overlaps.slice(0, 3), language)}. Das ist wahrscheinlich ein Bereich, in dem sich Arbeit für dich natürlicher und tragfähiger anfühlt.`
      : `There is a clear overlap between what energizes you and what feels like a strength: ${formatWords(overlaps.slice(0, 3), language)}. That is likely where work feels most natural and sustainable for you.`;
  }

  if (stressors.length >= 2) {
    return language === "de"
      ? `Dein Umfeld scheint gerade durch ${formatWords(stressors.slice(0, 3), language)} erschwert zu werden. Das klingt eher nach Rahmenbedingungen als nach einem persönlichen Problem.`
      : `Your environment seems to be made harder by ${formatWords(stressors.slice(0, 3), language)}. That sounds more like a systems issue than a personal failing.`;
  }

  if (hiddenStrengths.length >= 2) {
    return language === "de"
      ? `In deiner Auswahl stecken Stärken wie ${formatWords(hiddenStrengths.slice(0, 3), language)}, die in Wirkung oder Anerkennung noch nicht stark auftauchen. Vielleicht werden sie gerade unterschätzt.`
      : `Your reflection shows strengths like ${formatWords(hiddenStrengths.slice(0, 3), language)} that are not yet very visible in impact or recognition. They may be undervalued right now.`;
  }

  if (recognitionMismatch.length >= 2) {
    return language === "de"
      ? `Anerkennung scheint oft für ${formatWords(recognitionMismatch.slice(0, 3), language)} zu kommen, obwohl das nicht klar mit deiner Energie oder deinen Kernstärken verbunden ist. Das kann auf Dauer leer wirken.`
      : `Recognition seems to land around ${formatWords(recognitionMismatch.slice(0, 3), language)}, even though those do not clearly match your energy or core strengths. That can feel hollow over time.`;
  }

  if (supportive.length >= 2) {
    return language === "de"
      ? `Deine Auswahl zeigt einige hilfreiche Bedingungen wie ${formatWords(supportive.slice(0, 3), language)}. Es lohnt sich, diese Bedingungen bewusst zu schützen.`
      : `Your reflection shows supportive conditions like ${formatWords(supportive.slice(0, 3), language)}. Those are worth protecting on purpose.`;
  }

  return language === "de"
    ? "Deine Auswahl zeigt ein differenziertes Bild deiner Arbeitssituation. Achte darauf, was sich für dich stimmig anfühlt, denn genau dort liegen oft die wichtigsten Hinweise."
    : "Your selections reveal a nuanced picture of your work experience. Pay attention to what feels genuinely aligned, because that is often where the most useful insight lives.";
}
