type Props = {
  variant?: "filled" | "bordered" | "outlined";
  size?: "sm" | "md" | "lg";
  color?: "white" | "gray";
  width?: "auto" | "full" | "grow" | "fullOnMobile";
  onClick: () => void;
  children: React.ReactNode;
};

export default function Button({
  variant = "filled",
  size = "md",
  color = "white",
  width = "auto",
  onClick,
  children,
}: Props) {
  const variantsMap = {
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

  const sizeMap = {
    sm: "px-[1.375rem] py-[0.8125rem] text-[0.9375rem]",
    md: "px-[1.875rem] py-3.5 text-[0.9375rem] font-semibold",
    lg: "px-8 py-4 text-xs font-semibold",
  };

  const widthMap = {
    auto: "",
    full: "w-full",
    grow: "grow",
    fullOnMobile: "w-full sm:w-auto",
  };

  const buttonStyles = `${variantsMap[variant][color]} ${sizeMap[size]} ${widthMap[width]} cursor-pointer transition duration-150`;

  return (
    <button className={buttonStyles} onClick={onClick}>
      {children}
    </button>
  );
}
