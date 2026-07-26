import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Props = {
  variant?: "filled" | "bordered" | "outlined";
  size?: "sm" | "md" | "lg";
  color?: "white" | "gray";
  width?: "auto" | "full" | "grow" | "fullOnMobile";
  onClick: () => void;
  children: ReactNode;
};

const VARIANTS = {
  filled: {
    white:
      "rounded-md bg-white text-dark-blue hover:bg-light-blue hover:-translate-y-px",
    gray: "rounded-md bg-dark-blue text-white hover:-translate-y-px",
  },
  bordered: {
    white:
      "rounded-lg border-[1.5px] border-grey-160 bg-transparent text-grey hover:border-grey-blue hover:bg-grey-blue/10 hover:-translate-y-px",
    gray: "rounded-lg border-[1.5px] border-dark-blue bg-white text-dark-blue",
  },
  outlined: {
    white: "rounded-md border-b-2 border-white bg-transparent text-white",
    gray: "rounded-md border-b-2 border-gray-900 bg-transparent text-gray-900",
  },
};

const SIZES = {
  sm: "px-[1.375rem] py-[0.8125rem] text-base",
  md: "px-[1.875rem] py-3.5 text-base font-semibold",
  lg: "px-8 py-4 text-xs font-semibold",
};

const WIDTHS = {
  auto: "",
  full: "w-full",
  grow: "grow",
  fullOnMobile: "w-full sm:w-auto",
};

export function Button({
  variant = "filled",
  size = "md",
  color = "white",
  width = "auto",
  onClick,
  children,
}: Props) {
  // will-change-transform заранее даёт кнопке свой композитный слой. Иначе
  // первый hover, меняя translate, создаёт слой на лету — на фоне ещё «висящей»
  // (fill:both) анимации появления родителя это даёт разовое мелькание. Готовый
  // слой убирает этот первый relayer.
  const buttonStyles = cn(
    VARIANTS[variant][color],
    SIZES[size],
    WIDTHS[width],
    "cursor-pointer transition duration-150 will-change-transform",
  );

  return (
    <button type="button" className={buttonStyles} onClick={onClick}>
      {children}
    </button>
  );
}
