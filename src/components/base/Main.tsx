import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

type Props = {
  className?: string;
  children: ReactNode;
};

export function Main({ className = "", children }: Props) {
  return (
    <main
      className={cn(
        "animate-fade-up flex grow flex-col items-center justify-center p-6 text-center sm:p-10",
        className,
      )}
    >
      {children}
    </main>
  );
}
