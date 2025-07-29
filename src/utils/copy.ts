function copyLegacy(str: string) {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.style.top = "-9999px";
  document.body.appendChild(el);
  const selected = document.getSelection()!.rangeCount > 0 ? document.getSelection()!.getRangeAt(0) : false;
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  if (selected) {
    document.getSelection()!.removeAllRanges();
    document.getSelection()!.addRange(selected);
  }
}

async function copy(str: string) {
  if (!("clipboard" in navigator)) {
    copyLegacy(str);
  }
  try {
    await navigator.clipboard.writeText(str);
  } catch (_) {
    copyLegacy(str);
  }
}

export { copy, copyLegacy as default };
