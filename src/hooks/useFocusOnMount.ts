import { useEffect, useRef } from "react";

// Переносит фокус на элемент при монтировании. Экраны игры пересоздаются через
// key={scene.id}, и кнопка, на которой стоял фокус, исчезает вместе со сценой:
// без переноса фокус падает в body, а скринридер не объявляет новый текст.
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return ref;
}
