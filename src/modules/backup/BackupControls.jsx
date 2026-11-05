import React, { memo, useState, useRef } from "react";

import { MAX_FILE_BYTES, parseBackup } from "../../shared/model/data";
import { download } from "../../shared/lib/download";

export const BackupControls = memo(function BackupControls({
  data,
  onRestore,
  setMessage,
}) {
  const file = useRef(null);
  const [busy, setBusy] = useState(false);
  async function restore(e) {
    const input = e.currentTarget;
    const selected = input.files?.[0];
    input.value = "";
    if (!selected || busy) return;
    setBusy(true);
    try {
      if (selected.size > MAX_FILE_BYTES) throw new Error("File too large");
      const restored = parseBackup(await selected.text());
      if (!confirm("Заменить текущие задачи данными из файла?")) return;
      onRestore(restored);
      setMessage("Данные восстановлены");
    } catch {
      setMessage(
        "Не удалось прочитать файл. Выберите корректную резервную копию JSON до 5 МБ.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="storage">
      <span>Сохранение в этом браузере</span>
      <button
        onClick={() =>
          download(
            JSON.stringify(data, null, 2),
            "Задачи.json",
            "application/json",
          )
        }
      >
        Скачать копию JSON
      </button>
      <button disabled={busy} onClick={() => file.current.click()}>
        Загрузить копию
      </button>
      <input hidden ref={file} type="file" accept=".json" onChange={restore} />
    </div>
  );
});
