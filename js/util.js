export function $(sel, root) {
  return (root || document).querySelector(sel);
}

export function $$(sel, root) {
  return Array.from((root || document).querySelectorAll(sel));
}

export function enableDragScroll(el) {
  if (!el || el.dataset.dragScrollBound) return;
  el.dataset.dragScrollBound = "1";
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startScroll = 0;

  el.addEventListener("mousedown", (e) => {
    isDown = true;
    dragged = false;
    startX = e.pageX;
    startScroll = el.scrollLeft;
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 3) {
      dragged = true;
      el.classList.add("dragging");
    }
    el.scrollLeft = startScroll - dx;
  });
  window.addEventListener("mouseup", () => {
    isDown = false;
    el.classList.remove("dragging");
  });
  el.addEventListener(
    "click",
    (e) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    },
    true
  );
}

export function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let seq = 1;
export function nextId(prefix) {
  return prefix + "-" + Date.now().toString(36) + "-" + seq++;
}

export function slugify(text) {
  const s = String(text || "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "id";
}

export function uniqueId(base, used) {
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = base + "-" + n;
    n++;
  }
  used.add(id);
  return id;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 2500);
}

export function canSharePdf(file) {
  if (!navigator.share || !navigator.canShare || typeof File === "undefined") {
    return false;
  }
  try {
    const probe =
      file || new File(["%PDF-1.0"], "probe.pdf", { type: "application/pdf" });
    return navigator.canShare({ files: [probe] });
  } catch (err) {
    return false;
  }
}

export async function sharePdfFile(file, title, text) {
  const full = { files: [file], title: title, text: text };
  if (navigator.canShare(full)) {
    await navigator.share(full);
    return true;
  }
  const filesOnly = { files: [file], title: title };
  if (navigator.canShare(filesOnly)) {
    await navigator.share(filesOnly);
    return true;
  }
  return false;
}
