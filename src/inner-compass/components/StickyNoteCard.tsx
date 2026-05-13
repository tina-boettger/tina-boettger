import { cn } from "../lib/utils";

const accentByCategory = {
  energy: "text-[hsl(var(--ic-energy))]",
  strengths: "text-[hsl(var(--ic-strengths))]",
  impact: "text-primary",
  recognition: "text-[hsl(var(--ic-recognition))]",
  environment: "text-[hsl(var(--ic-environment))]",
};

export function StickyNoteCard({
  title,
  words,
  category,
  className,
}: {
  title: string;
  words: string[];
  category: keyof typeof accentByCategory;
  className?: string;
}) {
  return (
    <div className={cn("relative p-7 md:p-8 bg-card border border-foreground/10 rounded-2xl min-h-[160px] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]", className)}>
      <h3 className={cn("font-serif text-2xl md:text-[1.65rem] mb-5 leading-tight tracking-tight", accentByCategory[category])}>{title}</h3>
      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <span key={word} className="inline-flex items-center px-3 py-1 rounded-full border border-foreground/15 bg-background text-sm font-medium text-foreground">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
