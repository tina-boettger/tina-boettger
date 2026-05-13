import { Minus, Plus } from "lucide-react";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../lib/translations";

export function AccessibilityMenu() {
  const { settings, increaseFontSize, decreaseFontSize } = useAccessibility();
  const { language } = useLanguage();
  const t = translations[language].accessibility;

  return (
    <div
      className="inline-flex h-14 items-center gap-1 rounded-xl border border-border bg-card px-2 text-muted-foreground shadow-[var(--shadow-soft)]"
      aria-label={t.accessibilityOptions}
    >
      <button
        onClick={decreaseFontSize}
        className="grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-accent disabled:opacity-40"
        aria-label={t.decreaseFontSize}
        disabled={settings.fontSize <= 0.85}
      >
        <Minus size={18} strokeWidth={2} />
      </button>
      <div className="min-w-6 text-center text-xs font-semibold text-foreground/60">A</div>
      <button
        onClick={increaseFontSize}
        className="grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-accent disabled:opacity-40"
        aria-label={t.increaseFontSize}
        disabled={settings.fontSize >= 1.3}
      >
        <Plus size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
