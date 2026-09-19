type Props = {
  className?: string;
  label: string;
};

// Заглушка для изображения в карточке: вместо иллюстрации — знак вопроса,
// чтобы не спойлерить содержание главы или концовки.
// Цвета из палитры проекта (main.css): фон dark-blue, рамка/знак — grey-blue.
// Квадрат под aspect-square карточки.
//
// label обязателен: у svg с role="img" это единственное доступное имя, и без
// него скринридер прочитает все закрытые карточки одинаково.
export function ImagePlaceholder({ className = "", label }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
    >
      <rect width="100" height="100" rx="6" fill="#12172a" />

      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="4"
        fill="none"
        stroke="#767fa0"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />

      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Playfair Display Variable', serif"
        fontSize="52"
        fontStyle="italic"
        fill="#767fa0"
      >
        ?
      </text>
    </svg>
  );
}
