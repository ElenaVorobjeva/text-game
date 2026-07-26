import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

type BaseProps = {
  size?: "sm" | "md" | "lg";
  color?: "white" | "gray";
  children: ReactNode;
};

// Дискриминированный union, а не набор опциональных пропов: ссылке обязателен
// href, кнопке — onClick. Раньше опциональны были оба при любом type, и
// <Link type="button"> без onClick спокойно компилировался в мёртвую кнопку.
type Props = BaseProps &
  (
    | { type?: "link"; href: string; onClick?: () => void }
    | { type: "button"; href?: never; onClick: () => void }
  );

const SIZES = {
  sm: "text-2xs",
  md: "text-base",
  lg: "text-xs",
};

const COLORS = {
  white: "text-grey hover:bg-grey-60 hover:text-light-blue",
  gray: "text-grey-blue hover:bg-grey-60 hover:text-grey",
};

export function Link({
  type = "link",
  href,
  size = "md",
  color = "white",
  onClick,
  children,
}: Props) {
  const linkStyles = cn(
    "-mx-2.5 -my-1.5 cursor-pointer rounded-sm px-2.5 py-1.5 font-medium transition duration-150",
    SIZES[size],
    COLORS[color],
  );

  if (type === "button") {
    return (
      <button type="button" className={linkStyles} onClick={onClick}>
        {children}
      </button>
    );
  }

  return (
    <a className={linkStyles} href={href} onClick={onClick}>
      {children}
    </a>
  );
}
