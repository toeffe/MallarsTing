import { ROUTES, STATUS, STATUS_LABEL } from "./data.js";

const state = {
  userId: localStorage.getItem("inspectra_user") || "",
  currentRoute: null,
  currentMachineIdx: null,
  results: {},
  photoTarget: null,
  lastReport: null,
};

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

function scheduleLabel(s) {
  const map = { daily: "Daglig", weekly: "Ugentlig", monthly: "Månedlig", yearly: "Årlig" };
  return map[s] || s;
}

function renderRoutes() {
  const filter = $("#schedule-filter").value;
  const list = $("#route-list");
  list.innerHTML = "";

  const filtered =
    filter === "all" ? ROUTES : ROUTES.filter((r) => r.schedule === filter);

  if (filtered.length === 0) {
    list.innerHTML =
      '<p style="color:var(--text-muted);text-align:center;padding:24px">Ingen ruter for denne plan.</p>';
    return;
  }

  filtered.forEach((route) => {
    const card = document.createElement("div");
    card.className = "route-card";

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
    s1.textContent = route.machines.length + " maskiner";
    const s2 = document.createElement("span");
    s2.className = "sched-tag";
    s2.textContent = scheduleLabel(route.schedule);
    meta.appendChild(s1);
    meta.appendChild(s2);
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

$("#btn-back-routes").addEventListener("click", () => showView("view-dashboard"));

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
    const hasCritical = checks.some((c) => c.status === STATUS.CRITICAL);
    const hasWorn = checks.some((c) => c.status === STATUS.WORN);
    if (isDone) doneCount++;

    let cls = "machine-card";
    if (hasCritical) cls += " critical";
    else if (hasWorn) cls += " worn";
    else if (isDone) cls += " done";

    const statusIcon = hasCritical ? "!" : hasWorn ? "–" : isDone ? "✓" : String(idx + 1);

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
    p.textContent = machine.location + " · " + machine.checks.length + " kontrolpunkter";
    info.appendChild(h3);
    info.appendChild(p);
    card.appendChild(info);

    card.addEventListener("click", () => openMachine(idx));
    container.appendChild(card);
  });

  const total = route.machines.length;
  $("#route-progress").textContent = doneCount + " / " + total + " maskiner";
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
    const needsDoc =
      data.status === STATUS.WORN || data.status === STATUS.CRITICAL;

    const item = document.createElement("div");
    item.className = "check-item";
    item.dataset.checkId = check.id;

    const h4 = document.createElement("h4");
    h4.textContent = check.label;
    item.appendChild(h4);

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";
    ["ok", "worn", "critical"].forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "status-btn " + s + (data.status === s ? " active" : "");
      btn.dataset.s = s;
      btn.textContent =
        s === "ok" ? "OK" : s === "worn" ? "Slidt" : "Kritisk";
      btn.addEventListener("click", () => {
        statusRow.querySelectorAll(".status-btn").forEach((b) =>
          b.classList.remove("active")
        );
        btn.classList.add("active");
        const noteArea = item.querySelector(".note-area");
        const flagRow = item.querySelector(".flag-row");
        if (s === "ok") {
          noteArea.classList.remove("visible");
          flagRow.classList.add("hidden");
        } else {
          noteArea.classList.add("visible");
          if (s === "critical") flagRow.classList.remove("hidden");
          else flagRow.classList.add("hidden");
        }
        saveCheckState(machine.id, check.id, item);
      });
      statusRow.appendChild(btn);
    });
    item.appendChild(statusRow);

    const noteArea = document.createElement("div");
    noteArea.className = "note-area" + (needsDoc ? " visible" : "");

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Bemærkning / observation…";
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
      empty.textContent = "Foto";
      photoRow.appendChild(empty);
    }

    const photoBtn = document.createElement("button");
    photoBtn.type = "button";
    photoBtn.className = "btn secondary small btn-photo";
    photoBtn.textContent = "Tag / vælg foto";
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
      "flag-row" + (data.status === "critical" ? "" : " hidden");
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
    if ((d.status === "worn" || d.status === "critical") && !d.photo) {
      alert('Foto påkrævet for "' + c.label + '" (' + STATUS_LABEL[d.status] + ")");
      return;
    }
    if ((d.status === "worn" || d.status === "critical") && !(d.note || "").trim()) {
      alert('Bemærkning påkrævet for "' + c.label + '"');
      return;
    }
  }

  renderMachineSteps();
  showView("view-route");
});

/* ── Photo modal ───────────────────────────────────── */
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

$("#btn-take-photo").addEventListener("click", () => {
  $("#photo-input").click();
});

$("#photo-input").addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const preview = $("#photo-preview");
    preview.innerHTML = "";
    const img = document.createElement("img");
    img.alt = "forhåndsvisning";
    img.src = dataUrl;
    preview.appendChild(img);

    if (state.photoTarget) {
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
  };
  reader.readAsDataURL(file);
  e.target.value = "";
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
  lines.push("Arbejds-ID: " + state.userId);
  lines.push("Dato: " + dateStr);
  lines.push("");

  route.machines.forEach((m) => {
    lines.push("── " + m.name + " (" + m.location + ") ──");
    m.checks.forEach((c) => {
      const d = state.results[m.id].checks[c.id] || {};
      const st = d.status || "?";
      if (st === "ok") ok++;
      else if (st === "worn") worn++;
      else if (st === "critical") critical++;
      if (d.flagReplace) flags++;

      let line = "  " + c.label + ": " + (STATUS_LABEL[st] || st);
      if (d.note) line += " – " + d.note;
      if (d.flagReplace) line += " [MARKÉRET TIL UDSKIFTNING]";
      if (d.photo) line += " [foto]";
      lines.push(line);
    });
    lines.push("");
  });

  lines.push(
    "Opsummering: OK=" +
      ok +
      "  Slidt=" +
      worn +
      "  Kritisk=" +
      critical +
      "  Markeret=" +
      flags
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
  doc.text("Ruteinspektionsrapport", margin, 21);
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
  doc.text("Rute: " + report.route.name, margin, y);
  y += 5;
  doc.text("Plan: " + scheduleLabel(report.route.schedule), margin, y);
  y += 5;
  doc.text("Maskiner: " + String(report.route.machines.length), margin, y);
  y += 10;

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentW, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Opsummering", margin + 3, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(
      "OK: " +
      report.ok +
      "    Slidt: " +
      report.worn +
      "    Kritisk: " +
      report.critical +
      "    Markeret til udskiftning: " +
      report.flags,
    margin + 3,
    y + 13
  );
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
      "Inspectra · Offline inspektion · Virksomheden ejer data",
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
$("#btn-finish-route").addEventListener("click", () => {
  const report = buildReportData();
  state.lastReport = report;

  const subject = "Inspectra: " + report.route.name + " – " + state.userId;
  const body =
    report.lines.join("\n") +
    "\n\n---\nVedhæft den downloadede PDF-rapport til denne mail.";
  $("#btn-mailto").href =
    "mailto:?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(body);

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
  addStat("Maskiner", report.route.machines.length);
  addStat("OK", report.ok);
  addStat("Slidt", report.worn);
  addStat("Kritisk", report.critical);
  addStat("Markeret til udskiftning", report.flags);

  const shareBtn = $("#btn-share");
  if (navigator.canShare) shareBtn.classList.remove("hidden");
  else shareBtn.classList.add("hidden");

  showView("view-finish");
});

async function buildPdfFile() {
  const doc = await generatePdf(state.lastReport);
  const blob = doc.output("blob");
  const file = new File([blob], state.lastReport.filename, {
    type: "application/pdf",
  });
  return { doc: doc, blob: blob, file: file };
}

$("#btn-download-pdf").addEventListener("click", async () => {
  if (!state.lastReport) return;
  const btn = $("#btn-download-pdf");
  btn.disabled = true;
  btn.textContent = "Genererer PDF…";
  try {
    const result = await buildPdfFile();
    result.doc.save(state.lastReport.filename);
  } catch (err) {
    console.error(err);
    alert("Kunne ikke generere PDF. " + (err.message || "Prøv igen."));
  } finally {
    btn.disabled = false;
    btn.textContent = "Download PDF-rapport";
  }
});

/* mailto: cannot attach files in browsers – download PDF first, then open mail */
$("#btn-mailto").addEventListener("click", async (e) => {
  e.preventDefault();
  if (!state.lastReport) return;

  const btn = $("#btn-mailto");
  const prevText = btn.textContent;
  btn.textContent = "Forbereder…";

  try {
    // Always download PDF so user has the file to attach
    const result = await buildPdfFile();
    result.doc.save(state.lastReport.filename);

    const subject = "Inspectra: " + state.lastReport.route.name + " – " + state.userId;
    const body =
      state.lastReport.lines.join("\n") +
      "\n\n---\n" +
      "PDF-filen \"" + state.lastReport.filename + "\" er downloadet.\n" +
      "Vedhæft den fil til denne mail før du sender.";

    // Small delay so download starts before mail client opens
    setTimeout(() => {
      window.location.href =
        "mailto:?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);
    }, 400);
  } catch (err) {
    console.error(err);
    alert("Kunne ikke forberede rapporten. " + (err.message || ""));
  } finally {
    btn.textContent = prevText;
  }
});

$("#btn-share").addEventListener("click", async () => {
  if (!state.lastReport) return;
  try {
    const result = await buildPdfFile();
    if (navigator.canShare && navigator.canShare({ files: [result.file] })) {
      await navigator.share({
        files: [result.file],
        title: state.lastReport.filename,
        text: "Inspectra rapport: " + state.lastReport.route.name,
      });
    } else if (navigator.share) {
      result.doc.save(state.lastReport.filename);
      await navigator.share({
        title: state.lastReport.filename,
        text: state.lastReport.lines.join("\n") + "\n\n(PDF er downloadet – vedhæft den manuelt)",
      });
    } else {
      result.doc.save(state.lastReport.filename);
      alert("PDF downloadet. Del den manuelt fra din filmappe.");
    }
  } catch (err) {
    if (err.name !== "AbortError") console.error(err);
  }
});

$("#btn-new-route").addEventListener("click", () => {
  state.currentRoute = null;
  state.results = {};
  state.lastReport = null;
  renderRoutes();
  showView("view-dashboard");
});
