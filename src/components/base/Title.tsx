import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  classes?: string;
};
export function Title({ children, as: Tag = "h1", classes }: Props) {
  return (
    <Tag className={`text-light-blue text-lg font-bold ${classes}`}>
      {children}
    </Tag>
  );
}
