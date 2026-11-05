export const STORAGE_KEY = "dela-v1";
export const ALL_PEOPLE = "Все исполнители";
export const priorities = Object.freeze({
  high: "Высокий",
  normal: "Обычный",
  low: "Низкий",
});
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_TASKS = 10000;
export const MAX_PEOPLE = 200;
export const initialData = () => ({
  people: ["я", "не я 1", "не я 2"],
  tasks: [],
});
const aliases = new Map(
  Object.entries({
    Я: "я",
    Алексей: "не я 1",
    Мария: "не я 2",
    "Не я 1": "не я 1",
    "Не я 2": "не я 2",
  }),
);
const rename = (name) => aliases.get(name) ?? name;
const text = (value, max) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;
const date = (value) =>
  typeof value === "string" &&
  value.length <= 40 &&
  Number.isFinite(Date.parse(value));

// Treat storage and imported files as untrusted. Copy only known fields.
// User text is kept as text and must only be rendered via React interpolation.
export function normalizeData(value) {
  if (
    !value ||
    !Array.isArray(value.people) ||
    !value.people.length ||
    value.people.length > MAX_PEOPLE ||
    !value.people.every((p) => text(p, 40) && p !== ALL_PEOPLE) ||
    new Set(value.people).size !== value.people.length ||
    !Array.isArray(value.tasks) ||
    value.tasks.length > MAX_TASKS
  )
    throw new Error("Invalid backup");
  const peopleSet = new Set(value.people);
  const ids = new Set();
  const tasks = value.tasks.map((task) => {
    if (
      !task ||
      !text(task.id, 128) ||
      ids.has(task.id) ||
      !text(task.title, 180) ||
      !peopleSet.has(task.person) ||
      typeof task.priority !== "string" ||
      !Object.hasOwn(priorities, task.priority) ||
      typeof task.done !== "boolean" ||
      !date(task.createdAt) ||
      (task.done && !date(task.completedAt))
    ) {
      throw new Error("Invalid task");
    }
    ids.add(task.id);
    return {
      id: task.id,
      title: task.title,
      person: rename(task.person),
      priority: task.priority,
      done: task.done,
      createdAt: task.createdAt,
      completedAt: task.done ? task.completedAt : null,
    };
  });
  return { people: [...new Set(value.people.map(rename))], tasks };
}

export function parseBackup(raw) {
  if (typeof raw !== "string" || new Blob([raw]).size > MAX_FILE_BYTES)
    throw new Error("Backup too large");
  return normalizeData(JSON.parse(raw.replace(/^\uFEFF/, "")));
}
