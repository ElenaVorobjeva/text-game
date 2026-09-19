import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";

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

// Пропсы не деструктурируются целиком: TS сужает union по props.type, а
// href из деструктуризации терял бы связь с типом ссылки.
export function Link(props: Props) {
  const { size = "md", color = "white", children } = props;

  const linkStyles = cn(
    "-mx-2.5 -my-1.5 cursor-pointer rounded-sm px-2.5 py-1.5 font-medium transition duration-150",
    SIZES[size],
    COLORS[color],
  );

  if (props.type === "button") {
    return (
      <button type="button" className={linkStyles} onClick={props.onClick}>
        {children}
      </button>
    );
  }

  // Переход внутри приложения — настоящая ссылка роутера: у неё роль link,
  // работают «открыть в новой вкладке» и средняя кнопка. Сырой <a href> под
  // HashRouter увёл бы мимо роутера.
  return (
    <RouterLink className={linkStyles} to={props.href} onClick={props.onClick}>
      {children}
    </RouterLink>
  );
}
