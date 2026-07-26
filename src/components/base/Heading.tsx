import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};
export function Heading({ children, as: Tag = "h1", className = "" }: Props) {
  return (
    <Tag
      className={`font-heading text-light-blue text-xl leading-tight ${className}`}
    >
      {children}
    </Tag>
  );
}
