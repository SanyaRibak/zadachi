import { describe, expect, it } from "vitest";
import {
  normalizeData,
  parseBackup,
  MAX_FILE_BYTES,
} from "../src/shared/model/data";
import {
  countActive,
  filterTasks,
  selectScoped,
} from "../src/modules/tasks/selectors";
const task = {
  id: "1",
  title: "Дело",
  person: "Я",
  priority: "normal",
  done: false,
  createdAt: "2026-11-05T12:00:00.000Z",
  completedAt: null,
};
const backup = () => ({ people: ["Я", "Алексей"], tasks: [{ ...task }] });

describe("Untrusted backup data", () => {
  it("reads old BOM backups and migrates names", () => {
    const result = parseBackup("\ufeff" + JSON.stringify(backup()));
    expect(result.people).toEqual(["я", "не я 1"]);
    expect(result.tasks[0].person).toBe("я");
  });
  it.each([
    null,
    {},
    { people: [], tasks: [] },
    { people: ["Все исполнители"], tasks: [] },
  ])("rejects invalid shape: %j", (data) => {
    expect(() => normalizeData(data)).toThrow();
  });
  it.each([
    { priority: "__proto__" },
    { priority: ["normal"] },
    { priority: "constructor" },
    { title: "x".repeat(181) },
    { person: "unknown" },
    { createdAt: null },
    { done: true, completedAt: "invalid" },
  ])("rejects invalid fields: %j", (fields) => {
    const data = backup();
    Object.assign(data.tasks[0], fields);
    expect(() => normalizeData(data)).toThrow();
  });
  it("rejects null tasks and duplicate identifiers", () => {
    const data = backup();
    data.tasks.push(null);
    expect(() => normalizeData(data)).toThrow();
    data.tasks[1] = { ...task };
    expect(() => normalizeData(data)).toThrow();
  });
  it("does not resolve names through Object.prototype or copy extra properties", () => {
    const result = parseBackup(
      '{"people":["__proto__","constructor"],"tasks":[],"__proto__":{"polluted":true}}',
    );
    expect(result.people).toEqual(["__proto__", "constructor"]);
    expect(Object.hasOwn(result, "__proto__")).toBe(false);
    expect({}.polluted).toBeUndefined();
  });
  it("rejects oversized input", () => {
    expect(() => parseBackup(" ".repeat(MAX_FILE_BYTES + 1))).toThrow();
  });
});
it("filters tasks and counts active tasks in one pass", () => {
  const tasks = [
    task,
    { ...task, id: "2", done: true },
    { ...task, id: "3", person: "Алексей", priority: "high" },
  ];
  expect(countActive(tasks).get("Все исполнители")).toBe(2);
  expect(countActive(tasks).get("Я")).toBe(1);
  expect(selectScoped(tasks, "Я")).toHaveLength(2);
  expect(filterTasks(tasks, "active", "high")).toEqual([tasks[2]]);
});
