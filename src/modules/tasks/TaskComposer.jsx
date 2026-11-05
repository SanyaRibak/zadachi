import React, { memo, useState, useRef } from "react";
import { priorities, MAX_TASKS } from "../../shared/model/data";

export const TaskComposer = memo(function TaskComposer({
  people,
  onAdd,
  setMessage,
  atLimit,
}) {
  const [title, setTitle] = useState(""),
    [selected, setAssigned] = useState(people[0]),
    [level, setLevel] = useState("normal");
  const assigned = people.includes(selected) ? selected : people[0];
  const input = useRef(null);
  function add(e) {
    e.preventDefault();
    if (!title.trim()) {
      setMessage("Введите название задачи.");
      input.current.focus();
      return;
    }
    if (atLimit) {
      setMessage("Достигнут лимит задач: " + MAX_TASKS);
      return;
    }
    onAdd({ title, person: assigned, priority: level });
    setTitle("");
    setMessage("Задача добавлена");
    input.current.focus();
  }
  return (
    <section className="composer">
      <h2>Новая задача</h2>
      <form onSubmit={add}>
        <label htmlFor="title">Что нужно сделать?</label>
        <input
          ref={input}
          autoFocus
          id="title"
          value={title}
          maxLength={180}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название задачи"
        />
        <div className="form-bottom">
          <label>
            Исполнитель
            <select
              value={assigned}
              onChange={(e) => setAssigned(e.target.value)}
            >
              {people.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Приоритет
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              {Object.entries(priorities).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" type="submit">
            Добавить
          </button>
        </div>
      </form>
    </section>
  );
});
