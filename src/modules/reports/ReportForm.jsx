import React, { memo, useState } from "react";
import { priorities } from "../../shared/model/data";
import { download } from "../../shared/lib/download";

export const ReportForm = memo(function ReportForm({
  scoped,
  person,
  setMessage,
}) {
  const [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  function exportReport(e) {
    e.preventDefault();
    if (!from || !to || from > to) {
      setMessage("Укажите корректный период отчёта.");
      return;
    }
    const rows = scoped.filter(
      (t) =>
        t.done &&
        t.completedAt &&
        new Date(t.completedAt) >= new Date(from + "T00:00:00") &&
        new Date(t.completedAt) <= new Date(to + "T23:59:59.999"),
    );
    const text = [
      "ОТЧЁТ О ВЫПОЛНЕНИИ ЗАДАЧ",
      `Период: ${from} - ${to}`,
      `Исполнитель: ${person}`,
      `Выполнено: ${rows.length}`,
      "",
      ...rows.map(
        (t, i) =>
          `${i + 1}. ${t.title}\nИсполнитель: ${t.person}. Приоритет: ${priorities[t.priority]}.\nВыполнено: ${new Date(t.completedAt).toLocaleString("ru-RU")}.\n`,
      ),
    ];
    download(
      text.join("\n"),
      `Отчёт_${from}_${to}.txt`,
      "text/plain;charset=utf-8",
    );
    setMessage("Отчёт скачан");
  }
  return (
    <form className="report" onSubmit={exportReport}>
      <label>
        С даты
        <input
          type="date"
          required
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </label>
      <label>
        По дату
        <input
          type="date"
          required
          min={from}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </label>
      <button className="primary">Скачать TXT</button>
      <p>Выполненные задачи выбранного исполнителя за указанный период.</p>
    </form>
  );
});
