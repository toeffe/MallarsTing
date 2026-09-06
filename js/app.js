import { ROUTES, STATUS, STATUS_LABEL } from "./data.js";

const CATEGORY_KEY = "inspectra_category";
const DONE_KEY = "inspectra_done";

const state = {
  userId: localStorage.getItem("inspectra_user") || "",
  category: localStorage.getItem(CATEGORY_KEY) || "maskiner",
  currentRoute: null,
  currentMachineIdx: null,
  results: {},
  photoTarget: null,
  lastReport: null,
  lastPdf: null,
};

function categoryLabel(cat) {
  return cat === "rengoring" ? "Rengøring" : "Maskiner";
}

function isCleaning(route) {
  return (route || state.currentRoute || {}).category === "rengoring";
}

function checkChoices(route) {
  if (isCleaning(route)) {
    return [
      { id: STATUS.DONE, label: "Udført", cls: "ok" },
      { id: STATUS.SKIP, label: "Ikke aktuelt", cls: "worn" },
      { id: STATUS.ISSUE, label: "Afvigelse", cls: "critical" },
    ];
  }
  return [
    { id: STATUS.OK, label: "OK", cls: "ok" },
    { id: STATUS.WORN, label: "Slidt", cls: "worn" },
    { id: STATUS.CRITICAL, label: "Kritisk", cls: "critical" },
  ];
}

function itemNoun(route) {
  return isCleaning(route) ? "områder" : "maskiner";
}

function periodKey(schedule, date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (schedule === "weekly") {
    const t = new Date(y, d.getMonth(), d.getDate());
    const dow = t.getDay() || 7;
    t.setDate(t.getDate() + 4 - dow);
    const weekYear = t.getFullYear();
    const yearStart = new Date(weekYear, 0, 1);
    const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
    return weekYear + "-W" + String(week).padStart(2, "0");
  }
  if (schedule === "monthly") return y + "-" + m;
  if (schedule === "yearly") return String(y);
  return y + "-" + m + "-" + day;
}

function loadDoneMap() {
  try {
    const raw = JSON.parse(localStorage.getItem(DONE_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch (err) {
    return {};
  }
}

function isRouteDone(route) {
  if (!route || !state.userId) return false;
  const rec = (loadDoneMap()[state.userId] || {})[route.id];
  return !!(rec && rec.period === periodKey(route.schedule));
}

function markRouteDone(route) {
  if (!route || !state.userId) return;
  const all = loadDoneMap();
  if (!all[state.userId]) all[state.userId] = {};
  all[state.userId][route.id] = {
    period: periodKey(route.schedule),
    at: new Date().toISOString(),
  };
  localStorage.setItem(DONE_KEY, JSON.stringify(all));
}

function needsPhoto(status) {
  return status === STATUS.WORN || status === STATUS.CRITICAL;
}

function needsNote(status) {
  return (
    status === STATUS.WORN ||
    status === STATUS.CRITICAL ||
    status === STATUS.ISSUE
  );
}

function showsNoteArea(status) {
  return needsNote(status);
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showView(id) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  window.scrollTo(0, 0);
}

/* ── Theme ─────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("inspectra_theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(cur === "dark" ? "light" : "dark");
}

const savedTheme =
  localStorage.getItem("inspectra_theme") ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
applyTheme(savedTheme);

document.querySelectorAll(".theme-toggle").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleTheme();
  });
});

/* ── Login ─────────────────────────────────────────── */
$("#login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = $("#user-id").value.trim();
  if (!id) return;
  state.userId = id;
  localStorage.setItem("inspectra_user", id);
  $("#user-label").textContent = id;
  renderRoutes();
  showView("view-dashboard");
});

$("#btn-logout").addEventListener("click", () => {
  localStorage.removeItem("inspectra_user");
  state.userId = "";
  showView("view-login");
});

if (state.userId) {
  $("#user-id").value = state.userId;
  $("#user-label").textContent = state.userId;
  renderRoutes();
  showView("view-dashboard");
} else {
  showView("view-login");
}

/* ── Routes ────────────────────────────────────────── */
$("#schedule-filter").addEventListener("change", renderRoutes);

document.querySelectorAll(".category-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.category = btn.dataset.category;
    localStorage.setItem(CATEGORY_KEY, state.category);
    renderRoutes();
  });
});

function scheduleLabel(s) {
  const map = { daily: "Daglig", weekly: "Ugentlig", monthly: "Månedlig", yearly: "Årlig" };
  return map[s] || s;
}

function renderRoutes() {
  const filter = $("#schedule-filter").value;
  const list = $("#route-list");
  const mapPanel = $("#rengoring-map");
  list.innerHTML = "";

  $$(".category-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === state.category);
  });

  if (mapPanel) {
    mapPanel.classList.toggle("hidden", state.category !== "rengoring");
  }

  const filtered = ROUTES.filter((r) => {
    const catOk = (r.category || "maskiner") === state.category;
    const schedOk = filter === "all" || r.schedule === filter;
    return catOk && schedOk;
  });

  if (filtered.length === 0) {
    list.innerHTML =
      '<p style="color:var(--text-muted);text-align:center;padding:24px">Ingen ruter for denne plan.</p>';
    return;
  }

  filtered.forEach((route) => {
    const card = document.createElement("div");
    const done = isRouteDone(route);
    card.className = "route-card" + (done ? " done" : "");

    const h3 = document.createElement("h3");
    h3.textContent = route.name;
    card.appendChild(h3);

    const desc = document.createElement("p");
    desc.style.cssText = "font-size:0.85rem;color:var(--text-muted)";
    desc.textContent = route.description;
    card.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "route-meta";
    const s1 = document.createElement("span");
    s1.textContent = route.machines.length + " " + itemNoun(route);
    const s2 = document.createElement("span");
    s2.className = "sched-tag";
    s2.textContent = scheduleLabel(route.schedule);
    meta.appendChild(s1);
    meta.appendChild(s2);
    if (route.zoneLabel) {
      const s3 = document.createElement("span");
      s3.textContent = route.zoneLabel;
      meta.appendChild(s3);
    }
    if (done) {
      const sDone = document.createElement("span");
      sDone.className = "done-tag";
      sDone.textContent = "Udført";
      meta.appendChild(sDone);
    }
    card.appendChild(meta);

    card.addEventListener("click", () => startRoute(route));
    list.appendChild(card);
  });
}

/* ── Start route ───────────────────────────────────── */
function startRoute(route) {
  state.currentRoute = route;
  state.results = {};
  route.machines.forEach((m) => {
    state.results[m.id] = { checks: {} };
  });
  $("#route-title").textContent = route.name;
  renderMachineSteps();
  showView("view-route");
}

$("#btn-back-routes").addEventListener("click", () => {
  renderRoutes();
  showView("view-dashboard");
});

function renderMachineSteps() {
  const container = $("#machine-steps");
  container.innerHTML = "";
  const route = state.currentRoute;
  let doneCount = 0;

  route.machines.forEach((machine, idx) => {
    const res = state.results[machine.id];
    const checks = Object.values(res.checks);
    const isDone =
      checks.length === machine.checks.length && checks.every((c) => c.status);
    const hasIssue = checks.some(
      (c) => c.status === STATUS.CRITICAL || c.status === STATUS.ISSUE
    );
    const hasWarn = checks.some(
      (c) => c.status === STATUS.WORN || c.status === STATUS.SKIP
    );
    if (isDone) doneCount++;

    let cls = "machine-card";
    if (hasIssue) cls += " critical";
    else if (hasWarn) cls += " worn";
    else if (isDone) cls += " done";

    const statusIcon = hasIssue ? "!" : hasWarn ? "–" : isDone ? "✓" : String(idx + 1);

    const card = document.createElement("div");
    card.className = cls;

    const statusEl = document.createElement("div");
    statusEl.className = "machine-status";
    statusEl.textContent = statusIcon;
    card.appendChild(statusEl);

    const info = document.createElement("div");
    info.className = "machine-info";
    const h3 = document.createElement("h3");
    h3.textContent = machine.name;
    const p = document.createElement("p");
    p.textContent =
      machine.location +
      " · " +
      machine.checks.length +
      (isCleaning(route) ? " opgaver" : " kontrolpunkter");
    info.appendChild(h3);
    info.appendChild(p);
    card.appendChild(info);

    card.addEventListener("click", () => openMachine(idx));
    container.appendChild(card);
  });

  const total = route.machines.length;
  $("#route-progress").textContent =
    doneCount + " / " + total + " " + itemNoun(route);
  $("#progress-fill").style.width = (doneCount / total) * 100 + "%";
  $("#btn-finish-route").disabled = doneCount < total;
}

/* ── Machine detail ────────────────────────────────── */
function openMachine(idx) {
  state.currentMachineIdx = idx;
  const machine = state.currentRoute.machines[idx];
  $("#machine-title").textContent = machine.name;
  $("#machine-location").textContent = machine.location;
  renderCheckItems(machine);
  showView("view-machine");
}

$("#btn-back-machines").addEventListener("click", () => {
  renderMachineSteps();
  showView("view-route");
});

function renderCheckItems(machine) {
  const container = $("#check-items");
  container.innerHTML = "";
  const stored = state.results[machine.id].checks;

  machine.checks.forEach((check) => {
    const data = stored[check.id] || {
      status: null,
      note: "",
      photo: null,
      flagReplace: false,
    };
    const needsDoc = showsNoteArea(data.status);

    const item = document.createElement("div");
    item.className = "check-item";
    item.dataset.checkId = check.id;

    const h4 = document.createElement("h4");
    h4.textContent = check.label;
    item.appendChild(h4);

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";
    const cleaning = isCleaning();
    checkChoices().forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "status-btn " + opt.cls + (data.status === opt.id ? " active" : "");
      btn.dataset.s = opt.id;
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        statusRow.querySelectorAll(".status-btn").forEach((b) =>
          b.classList.remove("active")
        );
        btn.classList.add("active");
        const noteArea = item.querySelector(".note-area");
        const flagRow = item.querySelector(".flag-row");
        if (showsNoteArea(opt.id)) {
          noteArea.classList.add("visible");
        } else {
          noteArea.classList.remove("visible");
        }
        if (!cleaning && opt.id === STATUS.CRITICAL) {
          flagRow.classList.remove("hidden");
        } else {
          flagRow.classList.add("hidden");
        }
        saveCheckState(machine.id, check.id, item);
      });
      statusRow.appendChild(btn);
    });
    item.appendChild(statusRow);

    const noteArea = document.createElement("div");
    noteArea.className =
      "note-area" + (needsDoc ? " visible" : "");

    const textarea = document.createElement("textarea");
    textarea.placeholder = cleaning
      ? "Bemærkning…"
      : "Bemærkning / observation…";
    textarea.value = data.note || "";
    textarea.addEventListener("input", () =>
      saveCheckState(machine.id, check.id, item)
    );
    noteArea.appendChild(textarea);

    const photoRow = document.createElement("div");
    photoRow.className = "photo-row";

    if (data.photo) {
      const img = document.createElement("img");
      img.className = "photo-thumb";
      img.alt = "foto";
      img.src = data.photo;
      photoRow.appendChild(img);
    } else {
      const empty = document.createElement("div");
      empty.className = "photo-thumb empty";
      empty.textContent = cleaning ? "Valgfrit" : "Foto";
      photoRow.appendChild(empty);
    }

    const photoBtn = document.createElement("button");
    photoBtn.type = "button";
    photoBtn.className = "btn secondary small btn-photo";
    photoBtn.textContent = cleaning ? "Foto (valgfrit)" : "Tag / vælg foto";
    photoBtn.addEventListener("click", () => {
      state.photoTarget = {
        machineId: machine.id,
        checkId: check.id,
        itemEl: item,
      };
      openPhotoModal(data.photo || null);
    });
    photoRow.appendChild(photoBtn);
    noteArea.appendChild(photoRow);

    const flagRow = document.createElement("div");
    flagRow.className =
      "flag-row" +
      (cleaning || data.status !== STATUS.CRITICAL ? " hidden" : "");
    const flagCb = document.createElement("input");
    flagCb.type = "checkbox";
    flagCb.className = "flag-replace";
    flagCb.checked = !!data.flagReplace;
    flagCb.addEventListener("change", () =>
      saveCheckState(machine.id, check.id, item)
    );
    const flagLabel = document.createElement("label");
    flagLabel.textContent = "Markér til udskiftning";
    flagRow.appendChild(flagCb);
    flagRow.appendChild(flagLabel);
    noteArea.appendChild(flagRow);

    item.appendChild(noteArea);
    container.appendChild(item);
  });
}

function saveCheckState(machineId, checkId, itemEl) {
  const active = itemEl.querySelector(".status-btn.active");
  const status = active ? active.dataset.s : null;
  const noteEl = itemEl.querySelector("textarea");
  const note = noteEl ? noteEl.value : "";
  const flagEl = itemEl.querySelector(".flag-replace");
  const flag = flagEl ? flagEl.checked : false;
  const existing = state.results[machineId].checks[checkId] || {};
  state.results[machineId].checks[checkId] = {
    status: status,
    note: note,
    photo: existing.photo || null,
    flagReplace: flag,
  };
}

$("#btn-save-machine").addEventListener("click", () => {
  const machine = state.currentRoute.machines[state.currentMachineIdx];
  $$(".check-item").forEach((item) => {
    saveCheckState(machine.id, item.dataset.checkId, item);
  });

  const missing = machine.checks.filter(
    (c) => !state.results[machine.id].checks[c.id] || !state.results[machine.id].checks[c.id].status
  );
  if (missing.length) {
    alert("Vælg status for: " + missing.map((m) => m.label).join(", "));
    return;
  }

  for (let i = 0; i < machine.checks.length; i++) {
    const c = machine.checks[i];
    const d = state.results[machine.id].checks[c.id];
    if (needsPhoto(d.status) && !d.photo) {
      alert('Foto påkrævet for "' + c.label + '" (' + STATUS_LABEL[d.status] + ")");
      return;
    }
    if (needsNote(d.status) && !(d.note || "").trim()) {
      alert('Bemærkning påkrævet for "' + c.label + '"');
      return;
    }
  }

  renderMachineSteps();
  showView("view-route");
});

/* ── Photo modal ───────────────────────────────────── */
function applyPhotoToUi(dataUrl) {
  const preview = $("#photo-preview");
  preview.innerHTML = "";
  const img = document.createElement("img");
  img.alt = "forhåndsvisning";
  img.src = dataUrl;
  preview.appendChild(img);

  if (!state.photoTarget) return;
  const machineId = state.photoTarget.machineId;
  const checkId = state.photoTarget.checkId;
  const itemEl = state.photoTarget.itemEl;
  const prev = state.results[machineId].checks[checkId] || {};
  state.results[machineId].checks[checkId] = Object.assign({}, prev, {
    photo: dataUrl,
  });
  const thumb = itemEl.querySelector(".photo-thumb");
  if (thumb) {
    const newImg = document.createElement("img");
    newImg.className = "photo-thumb";
    newImg.alt = "foto";
    newImg.src = dataUrl;
    thumb.replaceWith(newImg);
  }
}

async function fileToJpegDataUrl(file) {
  const maxEdge = 1600;
  const quality = 0.82;

  try {
    if (typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
      const w = Math.max(1, Math.round(bmp.width * scale));
      const h = Math.max(1, Math.round(bmp.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
      if (bmp.close) bmp.close();
      return canvas.toDataURL("image/jpeg", quality);
    }
  } catch (err) {
    /* fall through */
  }

  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

function openPhotoModal(existingSrc) {
  const preview = $("#photo-preview");
  preview.innerHTML = "";
  if (existingSrc) {
    const img = document.createElement("img");
    img.alt = "forhåndsvisning";
    img.src = existingSrc;
    preview.appendChild(img);
  } else {
    const span = document.createElement("span");
    span.className = "placeholder";
    span.textContent = "Intet foto";
    preview.appendChild(span);
  }
  $("#photo-modal").classList.remove("hidden");
}

$$(".photo-file").forEach((input) => {
  input.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await fileToJpegDataUrl(file);
      applyPhotoToUi(dataUrl);
    } catch (err) {
      console.error(err);
      alert("Kunne ikke læse fotoet. Prøv igen eller vælg et andet billede.");
    }
  });
});

$("#btn-photo-done").addEventListener("click", () => {
  $("#photo-modal").classList.add("hidden");
  state.photoTarget = null;
});

/* ── Report / PDF ──────────────────────────────────── */
function buildReportData() {
  const route = state.currentRoute;
  let ok = 0,
    worn = 0,
    critical = 0,
    flags = 0;
  const lines = [];
  const dateStr = new Date().toLocaleString("da-DK");

  lines.push("Inspectra-rapport – " + route.name);
  lines.push("Kategori: " + categoryLabel(route.category));
  if (route.zoneLabel) lines.push("Zone: " + route.zoneLabel);
  lines.push("Arbejds-ID: " + state.userId);
  lines.push("Dato: " + dateStr);
  lines.push("");

  route.machines.forEach((m) => {
    lines.push("── " + m.name + " (" + m.location + ") ──");
    m.checks.forEach((c) => {
      const d = state.results[m.id].checks[c.id] || {};
      const st = d.status || "?";
      if (st === STATUS.OK || st === STATUS.DONE) ok++;
      else if (st === STATUS.WORN || st === STATUS.SKIP) worn++;
      else if (st === STATUS.CRITICAL || st === STATUS.ISSUE) critical++;
      if (d.flagReplace) flags++;

      let line = "  " + c.label + ": " + (STATUS_LABEL[st] || st);
      if (d.note) line += " – " + d.note;
      if (d.flagReplace) line += " [MARKÉRET TIL UDSKIFTNING]";
      if (d.photo) line += " [foto]";
      lines.push(line);
    });
    lines.push("");
  });

  const cleaning = isCleaning(route);
  const sumA = cleaning ? "Udført" : "OK";
  const sumB = cleaning ? "Ikke aktuelt" : "Slidt";
  const sumC = cleaning ? "Afvigelse" : "Kritisk";
  lines.push(
    "Opsummering: " +
      sumA +
      "=" +
      ok +
      "  " +
      sumB +
      "=" +
      worn +
      "  " +
      sumC +
      "=" +
      critical +
      (cleaning ? "" : "  Markeret=" + flags)
  );

  const safeName = route.name
    .replace(/[^a-zA-Z0-9æøåÆØÅ_ -]/g, "")
    .replace(/\s+/g, "_");
  const filename =
    "Inspectra_" +
    safeName +
    "_" +
    new Date().toISOString().slice(0, 10) +
    "_" +
    state.userId +
    ".pdf";

  return {
    route: route,
    ok: ok,
    worn: worn,
    critical: critical,
    flags: flags,
    lines: lines,
    dateStr: dateStr,
    filename: filename,
  };
}

async function generatePdf(report) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("jsPDF ikke indlæst. Tjek netværk.");
  }
  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 18;

  function ensureSpace(needed) {
    if (y + needed > 280) {
      doc.addPage();
      y = 18;
    }
  }

  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("INSPECTRA", margin, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    report.route.category === "rengoring"
      ? "Rengoringsrapport"
      : "Maskineinspektionsrapport",
    margin,
    21
  );
  doc.setFontSize(8);
  doc.text(report.dateStr, pageW - margin, 14, { align: "right" });
  doc.text(report.route.name, pageW - margin, 21, { align: "right" });

  y = 36;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Rapportoplysninger", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Arbejds-ID: " + state.userId, margin, y);
  y += 5;
  doc.text("Kategori: " + categoryLabel(report.route.category), margin, y);
  y += 5;
  doc.text("Rute: " + report.route.name, margin, y);
  y += 5;
  if (report.route.zoneLabel) {
    doc.text("Zone: " + report.route.zoneLabel, margin, y);
    y += 5;
  }
  doc.text("Plan: " + scheduleLabel(report.route.schedule), margin, y);
  y += 5;
  const countLabel =
    report.route.category === "rengoring" ? "Omrader: " : "Maskiner: ";
  doc.text(countLabel + String(report.route.machines.length), margin, y);
  y += 10;

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentW, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Opsummering", margin + 3, y + 6);
  doc.setFont("helvetica", "normal");
  const cleaning = isCleaning(report.route);
  const sumLine = cleaning
    ? "Udfoert: " +
      report.ok +
      "    Ikke aktuelt: " +
      report.worn +
      "    Afvigelse: " +
      report.critical
    : "OK: " +
      report.ok +
      "    Slidt: " +
      report.worn +
      "    Kritisk: " +
      report.critical +
      "    Markeret til udskiftning: " +
      report.flags;
  doc.text(sumLine, margin + 3, y + 13);
  y += 26;

  for (let mi = 0; mi < report.route.machines.length; mi++) {
    const m = report.route.machines[mi];
    ensureSpace(30);
    doc.setFillColor(0, 0, 0);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(m.name + "  ·  " + m.location, margin + 2, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 10;

    for (let ci = 0; ci < m.checks.length; ci++) {
      const c = m.checks[ci];
      const d = state.results[m.id].checks[c.id] || {};
      const st = STATUS_LABEL[d.status] || d.status || "–";
      ensureSpace(d.photo ? 42 : 14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(c.label, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(st, pageW - margin, y, { align: "right" });
      y += 4.5;

      if (d.note) {
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        const noteLines = doc.splitTextToSize("Bemærkning: " + d.note, contentW - 4);
        doc.text(noteLines, margin + 2, y);
        y += noteLines.length * 3.8;
        doc.setTextColor(0, 0, 0);
      }
      if (d.flagReplace) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("MARKÉRET TIL UDSKIFTNING", margin + 2, y);
        y += 4;
        doc.setFont("helvetica", "normal");
      }
      if (d.photo) {
        try {
          const imgW = 45;
          const imgH = 34;
          ensureSpace(imgH + 4);
          doc.addImage(d.photo, "JPEG", margin + 2, y, imgW, imgH);
          y += imgH + 3;
        } catch (err) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text("[Foto kunne ikke indlejres]", margin + 2, y);
          doc.setTextColor(0, 0, 0);
          y += 4;
        }
      }

      doc.setDrawColor(200);
      doc.setLineWidth(0.15);
      doc.line(margin, y, pageW - margin, y);
      y += 5;
    }
    y += 4;
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Inspectra · Tøf inspektion · Virksomheden",
      margin,
      290
    );
    doc.text("Side " + i + " / " + pageCount, pageW - margin, 290, {
      align: "right",
    });
  }

  return doc;
}

/* ── Finish ────────────────────────────────────────── */
function canSharePdf(file) {
  if (!navigator.share || !navigator.canShare || typeof File === "undefined") {
    return false;
  }
  try {
    const probe =
      file ||
      new File(["%PDF-1.0"], "probe.pdf", { type: "application/pdf" });
    return navigator.canShare({ files: [probe] });
  } catch (err) {
    return false;
  }
}

function downloadBlob(blob, filename) {
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

function reportMailParts() {
  return {
    subject: "Inspectra: " + state.lastReport.route.name + " – " + state.userId,
    body: state.lastReport.lines.join("\n"),
  };
}

function mailtoButtonLabel() {
  return canSharePdf()
    ? "Send via e-mail"
    : "Send via e-mail (PDF downloades først)";
}

function setReportActionsReady(ready) {
  const download = $("#btn-download-pdf");
  const mailto = $("#btn-mailto");
  const share = $("#btn-share");
  download.disabled = !ready;
  mailto.disabled = !ready;
  share.disabled = !ready;
  download.textContent = ready ? "Download PDF-rapport" : "Genererer PDF…";
  mailto.textContent = ready ? mailtoButtonLabel() : "Forbereder…";
}

$("#btn-finish-route").addEventListener("click", () => {
  markRouteDone(state.currentRoute);
  const report = buildReportData();
  state.lastReport = report;
  state.lastPdf = null;

  const card = $("#summary-card");
  card.innerHTML = "";
  const h3 = document.createElement("h3");
  h3.textContent = report.route.name;
  card.appendChild(h3);

  function addStat(label, value) {
    const row = document.createElement("div");
    row.className = "summary-stat";
    const a = document.createElement("span");
    a.textContent = label;
    const b = document.createElement("span");
    b.textContent = String(value);
    row.appendChild(a);
    row.appendChild(b);
    card.appendChild(row);
  }
  addStat("Arbejds-ID", state.userId);
  addStat("Kategori", categoryLabel(report.route.category));
  if (report.route.zoneLabel) addStat("Zone", report.route.zoneLabel);
  addStat(
    report.route.category === "rengoring" ? "Områder" : "Maskiner",
    report.route.machines.length
  );
  if (isCleaning(report.route)) {
    addStat("Udført", report.ok);
    addStat("Ikke aktuelt", report.worn);
    addStat("Afvigelse", report.critical);
  } else {
    addStat("OK", report.ok);
    addStat("Slidt", report.worn);
    addStat("Kritisk", report.critical);
    addStat("Markeret til udskiftning", report.flags);
  }

  const shareBtn = $("#btn-share");
  if (navigator.share) shareBtn.classList.remove("hidden");
  else shareBtn.classList.add("hidden");

  showView("view-finish");
  setReportActionsReady(false);

  buildPdfFile()
    .then((result) => {
      state.lastPdf = result;
      setReportActionsReady(true);
    })
    .catch((err) => {
      console.error(err);
      setReportActionsReady(true);
      $("#btn-mailto").disabled = true;
      $("#btn-share").disabled = true;
      alert("Kunne ikke generere PDF. " + (err.message || "Prøv igen."));
    });
});

async function buildPdfFile() {
  const doc = await generatePdf(state.lastReport);
  const blob = doc.output("blob");
  let file = null;
  try {
    file = new File([blob], state.lastReport.filename, {
      type: "application/pdf",
    });
  } catch (err) {
    file = null;
  }
  return { doc: doc, blob: blob, file: file };
}

async function ensurePdf() {
  if (state.lastPdf) return state.lastPdf;
  const result = await buildPdfFile();
  state.lastPdf = result;
  return result;
}

$("#btn-download-pdf").addEventListener("click", async () => {
  if (!state.lastReport) return;
  const btn = $("#btn-download-pdf");
  btn.disabled = true;
  try {
    const result = await ensurePdf();
    downloadBlob(result.blob, state.lastReport.filename);
  } catch (err) {
    console.error(err);
    alert("Kunne ikke generere PDF. " + (err.message || "Prøv igen."));
  } finally {
    btn.disabled = false;
    btn.textContent = "Download PDF-rapport";
  }
});

async function sharePdfFile(file, title, text) {
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

/* mailto: cannot attach files. On phones, Web Share puts the PDF in Mail. */
$("#btn-mailto").addEventListener("click", async () => {
  if (!state.lastReport || !state.lastPdf) return;

  const mail = reportMailParts();
  const result = state.lastPdf;

  try {
    if (result.file && canSharePdf(result.file)) {
      const shared = await sharePdfFile(
        result.file,
        mail.subject,
        mail.body
      );
      if (shared) return;
    }

    downloadBlob(result.blob, state.lastReport.filename);
    alert(
      "PDF er gemt som \"" +
        state.lastReport.filename +
        "\".\nTryk OK, og vedhæft filen i mailen før du sender."
    );
    window.location.href =
      "mailto:?subject=" +
      encodeURIComponent(mail.subject) +
      "&body=" +
      encodeURIComponent(
        mail.body +
          "\n\n---\nVedhæft filen \"" +
          state.lastReport.filename +
          "\"."
      );
  } catch (err) {
    if (err && err.name === "AbortError") return;
    console.error(err);
    alert("Kunne ikke forberede rapporten. " + (err.message || ""));
  }
});

$("#btn-share").addEventListener("click", async () => {
  if (!state.lastReport || !state.lastPdf) return;
  try {
    const result = state.lastPdf;
    if (result.file && canSharePdf(result.file)) {
      const shared = await sharePdfFile(
        result.file,
        state.lastReport.filename,
        "Inspectra rapport: " + state.lastReport.route.name
      );
      if (shared) return;
    }
    if (navigator.share) {
      downloadBlob(result.blob, state.lastReport.filename);
      await navigator.share({
        title: state.lastReport.filename,
        text:
          state.lastReport.lines.join("\n") +
          "\n\n(PDF er downloadet – vedhæft den manuelt)",
      });
    } else {
      downloadBlob(result.blob, state.lastReport.filename);
      alert("PDF downloadet. Del den manuelt fra din filmappe.");
    }
  } catch (err) {
    if (!err || err.name !== "AbortError") console.error(err);
  }
});

$("#btn-new-route").addEventListener("click", () => {
  state.currentRoute = null;
  state.results = {};
  state.lastReport = null;
  state.lastPdf = null;
  renderRoutes();
  showView("view-dashboard");
});
