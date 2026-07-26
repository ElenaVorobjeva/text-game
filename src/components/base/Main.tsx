import type { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

export function Main({ className = "", children }: Props) {
  const mainStyles =
    "flex grow animate-fade-up flex-col items-center justify-center p-6 text-center sm:p-10";

  return <main className={`${mainStyles} ${className}`}>{children}</main>;
}
