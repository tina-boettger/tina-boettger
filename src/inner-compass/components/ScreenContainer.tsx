import type { ReactNode } from "react";

export function ScreenContainer({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] w-full px-4 pt-32 md:pt-28 pb-16 relative flex flex-col items-center justify-start">{children}</div>;
}
