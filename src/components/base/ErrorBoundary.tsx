import { Component, type ErrorInfo, type ReactNode } from "react";
import { clearSave } from "../../utils/saveLoad";
import Button from "./Button";

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Последний рубеж: любое исключение в рендере иначе оставляет пустую страницу
// без единого сообщения, и игрок не понимает, сломалось что-то или не загрузилось.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Не удалось отрисовать игру:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    // Обёртка дублирует layout из App: экран ошибки рендерится вместо него,
    // а фон и шрифт на body не заданы.
    return (
      <div className="font-text text-light-blue flex min-h-screen flex-col bg-black">
        <main className="flex grow flex-col items-center justify-center gap-5.5 p-6 text-center">
          <h1 className="font-heading text-light-blue text-xl leading-tight">
            Что-то пошло не так
          </h1>

          <p className="leading-free text-grey-blue max-w-[37.5rem] text-[0.9375rem]">
            Игра не смогла продолжиться. Обычно достаточно перезагрузить
            страницу — прогресс сохранится.
          </p>

          {/* Перезагрузка идёт первой: упасть мог любой компонент, и стирать
              из-за этого прогресс незачем. Сброс — второй, явно опасный шаг. */}
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
            <Button
              size="lg"
              width="fullOnMobile"
              onClick={() => window.location.reload()}
            >
              Перезагрузить
            </Button>

            <Button
              variant="bordered"
              size="sm"
              width="fullOnMobile"
              onClick={() => {
                clearSave();
                window.location.reload();
              }}
            >
              Начать заново и стереть сохранение
            </Button>
          </div>
        </main>
      </div>
    );
  }
}
