import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "sm" | "default" | "lg";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (...args: any[]) => void;
  "aria-label"?: string;
  title?: string;
  [key: string]: any;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
  ghost: "bg-transparent text-foreground hover:bg-foreground/5 normal-case tracking-normal font-medium",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-5 text-xs min-h-[40px]",
  default: "h-11 px-6 py-2 text-sm min-h-[44px]",
  lg: "h-[52px] px-9 py-3 text-sm min-h-[52px]",
};

export function Button({
  children,
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.14em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
