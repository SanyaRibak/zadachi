import { useCallback, useEffect, useState } from "react";
import {
  ALL_PEOPLE,
  initialData,
  MAX_PEOPLE,
  MAX_TASKS,
  parseBackup,
  priorities,
  STORAGE_KEY,
} from "../shared/model/data";

function read() {
  try {
    return parseBackup(localStorage.getItem(STORAGE_KEY));
  } catch {
    return initialData();
  }
}
export function useTaskData(notify) {
  const [data, setData] = useState(read);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      notify(
        "Не удалось сохранить данные в браузере. Скачайте резервную копию.",
      );
    }
  }, [data, notify]);
  const addTask = useCallback(({ title, person, priority }) => {
    setData((d) => {
      if (
        d.tasks.length >= MAX_TASKS ||
        !title.trim() ||
        title.length > 180 ||
        !d.people.includes(person) ||
        !Object.hasOwn(priorities, priority)
      )
        return d;
      return {
        ...d,
        tasks: [
          {
            id: crypto.randomUUID(),
            title: title.trim(),
            person,
            priority,
            done: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
          },
          ...d.tasks,
        ],
      };
    });
  }, []);
  const renameTask = useCallback((id, title) => {
    if (typeof title !== "string" || !title.trim() || title.length > 180)
      return;
    const nextTitle = title.trim();
    setData((d) => {
      const task = d.tasks.find((t) => t.id === id);
      if (!task || task.title === nextTitle) return d;
      return {
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === id ? { ...t, title: nextTitle } : t,
        ),
      };
    });
  }, []);
  const toggleTask = useCallback(
    (id) =>
      setData((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                done: !t.done,
                completedAt: t.done ? null : new Date().toISOString(),
              }
            : t,
        ),
      })),
    [],
  );
  const deleteTask = useCallback((id) => {
    if (confirm("Удалить задачу?"))
      setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
  }, []);
  const addPerson = useCallback(
    (name) =>
      setData((d) => {
        if (
          !name ||
          name.length > 40 ||
          name === ALL_PEOPLE ||
          d.people.includes(name) ||
          d.people.length >= MAX_PEOPLE
        )
          return d;
        return { ...d, people: [...d.people, name] };
      }),
    [],
  );
  return {
    data,
    addTask,
    toggleTask,
    renameTask,
    deleteTask,
    addPerson,
    restoreData: setData,
  };
}
