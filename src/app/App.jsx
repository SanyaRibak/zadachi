import React, { useCallback, useMemo, useState } from "react";
import { ALL_PEOPLE, MAX_TASKS } from "../shared/model/data";
import { useTaskData } from "./useTaskData";
import { countActive, selectScoped } from "../modules/tasks/selectors";
import { TaskPanel } from "../modules/tasks/TaskPanel";
import { TaskComposer } from "../modules/tasks/TaskComposer";
import { PeopleSidebar } from "../modules/people/PeopleSidebar";
import { ReportForm } from "../modules/reports/ReportForm";
import { BackupControls } from "../modules/backup/BackupControls";

export function App() {
  const [message, setMessage] = useState("");
  const {
    data,
    addTask,
    toggleTask,
    deleteTask,
    renameTask,
    addPerson,
    restoreData,
  } = useTaskData(setMessage);
  const [person, setPerson] = useState(ALL_PEOPLE);
  const [report, setReport] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState(0);
  const scoped = useMemo(
    () => selectScoped(data.tasks, person),
    [data.tasks, person],
  );
  const counts = useMemo(() => countActive(data.tasks), [data.tasks]);
  const remaining = counts.get(person) ?? 0;
  const onRestore = useCallback(
    (restored) => {
      restoreData(restored);
      setPerson(ALL_PEOPLE);
      setRestoreVersion((v) => v + 1);
    },
    [restoreData],
  );
  return (
    <div className="app">
      <PeopleSidebar
        people={data.people}
        counts={counts}
        person={person}
        setPerson={setPerson}
        onAdd={addPerson}
        setMessage={setMessage}
      />
      <main>
        <header>
          <div>
            <h1>{person === ALL_PEOPLE ? "Все дела" : person}</h1>
            <p className="muted">
              Осталось {remaining} · Выполнено {scoped.length - remaining}
            </p>
          </div>
          <button onClick={() => setReport((v) => !v)} aria-expanded={report}>
            Отчёт за период
          </button>
        </header>
        {report && (
          <ReportForm scoped={scoped} person={person} setMessage={setMessage} />
        )}
        <div className="workspace">
          <TaskPanel
            scoped={scoped}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onRename={renameTask}
          />
          <TaskComposer
            key={restoreVersion}
            people={data.people}
            onAdd={addTask}
            setMessage={setMessage}
            atLimit={data.tasks.length >= MAX_TASKS}
          />
        </div>
        <BackupControls
          data={data}
          onRestore={onRestore}
          setMessage={setMessage}
        />
        <p className="notice" role="status">
          {message}
        </p>
      </main>
    </div>
  );
}
