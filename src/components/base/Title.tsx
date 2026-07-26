import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};
export function Title({ children, as: Tag = "h1", className = "" }: Props) {
  return (
    <Tag className={`text-light-blue text-lg font-bold ${className}`}>
      {children}
    </Tag>
  );
}
