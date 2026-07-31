import { useEffect, useState, type ReactNode } from "react";

import { Loader } from "../components/base/Loader";

// Имитация загрузки всех данных пользователя и игры «с сервера». Сейчас данные
// лежат в localStorage и читаются мгновенно, поэтому «сервер» подделан
// таймаутом: пока он идёт, показываем полосу загрузки, затем монтируем игру
// (провайдеры читают localStorage уже в своих инициализаторах). Когда появится
// настоящий бэкенд, здесь будет реальный fetch, а провайдеры получат данные.
const SERVER_LATENCY_MS = 3000;

type Props = {
  children: ReactNode;
};

export function BootGate({ children }: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), SERVER_LATENCY_MS);

    return () => clearTimeout(id);
  }, []);

  if (!loaded) return <Loader />;

  return <>{children}</>;
}
