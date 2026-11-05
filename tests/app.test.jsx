// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App } from "../src/app/App";
import { download } from "../src/shared/lib/download";
vi.mock("../src/shared/lib/download", () => ({ download: vi.fn() }));
const sample = () => ({
  people: ["я", "Друг"],
  tasks: [
    {
      id: "1",
      title: "Первое дело",
      person: "я",
      priority: "normal",
      done: false,
      createdAt: "2026-11-05T12:00:00Z",
      completedAt: null,
    },
    {
      id: "2",
      title: "Второе дело",
      person: "Друг",
      priority: "high",
      done: false,
      createdAt: "2026-11-05T12:00:00Z",
      completedAt: null,
    },
  ],
});
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("dela-v1", JSON.stringify(sample()));
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

it("isolates form typing and only rerenders the changed task row", () => {
  const dates = vi.spyOn(Date.prototype, "toLocaleDateString");
  render(<App />);
  expect(dates).toHaveBeenCalledTimes(2);
  fireEvent.change(screen.getByLabelText("Что нужно сделать?"), {
    target: { value: "Черновик" },
  });
  fireEvent.change(screen.getByLabelText("Новый исполнитель"), {
    target: { value: "Третий" },
  });
  expect(dates).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByLabelText("Выполнено: Первое дело"));
  expect(dates).toHaveBeenCalledTimes(3);
  expect(JSON.parse(localStorage.getItem("dela-v1")).tasks[0].done).toBe(true);
});
it("adds, filters, deletes and persists tasks", () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText("Что нужно сделать?"), {
    target: { value: "Новое дело" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Добавить", exact: true }),
  );
  expect(screen.getByRole("heading", { name: "Новое дело" })).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Выполнено: Новое дело"));
  fireEvent.click(
    screen.getByRole("button", { name: "Выполненные", exact: true }),
  );
  expect(screen.queryByRole("heading", { name: "Первое дело" })).toBeNull();
  fireEvent.click(screen.getByLabelText("Удалить: Новое дело"));
  expect(JSON.parse(localStorage.getItem("dela-v1")).tasks).toHaveLength(2);
});
it("renders stored and imported HTML payloads as inert text", async () => {
  const payload = "<img src=x onerror=alert(1)><script>alert(1)</script>";
  const data = sample();
  data.tasks[0].title = payload;
  localStorage.setItem("dela-v1", JSON.stringify(data));
  const { container } = render(<App />);
  expect(screen.getByRole("heading", { name: payload })).toBeTruthy();
  expect(container.querySelector("img, script")).toBeNull();
  data.tasks[0].title = "<svg onload=alert(2)>";
  fireEvent.change(container.querySelector("input[type=file]"), {
    target: { files: [{ size: 500, text: async () => JSON.stringify(data) }] },
  });
  await screen.findByText("Данные восстановлены");
  expect(
    screen.getByRole("heading", { name: data.tasks[0].title }),
  ).toBeTruthy();
  expect(container.querySelector("svg, img, script")).toBeNull();
});
it("leaves existing data intact on invalid import", async () => {
  const { container } = render(<App />);
  fireEvent.change(container.querySelector("input[type=file]"), {
    target: { files: [{ size: 4, text: async () => "null" }] },
  });
  await screen.findByText(/Не удалось прочитать файл/);
  expect(JSON.parse(localStorage.getItem("dela-v1"))).toEqual(sample());
  expect(window.confirm).not.toHaveBeenCalled();
});
it("exports JSON and reports for the selected date range", async () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Скачать копию JSON" }));
  expect(JSON.parse(download.mock.calls[0][0])).toEqual(sample());
  fireEvent.click(screen.getByLabelText("Выполнено: Первое дело"));
  fireEvent.click(screen.getByRole("button", { name: "Отчёт за период" }));
  fireEvent.change(screen.getByLabelText("С даты"), {
    target: { value: "2020-01-01" },
  });
  fireEvent.change(screen.getByLabelText("По дату"), {
    target: { value: "2099-12-31" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Скачать TXT" }));
  await waitFor(() => expect(download).toHaveBeenCalledTimes(2));
  expect(download.mock.calls[1][0]).toContain("Выполнено: 1");
  expect(download.mock.calls[1][0]).toContain("Первое дело");
  expect(download.mock.calls[1][0]).not.toContain("Второе дело");
});

it.each(["Enter", "blur"])(
  "saves task title on %s and keeps other fields",
  (action) => {
    const { unmount } = render(<App />);
    fireEvent.doubleClick(screen.getByRole("heading", { name: "Первое дело" }));
    const input = screen.getByRole("textbox", {
      name: "Изменить название задачи",
    });
    expect(document.activeElement).toBe(input);
    expect(input.maxLength).toBe(180);
    fireEvent.change(input, { target: { value: "  Новое название  " } });
    expect(JSON.parse(localStorage.getItem("dela-v1"))).toEqual(sample());
    if (action === "Enter") fireEvent.keyDown(input, { key: "Enter" });
    else fireEvent.blur(input);
    expect(
      screen.queryByRole("textbox", { name: "Изменить название задачи" }),
    ).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Новое название" }),
    ).toBeTruthy();
    const saved = JSON.parse(localStorage.getItem("dela-v1"));
    expect(saved.tasks[0]).toEqual({
      ...sample().tasks[0],
      title: "Новое название",
    });
    expect(saved.tasks[1]).toEqual(sample().tasks[1]);
    unmount();
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Новое название" }),
    ).toBeTruthy();
  },
);

it("keeps original title when the edit is blank and renders edited HTML as text", () => {
  const { container } = render(<App />);
  const edit = (value) => {
    fireEvent.doubleClick(screen.getByRole("heading", { name: "Первое дело" }));
    const input = screen.getByRole("textbox", {
      name: "Изменить название задачи",
    });
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
  };
  edit("   ");
  expect(JSON.parse(localStorage.getItem("dela-v1"))).toEqual(sample());
  const payload = "<img src=x onerror=alert(1)>";
  edit(payload);
  expect(screen.getByRole("heading", { name: payload })).toBeTruthy();
  expect(container.querySelector("img")).toBeNull();
});

it("does not rerender the other row during editing or saving", () => {
  const dates = vi.spyOn(Date.prototype, "toLocaleDateString");
  render(<App />);
  dates.mockClear();
  fireEvent.doubleClick(screen.getByRole("heading", { name: "Первое дело" }));
  expect(dates).toHaveBeenCalledTimes(1);
  const input = screen.getByRole("textbox", {
    name: "Изменить название задачи",
  });
  dates.mockClear();
  fireEvent.change(input, { target: { value: "Обновлено" } });
  expect(dates).toHaveBeenCalledTimes(1);
  dates.mockClear();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(dates).toHaveBeenCalledTimes(1);
});
