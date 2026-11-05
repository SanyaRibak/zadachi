import { ALL_PEOPLE } from "../../shared/model/data.js";
export function selectScoped(tasks, person) {
  return person === ALL_PEOPLE
    ? tasks
    : tasks.filter((t) => t.person === person);
}
export function countActive(tasks) {
  const counts = new Map([[ALL_PEOPLE, 0]]);
  for (const task of tasks)
    if (!task.done) {
      counts.set(ALL_PEOPLE, counts.get(ALL_PEOPLE) + 1);
      counts.set(task.person, (counts.get(task.person) ?? 0) + 1);
    }
  return counts;
}
export function filterTasks(tasks, status, priority) {
  return tasks.filter(
    (t) =>
      (status === "all" || (status === "done" ? t.done : !t.done)) &&
      (priority === "all" || t.priority === priority),
  );
}
