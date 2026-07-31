import { cn } from "../../utils/cn";

// Индетерминированный лоадер: расходящиеся по воде круги. Показывается, пока
// BootGate «грузит» данные. У индетерминированного лоадера времени запроса
// заранее нет, поэтому здесь бесконечная анимация, а не завязка на срок —
// сигналом «загрузка кончилась» служит размонтирование, а не таймер внутри.
//
// prefers-reduced-motion: motion-safe гасит анимацию — три кольца остаются
// одним статичным кругом. Подпись «Загрузка...» статична в любом случае.

// Общие классы кольца. Пивот — центр вьюпорта (transform-box: view-box +
// origin-center), обводка не толстеет при росте (non-scaling-stroke).
const ring =
  "origin-center fill-none stroke-light-blue stroke-2 [transform-box:view-box] [vector-effect:non-scaling-stroke] motion-safe:animate-ripple";

export function Loader() {
  return (
    <div
      role="progressbar"
      aria-label="Загрузка"
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6"
    >
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="size-[9.375rem] overflow-visible"
      >
        <circle cx="100" cy="100" r="80" className={cn(ring)} />
        <circle
          cx="100"
          cy="100"
          r="80"
          className={cn(ring, "[animation-delay:-1.833s]")}
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          className={cn(ring, "[animation-delay:-3.667s]")}
        />
      </svg>

      <p className="text-grey-blue text-base tracking-wide">Загрузка...</p>
    </div>
  );
}
