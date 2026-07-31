// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { SERVER_LATENCY_MS } from "../user/userProfile";

import { BootGate } from "./BootGate";

// «Загрузка с сервера» подделана таймаутом, поэтому время в тесте — фейковое:
// проверяем, что до срабатывания видна полоса, а после — дети.
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("BootGate", () => {
  test("shows the loader first and the children only after the delay", async () => {
    render(<BootGate>{() => <div>игра</div>}</BootGate>);

    // До истечения задержки — полоса загрузки, детей ещё нет.
    expect(screen.getByRole("progressbar")).toBeTruthy();
    expect(screen.queryByText("игра")).toBeNull();

    // Прокручиваем «загрузку» до конца.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SERVER_LATENCY_MS);
    });

    expect(screen.getByText("игра")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
