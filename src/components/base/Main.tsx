import type { ReactNode } from "react";

type Props = {
  classes?: string;
  children: ReactNode;
};

export function Main({ classes, children }: Props) {
  const mainStyles =
    "flex grow animate-fade-up flex-col items-center justify-center p-6 text-center sm:p-10";

  return <main className={`${mainStyles} ${classes || ""}`}>{children}</main>;
}
