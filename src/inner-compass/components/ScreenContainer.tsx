import type { ReactNode } from "react";

export function ScreenContainer({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] w-full px-4 pt-24 md:pt-10 pb-12 relative flex flex-col items-center justify-center">{children}</div>;
}
