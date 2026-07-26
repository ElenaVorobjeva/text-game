import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Props = {
  type?: "button" | "link";
  href?: string;
  size?: "sm" | "md" | "lg";
  color?: "white" | "gray";
  onClick?: () => void;
  children: ReactNode;
};

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
