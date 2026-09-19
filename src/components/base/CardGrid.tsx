import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function CardGrid({ children }: Props) {
  return (
    <ul className="max-w-grid flex flex-wrap justify-center gap-7">
      {children}
    </ul>
  );
}
