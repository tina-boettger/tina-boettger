import { Button } from "./ui/Button";

export function FrostedFooter({
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Next",
}: {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/95 backdrop-blur-sm border-t border-border z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        <Button onClick={onBack} variant="ghost" size="lg" className="flex-1">
          {backLabel}
        </Button>
        <Button onClick={onNext} size="lg" className="flex-1">
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
