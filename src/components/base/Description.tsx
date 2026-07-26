import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Description({ children }: Props) {
  return (
    <p className="leading-free text-grey-blue max-w-[37.5rem] text-base">
      {children}
    </p>
  );
}
