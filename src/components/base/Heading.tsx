import type { ElementType, ReactNode, Ref } from "react";

import { cn } from "../../utils/cn";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Для переноса фокуса на заголовок при смене экрана (useFocusOnMount). */
  ref?: Ref<HTMLHeadingElement>;
};

export function Heading({
  children,
  as: Tag = "h1",
  className = "",
  ref,
}: Props) {
  return (
    <Tag
      ref={ref}
      // -1: фокус только программно, в порядок Tab заголовок не попадает.
      tabIndex={ref ? -1 : undefined}
      className={cn(
        "font-heading text-light-blue text-xl leading-tight focus:outline-none",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
