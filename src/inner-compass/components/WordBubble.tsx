import { cn } from "../lib/utils";

export function WordBubble({
  word,
  isSelected,
  onToggle,
  isDisabled,
  hint,
  showHints,
}: {
  word: string;
  category: "energy" | "strengths" | "impact" | "recognition" | "environment";
  isSelected: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
  hint?: string;
  showHints?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      title={!showHints ? hint : undefined}
      className={cn(
        "relative px-5 py-3 lg:px-6 lg:py-4 transition-colors duration-200 w-full rounded-full flex flex-col items-center justify-center min-h-[48px] lg:min-h-[56px] border disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-card border-foreground/15 text-foreground hover:border-foreground/50",
      )}
      aria-pressed={isSelected}
      aria-label={`${word}${hint ? `: ${hint}` : ""}`}
    >
      <span className="font-medium text-sm md:text-base text-center leading-tight">{word}</span>
      {showHints && hint ? (
        <span className={cn("text-xs md:text-sm mt-1 text-center leading-snug", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {hint}
        </span>
      ) : null}
    </button>
  );
}
