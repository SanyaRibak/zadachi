import React, { memo, useMemo, useState } from "react";
import { priorities } from "../../shared/model/data";
import { TaskRow } from "./TaskRow";
import { filterTasks } from "./selectors";

export const TaskPanel = memo(function TaskPanel({
  scoped,
  onToggle,
  onDelete,
  onRename,
}) {
  const [status, setStatus] = useState("all"),
    [priority, setPriority] = useState("all");
  const tasks = useMemo(
    () => filterTasks(scoped, status, priority),
    [scoped, status, priority],
  );
  return (
    <div className="task-panel">
      <div className="filters">
        <div className="tabs">
          {[
            ["all", "Все"],
            ["active", "Активные"],
            ["done", "Выполненные"],
          ].map(([k, v]) => (
            <button
              key={k}
              aria-pressed={status === k}
              className={status === k ? "active" : ""}
              onClick={() => setStatus(k)}
            >
              {v}
            </button>
          ))}
        </div>
        <select
          aria-label="Фильтр по приоритету"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="all">Любой приоритет</option>
          {Object.entries(priorities).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <section aria-label="Задачи" className="list">
        {tasks.length ? (
          tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={onToggle}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))
        ) : (
          <div className="empty">
            <h2>Задач пока нет</h2>
            <p>Добавьте первую задачу в форме «Новая задача».</p>
          </div>
        )}
      </section>
    </div>
  );
});
