import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  classes?: string;
};
export function Heading({ children, as: Tag = "h1", classes }: Props) {
  return (
    <Tag
      className={`font-heading text-light-blue text-xl leading-tight ${classes}`}
    >
      {children}
    </Tag>
  );
}
