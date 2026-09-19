import { useEffect } from "react";

// Заголовок вкладки для экранов SPA: без него на любом роуте остаётся один и
// тот же title, и скринридер не слышит, что экран сменился.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
