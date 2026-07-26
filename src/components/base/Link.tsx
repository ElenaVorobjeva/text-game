import type { ReactNode } from "react";

type Props = {
  type?: "button" | "link";
  href?: string;
  size?: "sm" | "md" | "lg";
  color?: "white" | "gray";
  onClick?: () => void;
  children: ReactNode;
};

export function Link({
  type = "link",
  href,
  size = "md",
  color = "white",
  onClick,
  children,
}: Props) {
  const baseStyles =
    "-mx-2.5 -my-1.5 cursor-pointer rounded-sm px-2.5 py-1.5 font-medium transition duration-150";

  const sizeMap = {
    sm: "text-2xs",
    md: "text-base",
    lg: "text-xs",
  };

  const colorMap = {
    white: "text-grey hover:bg-grey-60 hover:text-light-blue",
    gray: "text-grey-blue hover:bg-grey-60 hover:text-grey",
  };

  const linkStyles = `${baseStyles} ${sizeMap[size]} ${colorMap[color]}`;

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
