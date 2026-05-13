import { cn } from "../lib/utils";

export function ProgressIndicator({
  currentStep,
  totalSteps,
  className,
}: {
  currentStep: number;
  totalSteps: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow">Step {currentStep} / {totalSteps}</span>
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          {Math.round(((currentStep - 1) / totalSteps) * 100)}%
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className={cn("flex-1 transition-colors duration-500", index < currentStep ? "bg-primary h-[2px]" : "bg-border h-px")} />
        ))}
      </div>
    </div>
  );
}
