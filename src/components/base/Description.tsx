import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Description({ children }: Props) {
  return (
    <p className="leading-free text-grey-blue max-w-text text-base">
      {children}
    </p>
  );
}
