export function download(content, name, type) {
  const url = URL.createObjectURL(new Blob(["\ufeff", content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
