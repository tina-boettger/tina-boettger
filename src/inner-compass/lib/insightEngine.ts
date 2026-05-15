import { translations } from "./translations";
import type { ReflectionData } from "../types/reflection";

type Language = "en" | "de";
type Category = keyof ReflectionData;
type PatternType =
  | "environmentFriction"
  | "energyStrengthOverlap"
  | "impactStrengthAlignment"
  | "hiddenStrengths"
  | "recognitionMismatch"
  | "supportiveEnvironment"
  | "lowDataFallback";

type WordEvidence = {
  category: Category;
  key: string;
  text: string;
  custom: boolean;
};

type PatternCandidate = {
  type: PatternType;
  score: number;
  words: WordEvidence[];
};

const CATEGORIES: Category[] = ["energy", "strengths", "impact", "recognition", "environment"];
const FRICTION_ENVIRONMENT_KEYS = new Set([
  "too much noise",
  "unclear priorities",
  "many switches",
  "long meetings",
  "social pressure",
  "micro interruptions",
  "too many surprises",
  "body fatigue",
]);
const SUPPORTIVE_ENVIRONMENT_KEYS = new Set([
  "clear tasks",
  "flexible time",
  "sensory quiet",
  "autonomy",
  "predictable routine",
  "helpful feedback",
  "enough rest",
]);

function allWords(category: { selected: string[]; custom: string }) {
  return [...category.selected, category.custom].map((word) => word.trim()).filter(Boolean);
}

function normalize(word: string) {
  return word.trim().toLowerCase();
}

function formatWords(words: string[], lang: Language) {
  const cleanWords = words.map((word) => word.trim()).filter(Boolean);
  if (cleanWords.length === 0) return "";
  if (cleanWords.length === 1) return cleanWords[0];
  const conjunction = lang === "de" ? "und" : "and";
  if (cleanWords.length === 2) return `${cleanWords[0]} ${conjunction} ${cleanWords[1]}`;
  return `${cleanWords.slice(0, -1).join(", ")} ${conjunction} ${cleanWords[cleanWords.length - 1]}`;
}

function stableHash(input: string) {
  return Array.from(input).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function choose<T>(items: T[], seed: string) {
  return items[stableHash(seed) % items.length];
}

function buildLookup(category: Category) {
  const lookup = new Map<string, string>();
  const englishWords = translations.en.words[category];
  const germanWords = translations.de.words[category];

  for (const key of Object.keys(englishWords)) {
    lookup.set(normalize(key), key);
    lookup.set(normalize(englishWords[key as keyof typeof englishWords]), key);
  }

  for (const key of Object.keys(germanWords)) {
    lookup.set(normalize(key), key);
    lookup.set(normalize(germanWords[key as keyof typeof germanWords]), key);
  }

  return lookup;
}

function translatedWord(category: Category, key: string, fallback: string, language: Language) {
  const words = translations[language].words[category];
  return (words as Record<string, string>)[key] ?? fallback;
}

function collectWords(data: ReflectionData, language: Language) {
  return CATEGORIES.reduce<Record<Category, WordEvidence[]>>((acc, category) => {
    const lookup = buildLookup(category);
    acc[category] = allWords(data[category]).map((word) => {
      const key = lookup.get(normalize(word));
      return {
        category,
        key: key ?? normalize(word),
        text: key ? translatedWord(category, key, word, language) : word,
        custom: !key,
      };
    });
    return acc;
  }, {} as Record<Category, WordEvidence[]>);
}

function findSharedWords(primary: WordEvidence[], secondary: WordEvidence[]) {
  const secondaryKeys = new Set(secondary.map((word) => word.key));
  return primary.filter((word, index, words) => secondaryKeys.has(word.key) && words.findIndex((candidate) => candidate.key === word.key) === index);
}

function findMissingWords(primary: WordEvidence[], ...comparisons: WordEvidence[][]) {
  const comparisonKeys = new Set(comparisons.flat().map((word) => word.key));
  return primary.filter((word) => !comparisonKeys.has(word.key));
}

function detectPatterns(words: Record<Category, WordEvidence[]>) {
  const candidates: PatternCandidate[] = [];
  const totalSelections = CATEGORIES.reduce((total, category) => total + words[category].length, 0);
  const environmentFriction = words.environment.filter((word) => FRICTION_ENVIRONMENT_KEYS.has(word.key));
  const supportiveEnvironment = words.environment.filter((word) => SUPPORTIVE_ENVIRONMENT_KEYS.has(word.key));
  const energyStrengthOverlap = findSharedWords(words.energy, words.strengths);
  const impactStrengthAlignment = findSharedWords(words.strengths, words.impact);
  const hiddenStrengths = findMissingWords(words.strengths, words.impact, words.recognition);
  const recognitionMismatch = findMissingWords(words.recognition, words.energy, words.strengths);

  if (environmentFriction.length > supportiveEnvironment.length && environmentFriction.length >= 1) {
    candidates.push({ type: "environmentFriction", score: 34 + environmentFriction.length * 12, words: environmentFriction });
  }

  if (energyStrengthOverlap.length >= 1) {
    candidates.push({ type: "energyStrengthOverlap", score: 28 + energyStrengthOverlap.length * 13, words: energyStrengthOverlap });
  }

  if (impactStrengthAlignment.length >= 1) {
    candidates.push({ type: "impactStrengthAlignment", score: 24 + impactStrengthAlignment.length * 12, words: impactStrengthAlignment });
  }

  if (hiddenStrengths.length >= 2) {
    candidates.push({ type: "hiddenStrengths", score: 21 + hiddenStrengths.length * 7, words: hiddenStrengths });
  }

  if (recognitionMismatch.length >= 2) {
    candidates.push({ type: "recognitionMismatch", score: 19 + recognitionMismatch.length * 6, words: recognitionMismatch });
  }

  if (supportiveEnvironment.length >= 2) {
    candidates.push({ type: "supportiveEnvironment", score: 18 + supportiveEnvironment.length * 8, words: supportiveEnvironment });
  }

  if (candidates.length === 0 || totalSelections < 3) {
    candidates.push({
      type: "lowDataFallback",
      score: 1,
      words: CATEGORIES.flatMap((category) => words[category]).slice(0, 3),
    });
  }

  return candidates.sort((a, b) => b.score - a.score);
}

function sentenceFor(pattern: PatternCandidate, language: Language, seed: string, position: "primary" | "secondary") {
  const evidence = formatWords(pattern.words.slice(0, 3).map((word) => word.text), language);
  const isSecondary = position === "secondary";

  const copy: Record<PatternType, Record<Language, string[]>> = {
    environmentFriction: {
      en: [
        `Your selections suggest that the environment is carrying real friction, especially around ${evidence}. That points less to a personal motivation problem and more to conditions that may need redesigning.`,
        `A strong signal sits in the working conditions: ${evidence}. If those are present often, the challenge may be structural rather than something you should solve by simply pushing harder.`,
      ],
      de: [
        `Deine Auswahl zeigt deutliche Reibung im Umfeld, besonders bei ${evidence}. Das klingt weniger nach einem persönlichen Motivationsproblem und eher nach Bedingungen, die anders gestaltet werden sollten.`,
        `Ein starkes Signal liegt in deinen Arbeitsbedingungen: ${evidence}. Wenn das oft vorkommt, ist die Herausforderung eher strukturell als etwas, das du nur mit mehr Anstrengung lösen solltest.`,
      ],
    },
    energyStrengthOverlap: {
      en: [
        `Your clearest alignment appears where energy and strength meet: ${evidence}. This is likely where work feels more natural, focused, and sustainable.`,
        `There is a useful overlap between what gives you energy and what you naturally bring: ${evidence}. That overlap is a good clue for work that can carry momentum without constant force.`,
      ],
      de: [
        `Deine klarste Passung zeigt sich dort, wo Energie und Stärke zusammenkommen: ${evidence}. Dort fühlt sich Arbeit wahrscheinlich natürlicher, fokussierter und tragfähiger an.`,
        `Es gibt eine hilfreiche Überschneidung zwischen dem, was dir Energie gibt, und dem, was dir leichtfällt: ${evidence}. Genau dort kann Arbeit entstehen, die nicht ständig Kraft kostet.`,
      ],
    },
    impactStrengthAlignment: {
      en: [
        `Your strengths also seem to become visible as impact through ${evidence}. That suggests your contribution is not only internal confidence, but something others may actually experience.`,
        `The map connects ability with contribution around ${evidence}. That is a sign that your strengths may already be translating into visible value.`,
      ],
      de: [
        `Deine Stärken scheinen über ${evidence} auch als Wirkung sichtbar zu werden. Das deutet darauf hin, dass dein Beitrag nicht nur innerlich stimmig ist, sondern auch bei anderen ankommt.`,
        `Die Karte verbindet Fähigkeit und Beitrag bei ${evidence}. Das ist ein Hinweis darauf, dass deine Stärken bereits in sichtbaren Wert übersetzt werden.`,
      ],
    },
    hiddenStrengths: {
      en: [
        `At the same time, strengths like ${evidence} may not yet be fully visible in impact or recognition. They could be worth naming more explicitly.`,
        `Some strengths may be working quietly in the background, especially ${evidence}. Bringing them into clearer language could help others understand their value.`,
      ],
      de: [
        `Gleichzeitig tauchen Stärken wie ${evidence} in Wirkung oder Anerkennung noch nicht stark auf. Es könnte sich lohnen, sie klarer zu benennen.`,
        `Einige Stärken arbeiten eher im Hintergrund, besonders ${evidence}. Wenn du sie deutlicher in Sprache bringst, wird ihr Wert für andere leichter erkennbar.`,
      ],
    },
    recognitionMismatch: {
      en: [
        `Recognition seems to gather around ${evidence}, but those signals do not clearly match your energy or core strengths. That may explain why appreciation can still feel a little incomplete.`,
        `What gets noticed may be ${evidence}, even if that is not the center of what energizes you. This is worth watching, because recognition can feel hollow when it rewards the wrong pattern.`,
      ],
      de: [
        `Anerkennung scheint sich um ${evidence} zu sammeln, passt aber nicht klar zu deiner Energie oder deinen Kernstärken. Das könnte erklären, warum Wertschätzung sich trotzdem unvollständig anfühlt.`,
        `Gesehen wird vielleicht vor allem ${evidence}, auch wenn das nicht im Zentrum deiner Energie liegt. Das ist wichtig zu beobachten, weil Anerkennung leer wirken kann, wenn sie das falsche Muster belohnt.`,
      ],
    },
    supportiveEnvironment: {
      en: [
        `Supportive conditions also show up clearly: ${evidence}. These are not small preferences; they are part of what helps your work stay steady and useful.`,
        `The map names conditions worth protecting: ${evidence}. Keeping those visible can make good work easier to repeat.`,
      ],
      de: [
        `Hilfreiche Bedingungen sind ebenfalls klar erkennbar: ${evidence}. Das sind keine kleinen Vorlieben, sondern ein Teil dessen, was deine Arbeit stabil und wirksam macht.`,
        `Die Karte benennt Bedingungen, die du schützen solltest: ${evidence}. Wenn sie sichtbar bleiben, lässt sich gute Arbeit leichter wiederholen.`,
      ],
    },
    lowDataFallback: {
      en: [
        "Your selections are still a compact snapshot, but they already give language to what feels aligned. Use them as a starting point for noticing where energy, contribution, recognition, and environment support each other.",
        "This map is intentionally small, but it can still sharpen the conversation. Look for the words that feel most alive, because they often point to the conditions your work needs next.",
      ],
      de: [
        "Deine Auswahl ist noch eine kompakte Momentaufnahme, gibt aber bereits Sprache für das, was sich stimmig anfühlt. Nutze sie als Ausgangspunkt, um zu erkennen, wo Energie, Beitrag, Anerkennung und Umfeld zusammenpassen.",
        "Diese Karte ist bewusst klein, kann aber das Gespräch schärfen. Achte auf die Begriffe, die sich am lebendigsten anfühlen, denn sie zeigen oft, welche Bedingungen deine Arbeit als Nächstes braucht.",
      ],
    },
  };

  const sentence = choose(copy[pattern.type][language], `${seed}:${pattern.type}:${position}`);
  if (!isSecondary) return sentence;

  if (language === "de") {
    return sentence
      .replace(/^Deine Auswahl zeigt/, "Außerdem zeigt deine Auswahl")
      .replace(/^Die Karte verbindet/, "Außerdem zeigt die Karte eine Verbindung")
      .replace(/^Die Karte/, "Außerdem zeigt die Karte")
      .replace(/^Hilfreiche/, "Auch hilfreiche");
  }
  return sentence.replace(/^Your selections suggest/, "Your selections also suggest").replace(/^The map/, "The map also").replace(/^Supportive/, "Supportive");
}

function composeInsight(patterns: PatternCandidate[], language: Language, seed: string) {
  const primary = patterns[0];
  const secondary = patterns.find((pattern) => pattern.type !== primary.type && pattern.type !== "lowDataFallback");

  if (!secondary || primary.type === "lowDataFallback") {
    return sentenceFor(primary, language, seed, "primary");
  }

  return `${sentenceFor(primary, language, seed, "primary")} ${sentenceFor(secondary, language, seed, "secondary")}`;
}

export function generateInsight(data: ReflectionData, language: Language = "en") {
  const words = collectWords(data, language);
  const seed = CATEGORIES.flatMap((category) => words[category].map((word) => `${category}:${word.key}:${word.text}`)).join("|");
  return composeInsight(detectPatterns(words), language, seed);
}
