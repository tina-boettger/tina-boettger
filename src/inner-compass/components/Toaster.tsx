import { useToast } from "../hooks/useToast";
import { cn } from "../lib/utils";

export default function Toaster() {
  const { toast } = useToast();

  if (!toast) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 z-[80] max-w-sm">
      <div
        className={cn(
          "rounded-2xl border bg-card px-5 py-4 shadow-[var(--shadow-strong)]",
          toast.variant === "destructive" && "border-destructive text-destructive",
        )}
      >
        <p className="font-semibold uppercase tracking-[0.12em] text-xs mb-1">{toast.title}</p>
        {toast.description ? <p className="text-sm text-muted-foreground">{toast.description}</p> : null}
      </div>
    </div>
  );
}
