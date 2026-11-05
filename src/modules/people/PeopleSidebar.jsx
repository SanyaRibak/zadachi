import React, { memo, useState } from "react";
import { ALL_PEOPLE, MAX_PEOPLE } from "../../shared/model/data";

export const PeopleSidebar = memo(function PeopleSidebar({
  people,
  counts,
  person,
  setPerson,
  onAdd,
  setMessage,
}) {
  const [newPerson, setNewPerson] = useState("");
  return (
    <aside>
      <div className="assignees">
        <h2>Исполнители</h2>
        {["Все исполнители", ...people].map((p) => (
          <button
            key={p}
            className={"person " + (person === p ? "selected" : "")}
            onClick={() => setPerson(p)}
          >
            <span>{p}</span>
            <small>{counts.get(p) ?? 0}</small>
          </button>
        ))}
      </div>
      <form
        className="people-form"
        onSubmit={(e) => {
          e.preventDefault();
          const p = newPerson.trim();
          if (
            !p ||
            people.includes(p) ||
            p === ALL_PEOPLE ||
            people.length >= MAX_PEOPLE
          ) {
            setMessage("Введите новое имя исполнителя");
            return;
          }
          onAdd(p);
          setNewPerson("");
        }}
      >
        <label htmlFor="person">Новый исполнитель</label>
        <div className="inline">
          <input
            id="person"
            value={newPerson}
            maxLength={40}
            onChange={(e) => setNewPerson(e.target.value)}
            placeholder="Имя"
            required
          />
          <button aria-label="Добавить исполнителя">+</button>
        </div>
      </form>
    </aside>
  );
});
