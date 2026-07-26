import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Токены из @theme, чьих имён нет в стоковом Tailwind. Без регистрации
// tailwind-merge не считает их конфликтующими и оставляет оба класса:
// `leading-normal leading-free` дошло бы до DOM как есть.
// Остальную кастомную шкалу (--text-md, --text-2xs, цвета) он разбирает сам —
// имена совпадают с формой стоковых.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      leading: ["leading-free"],
      animate: ["animate-fade-up", "animate-scale-in"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
