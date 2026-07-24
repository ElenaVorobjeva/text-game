import { useEffect, useRef, useState } from "react";

export interface RouteAnimationProps {
  /** Форма маршрута (атрибут d). Замените на свой путь из SVG-редактора при желании. */
  d?: string;
  viewBox?: string;
  /** Размеры <svg> */
  width?: string;
  height?: string;
  /** Цвет линии и флажков */
  color?: string;
  /** Толщина линии */
  lineWidth?: number;
  /** Узор пунктира: длина штриха + длина пробела */
  dash?: string;
  /** Ширина маски (чуть больше lineWidth — влияет на пересечения петель) */
  maskWidth?: number;
  /** Скорость прорисовки (px пути за кадр) */
  speed?: number;
  /** Пауза у каждого флажка, мс */
  pause?: number;
  /** Позиции флажков как доли пути (0..1) */
  flagStops?: number[];
  /** Запуск при появлении блока в области видимости */
  autoPlay?: boolean;
  /** Перезапускать при каждом появлении */
  replayOnView?: boolean;
  /** Не перезапускать анимацию на мобильных (экономит батарею/GPU) */
  disableReplayOnMobile?: boolean;
  /** Брейкпоинт «мобильного», px (по ширине окна) */
  mobileBreakpoint?: number;
}

type Config = Required<RouteAnimationProps>;

const DEFAULTS: Config = {
  d:
    "M88,175 C60,320 150,455 305,470 C430,482 545,430 560,335 C572,255 505,240 470,300 " +
    "C440,352 500,405 585,395 C720,378 830,250 1000,225 C1080,214 1150,250 1150,320 " +
    "C1150,378 1095,405 1055,368 C1020,336 1060,275 1130,285 C1280,305 1380,250 1480,300 " +
    "C1560,340 1600,240 1638,120",
  viewBox: "0 0 1720 560",
  width: "100%",
  height: "auto",
  color: "#dcdfe9",
  lineWidth: 5,
  dash: "9 13",
  maskWidth: 8,
  speed: 5,
  pause: 700,
  flagStops: [0, 0.2, 0.5, 0.8, 1],
  autoPlay: true,
  replayOnView: false,
  disableReplayOnMobile: true,
  mobileBreakpoint: 768,
};

type FlagPoint = { x: number; y: number };

export default function RouteAnimation(props: RouteAnimationProps) {
  const cfg: Config = { ...DEFAULTS, ...props };

  const svgRef = useRef<SVGSVGElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number | null>(null);

  const [flags, setFlags] = useState<FlagPoint[]>([]);
  const [shownCount, setShownCount] = useState(0);
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    const mask = maskRef.current;
    const svg = svgRef.current;
    if (!mask || !svg) return;

    if (typeof mask.getTotalLength !== "function") return;

    const L = mask.getTotalLength();
    const markLens = cfg.flagStops.map((s) => s * L);

    setFlags(
      markLens.map((len) => {
        const pt = mask.getPointAtLength(Math.min(len, L - 0.01));
        return { x: pt.x, y: pt.y };
      }),
    );

    const setOffset = (offset: number): void => {
      mask.style.strokeDashoffset = `${offset}`;
    };

    const reset = (): void => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      mask.style.strokeDasharray = `${L} ${L}`;
      setOffset(L);
      setShownCount(0);
    };

    // Статичный результат без анимации: маршрут нарисован, все флажки на месте.
    const showStatic = (): void => {
      mask.style.strokeDasharray = "none";
      setOffset(0);
      setAnimated(false);
      setShownCount(markLens.length);
    };

    const run = (): void => {
      reset();
      let progress = 0;
      let paused = false;
      let next = 0;
      const frame = (): void => {
        if (!paused) {
          if (next < markLens.length && progress >= markLens[next]) {
            next += 1;
            setShownCount(next);
            paused = true;
            setTimeout(() => {
              paused = false;
            }, cfg.pause);
            rafRef.current = requestAnimationFrame(frame);
            return;
          }
          progress = Math.min(progress + cfg.speed, L);
          setOffset(L - progress);
        }
        if (progress < L || next < markLens.length)
          rafRef.current = requestAnimationFrame(frame);
      };
      rafRef.current = requestAnimationFrame(frame);
    };

    // Пользователь предпочитает меньше движения → показываем статичный маршрут.
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Мобильное устройство (по ширине окна).
    const isMobile =
      typeof window.matchMedia === "function" &&
      window.matchMedia(`(max-width: ${cfg.mobileBreakpoint}px)`).matches;
    // На мобильном по умолчанию не перезапускаем анимацию.
    const allowReplay =
      cfg.replayOnView && !(cfg.disableReplayOnMobile && isMobile);

    if (prefersReduced) {
      showStatic();
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    reset();

    let io: IntersectionObserver | undefined;
    if (cfg.autoPlay && "IntersectionObserver" in window) {
      let started = false;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && (allowReplay || !started)) {
              run();
              started = true;
            }
          });
        },
        { threshold: 0.4 },
      );
      io.observe(svg);
    } else {
      run();
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (io) io.disconnect();
    };
  }, [
    cfg.d,
    cfg.flagStops,
    cfg.speed,
    cfg.pause,
    cfg.autoPlay,
    cfg.replayOnView,
    cfg.disableReplayOnMobile,
    cfg.mobileBreakpoint,
  ]);

  return (
    <svg
      ref={svgRef}
      viewBox={cfg.viewBox}
      role="img"
      aria-label="Анимированный маршрут с флажками"
      style={{
        width: cfg.width,
        maxWidth: "100%",
        height: cfg.height,
        maxHeight: "fit-content",
        display: "block",
        background: "transparent",
      }}
    >
      <defs>
        {/* Маска-«шторка»: белым показываем нарисованную часть пути. Здесь #fff
            — механика маски (видимо/скрыто), а не цвет оформления. */}
        <mask id="routeReveal">
          <path
            ref={maskRef}
            d={cfg.d}
            fill="none"
            stroke="#fff"
            strokeWidth={cfg.maskWidth}
            strokeLinecap="round"
          />
        </mask>
      </defs>

      <path
        d={cfg.d}
        fill="none"
        stroke={cfg.color}
        strokeWidth={cfg.lineWidth}
        strokeDasharray={cfg.dash}
        strokeLinecap="round"
        mask="url(#routeReveal)"
      />

      <g>
        {flags.map((flag, i) => (
          <g key={i} transform={`translate(${flag.x},${flag.y})`}>
            <g
              style={{
                transformBox: "fill-box",
                transformOrigin: "bottom",
                transform: i < shownCount ? "scaleY(1)" : "scaleY(0)",
                opacity: i < shownCount ? 1 : 0,
                transition: animated
                  ? "transform .45s cubic-bezier(.34,1.6,.64,1), opacity .25s ease"
                  : "none",
              }}
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-34"
                stroke={cfg.color}
                strokeWidth="2.5"
              />
              <path d="M0,-34 L20,-29 L0,-24 Z" fill={cfg.color} />
              <circle cx="0" cy="0" r="4" fill={cfg.color} />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
