import React, { memo, useState } from "react";
import { priorities } from "../../shared/model/data";

export const TaskRow = memo(function TaskRow({
  task: t,
  onToggle,
  onDelete,
  onRename,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  function startEditing() {
    setDraft(t.title);
    setEditing(true);
  }
  function save() {
    onRename(t.id, draft);
    setEditing(false);
  }
  return (
    <article className={t.done ? "done" : ""}>
      <input
        type="checkbox"
        checked={t.done}
        onChange={() => onToggle(t.id)}
        aria-label={"Выполнено: " + t.title}
      />
      <div className="task-content">
        {editing ? (
          <input
            className="task-title-input"
            aria-label="Изменить название задачи"
            autoFocus
            maxLength={180}
            value={draft}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          />
        ) : (
          <h3
            tabIndex={0}
            title="Двойной клик или Enter — изменить название"
            onDoubleClick={startEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                startEditing();
              }
            }}
          >
            {t.title}
          </h3>
        )}
        <p>
          {t.person}
          <span>·</span>
          {t.done
            ? "Выполнено " + new Date(t.completedAt).toLocaleDateString("ru-RU")
            : "Добавлено " + new Date(t.createdAt).toLocaleDateString("ru-RU")}
        </p>
      </div>
      <span className={"priority " + t.priority}>{priorities[t.priority]}</span>
      <button
        className="delete"
        aria-label={"Удалить: " + t.title}
        onClick={() => onDelete(t.id)}
      >
        ×
      </button>
    </article>
  );
});
