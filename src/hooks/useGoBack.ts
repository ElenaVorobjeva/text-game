import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

// Переход назад по истории браузера: так стек не засоряется. Если истории нет
// (прямой заход по ссылке), идём по запасному адресу.
export function useGoBack(fallbackUrl: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.key !== "default") navigate(-1);
    else navigate(fallbackUrl);
  }, [navigate, location.key, fallbackUrl]);
}
