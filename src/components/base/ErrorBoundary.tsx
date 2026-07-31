import { Component, type ErrorInfo, type ReactNode } from "react";

import { clearAllSaves } from "../../utils/saveLoad";

import { Button } from "./Button";
import { Description } from "./Description";
import { Heading } from "./Heading";
import { Main } from "./Main";
import { Row } from "./Row";

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
        <Main className="gap-5.5">
          <Heading>Что-то пошло не так</Heading>

          <Description>
            Игра не смогла продолжиться. Обычно достаточно перезагрузить
            страницу — прогресс сохранится.
          </Description>

          {/* Перезагрузка идёт первой: упасть мог любой компонент, и стирать
              из-за этого прогресс незачем. Сброс — второй, явно опасный шаг. */}
          <Row>
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
                clearAllSaves();
                window.location.reload();
              }}
            >
              Начать заново и стереть сохранение
            </Button>
          </Row>
        </Main>
      </div>
    );
  }
}
