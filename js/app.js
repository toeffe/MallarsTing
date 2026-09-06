import { $, $$, clone, downloadBlob, canSharePdf, sharePdfFile } from "./util.js";
import { initTheme } from "./theme.js";
import * as store from "./store.js";
import { ensureTemplatesInstalled } from "./migrate.js";
import * as fields from "./fields.js";
import { fileToJpegDataUrl, showLightbox } from "./image.js";
import { createSignaturePad } from "./signature.js";
import { readInspectraFile, describeInstalls } from "./inspectra-io.js";
import { initUpdateChecker, dismissUpdate, getLocalVersion, getRemoteVersionInfo } from "./update-checker.js";

const CATEGORY_KEY = "inspectra_category_filter";
const VIEW_PREF_KEY = "inspectra_view_pref";

const helpers = { fileToJpegDataUrl, showLightbox, createSignaturePad };

const state = {
  userId: localStorage.getItem("inspectra_user") || "",
  categoryFilter: localStorage.getItem(CATEGORY_KEY) || "",
  currentTemplate: null,
  currentGroupIdx: null,
  currentPointIdx: 0,
  viewMode: localStorage.getItem(VIEW_PREF_KEY) || "punktvisning",
  results: {},
  lastReport: null,
  lastPdf: null,
  pendingImport: null,
  historyEntryId: null,
};

/* ── Small pure helpers ────────────────────────────────── */

function categoryLabel(cat) {
  if (cat === "rengoring") return "Rengøring";
  if (cat === "maskiner") return "Maskiner";
  return cat || "Andet";
}

function itemNoun(template, plural) {
  const cat = (template || {}).category;
  if (cat === "rengoring") return plural ? "områder" : "område";
  if (cat === "maskiner") return plural ? "maskiner" : "maskine";
  return plural ? "grupper" : "gruppe";
}

function scheduleLabel(s) {
  const map = { daily: "Daglig", weekly: "Ugentlig", monthly: "Månedlig", yearly: "Årlig" };
  return map[s] || s;
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

function isTemplateDone(template) {
  if (!template || !state.userId) return false;
  const rec = (store.getDoneMap()[state.userId] || {})[template.referenceId];
  return !!(rec && rec.period === periodKey(template.schedule));
}

function markTemplateDone(template) {
  if (!template || !state.userId) return;
  const all = store.getDoneMap();
  if (!all[state.userId]) all[state.userId] = {};
  all[state.userId][template.referenceId] = {
    period: periodKey(template.schedule),
    at: new Date().toISOString(),
  };
  store.saveDoneMap(all);
}

function defaultValueForType(type) {
  switch (type) {
    case "multi_choice":
    case "photo":
      return [];
    default:
      return null;
  }
}

function initResultsForTemplate(template) {
  const results = {};
  template.groups.forEach((g) => {
    results[g.id] = {};
    g.points.forEach((p) => {
      const values = {};
      p.rows.forEach((row) => {
        row.fields.forEach((f) => {
          if (!f) return;
          values[f.id] = defaultValueForType(f.type);
        });
      });
      results[g.id][p.id] = { values: values };
    });
  });
  return results;
}

function getValue(groupId, pointId, fieldId) {
  return (((state.results[groupId] || {})[pointId] || {}).values || {})[fieldId];
}

function setValue(groupId, pointId, fieldId, val) {
  if (!state.results[groupId]) state.results[groupId] = {};
  if (!state.results[groupId][pointId]) state.results[groupId][pointId] = { values: {} };
  state.results[groupId][pointId].values[fieldId] = val;
}

function allFields(point) {
  const list = [];
  point.rows.forEach((row) => row.fields.forEach((f) => f && list.push(f)));
  return list;
}

function isPointComplete(point, groupId) {
  return allFields(point).every((f) =>
    fields.isRequiredFieldFilled(f, getValue(groupId, point.id, f.id))
  );
}

function groupProgress(group) {
  const total = group.points.length;
  const done = group.points.filter((p) => isPointComplete(p, group.id)).length;
  return { done: done, total: total };
}

function templateComplete(template) {
  return template.groups.every((g) => groupProgress(g).done === g.points.length);
}

function incompleteGroupNames(template) {
  return template.groups
    .filter((g) => groupProgress(g).done < g.points.length)
    .map((g) => g.name);
}

function computeStats(template, results) {
  let totalRequired = 0,
    filledRequired = 0,
    photoCount = 0,
    signatureCount = 0;
  template.groups.forEach((g) => {
    g.points.forEach((p) => {
      allFields(p).forEach((f) => {
        const val = ((results[g.id] || {})[p.id] || {}).values || {};
        const v = val[f.id];
        if (f.required) {
          totalRequired++;
          if (fields.isRequiredFieldFilled(f, v)) filledRequired++;
        }
        if (f.type === "photo" && Array.isArray(v)) photoCount += v.length;
        if (f.type === "signature" && v) signatureCount++;
      });
    });
  });
  return { totalRequired, filledRequired, photoCount, signatureCount };
}

/* ── View switching ────────────────────────────────────── */

function showView(id) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  window.scrollTo(0, 0);
}

initTheme();

/* ── Update checker ────────────────────────────────────── */
let pendingUpdateVersion = null;
function showUpdateBanner(version) {
  pendingUpdateVersion = version;
  $("#update-banner").classList.remove("hidden");
}
$("#btn-update-reload").addEventListener("click", () => window.location.reload());
$("#btn-update-dismiss").addEventListener("click", () => {
  if (pendingUpdateVersion) dismissUpdate(pendingUpdateVersion);
  $("#update-banner").classList.add("hidden");
});
initUpdateChecker(showUpdateBanner);

$("#btn-version-info").addEventListener("click", showVersionModal);

async function showVersionModal() {
  const body = $("#version-modal-body");
  body.innerHTML = "<h3>Version</h3><p>Henter…</p>";
  $("#version-modal").classList.remove("hidden");

  const local = getLocalVersion();
  const remote = await getRemoteVersionInfo();

  body.innerHTML = "";
  const h3 = document.createElement("h3");
  h3.textContent = "Version";
  body.appendChild(h3);

  const rows = document.createElement("div");
  rows.className = "install-conflict";
  const localRow = document.createElement("p");
  localRow.textContent = "Lokal version: " + (local || "ukendt");
  const remoteRow = document.createElement("p");
  if (!remote) {
    remoteRow.textContent = "Server-version: kunne ikke hentes";
  } else {
    remoteRow.textContent =
      "Server-version: " + remote.version + (remote.deployedAt ? " (" + remote.deployedAt + ")" : "");
  }
  rows.appendChild(localRow);
  rows.appendChild(remoteRow);
  if (remote && local && remote.version !== local) {
    const notice = document.createElement("p");
    notice.textContent = "Der er en nyere version tilgængelig.";
    rows.appendChild(notice);
  }
  body.appendChild(rows);

  const actions = document.createElement("div");
  actions.className = "modal-actions";
  const reload = document.createElement("button");
  reload.type = "button";
  reload.className = "btn primary full";
  reload.textContent = "Genindlæs";
  reload.addEventListener("click", () => window.location.reload());
  const close = document.createElement("button");
  close.type = "button";
  close.className = "btn ghost full";
  close.textContent = "Luk";
  close.addEventListener("click", () => $("#version-modal").classList.add("hidden"));
  actions.appendChild(reload);
  actions.appendChild(close);
  body.appendChild(actions);
}

/* ── Login ─────────────────────────────────────────────── */
$("#login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = $("#user-id").value.trim();
  if (!id) return;
  state.userId = id;
  localStorage.setItem("inspectra_user", id);
  $("#user-label").textContent = id;
  renderDashboard();
  showView("view-dashboard");
});

$("#btn-logout").addEventListener("click", () => {
  localStorage.removeItem("inspectra_user");
  state.userId = "";
  showView("view-login");
});

/* ── Dashboard: category / schedule filters ───────────────── */
$("#schedule-filter").addEventListener("change", renderDashboard);

function templateCategories() {
  const set = new Set(Object.values(store.getTemplates()).map((t) => t.category || "andet"));
  const order = ["maskiner", "rengoring"];
  const list = Array.from(set);
  list.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });
  return list;
}

function renderCategoryBar() {
  const bar = $("#category-bar");
  bar.innerHTML = "";
  const cats = templateCategories();
  if (!cats.includes(state.categoryFilter)) {
    state.categoryFilter = cats[0] || "";
  }
  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-btn" + (state.categoryFilter === cat ? " active" : "");
    btn.textContent = categoryLabel(cat);
    btn.addEventListener("click", () => {
      state.categoryFilter = cat;
      localStorage.setItem(CATEGORY_KEY, cat);
      renderDashboard();
    });
    bar.appendChild(btn);
  });
  const mapPanel = $("#rengoring-map");
  if (mapPanel) mapPanel.classList.toggle("hidden", state.categoryFilter !== "rengoring");
}

const SCHEDULE_ORDER = ["daily", "weekly", "monthly", "yearly"];

function scheduleSortIndex(schedule) {
  const i = SCHEDULE_ORDER.indexOf(schedule);
  return i === -1 ? SCHEDULE_ORDER.length : i;
}

function buildRouteCard(template) {
  const card = document.createElement("div");
  const done = isTemplateDone(template);
  card.className = "route-card" + (done ? " done" : "");

  const h3 = document.createElement("h3");
  h3.textContent = template.name;
  card.appendChild(h3);

  const desc = document.createElement("p");
  desc.style.cssText = "font-size:0.85rem;color:var(--text-muted)";
  desc.textContent = template.description;
  card.appendChild(desc);

  const meta = document.createElement("div");
  meta.className = "route-meta";
  const s1 = document.createElement("span");
  s1.textContent = template.groups.length + " " + itemNoun(template, true);
  const s2 = document.createElement("span");
  s2.className = "sched-tag";
  s2.textContent = scheduleLabel(template.schedule);
  meta.appendChild(s1);
  meta.appendChild(s2);
  if (template.zoneLabel) {
    const s3 = document.createElement("span");
    s3.textContent = template.zoneLabel;
    meta.appendChild(s3);
  }
  const s4 = document.createElement("span");
  s4.textContent = "v" + template.version;
  meta.appendChild(s4);
  if (done) {
    const sDone = document.createElement("span");
    sDone.className = "done-tag";
    sDone.textContent = "Udført";
    meta.appendChild(sDone);
  }
  card.appendChild(meta);

  card.addEventListener("click", () => startTemplate(template));
  return card;
}

function renderDashboard() {
  renderCategoryBar();
  const filter = $("#schedule-filter").value;
  const list = $("#route-list");
  list.innerHTML = "";

  const all = Object.values(store.getTemplates());
  const filtered = all.filter((t) => {
    const catOk = (t.category || "andet") === state.categoryFilter;
    const schedOk = filter === "all" || t.schedule === filter;
    return catOk && schedOk;
  });

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:var(--text-muted);text-align:center;padding:24px";
    empty.textContent = "Ingen kontroller for denne plan.";
    list.appendChild(empty);
    return;
  }

  if (filter === "all") {
    filtered.sort((a, b) => scheduleSortIndex(a.schedule) - scheduleSortIndex(b.schedule));

    let currentSchedule = null;
    filtered.forEach((template) => {
      if (template.schedule !== currentSchedule) {
        currentSchedule = template.schedule;
        const heading = document.createElement("h4");
        heading.className = "route-group-heading";
        heading.textContent = scheduleLabel(currentSchedule);
        list.appendChild(heading);
      }
      list.appendChild(buildRouteCard(template));
    });
    return;
  }

  filtered.forEach((template) => {
    list.appendChild(buildRouteCard(template));
  });
}

/* ── On-device .inspectra import ──────────────────────────── */
$("#import-file").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    const parsed = await readInspectraFile(file);
    state.pendingImport = parsed.templates;
    showImportModal(describeInstalls(parsed.templates));
  } catch (err) {
    alert(err.message || "Kunne ikke importere filen.");
  }
});

function conflictInfoHtml(decision, template) {
  if (decision.action === "new") {
    return (
      "<strong>" +
      escapeHtml(template.name) +
      "</strong><span>Ny · Reference: " +
      escapeHtml(template.referenceId) +
      " · v" +
      template.version +
      "</span>"
    );
  } else if (decision.action === "update") {
    return (
      "<strong>" +
      escapeHtml(template.name) +
      "</strong><span>Opdatering · Installeret v" +
      decision.installedVersion +
      " → Importeret v" +
      decision.importedVersion +
      "</span>"
    );
  }
  return (
    "<strong>" +
    escapeHtml(template.name) +
    "</strong><span>Ingen opdatering nødvendig · Installeret v" +
    decision.installedVersion +
    " · Importeret v" +
    decision.importedVersion +
    "</span>"
  );
}

function showImportModal(entries) {
  const body = $("#import-modal-body");
  body.innerHTML = "";
  const h3 = document.createElement("h3");
  h3.textContent = entries.length === 1 ? "Installer kontrol" : "Installer " + entries.length + " kontroller";
  body.appendChild(h3);

  entries.forEach(({ decision, template }) => {
    const info = document.createElement("div");
    info.className = "install-conflict";
    info.innerHTML = conflictInfoHtml(decision, template);
    body.appendChild(info);
  });

  const actions = document.createElement("div");
  actions.className = "modal-actions";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "btn secondary";
  cancel.textContent = "Annullér";
  cancel.addEventListener("click", closeImportModal);
  actions.appendChild(cancel);

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "btn primary";
  confirm.textContent = entries.some((e) => e.decision.action !== "same-or-older")
    ? "Installer/Opdater alle"
    : "Installer alligevel";
  confirm.addEventListener("click", () => {
    entries.forEach(({ template }) => {
      store.mergeEmbeddedAnswerSets(template.embeddedAnswerSets);
      store.upsertTemplate(template);
    });
    closeImportModal();
    renderDashboard();
  });
  actions.appendChild(confirm);

  body.appendChild(actions);
  $("#import-modal").classList.remove("hidden");
}

function closeImportModal() {
  $("#import-modal").classList.add("hidden");
  state.pendingImport = null;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ── History ──────────────────────────────────────────────── */
$("#btn-history").addEventListener("click", () => {
  renderHistoryList();
  showView("view-history");
});
$("#btn-back-history").addEventListener("click", () => {
  renderDashboard();
  showView("view-dashboard");
});
$("#btn-back-history-detail").addEventListener("click", () => {
  renderHistoryList();
  showView("view-history");
});

function renderHistoryList() {
  const list = $("#history-list");
  list.innerHTML = "";
  const entries = Object.values(store.getHistory()).sort((a, b) =>
    (b.finishedAt || "").localeCompare(a.finishedAt || "")
  );
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:var(--text-muted);text-align:center;padding:24px";
    empty.textContent = "Ingen gennemførte kontroller endnu.";
    list.appendChild(empty);
    return;
  }
  entries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "history-card";
    const h3 = document.createElement("h3");
    h3.textContent = entry.templateSnapshot.name;
    card.appendChild(h3);
    const meta = document.createElement("div");
    meta.className = "route-meta";
    [
      new Date(entry.finishedAt).toLocaleString("da-DK"),
      "v" + entry.version,
      entry.userId,
    ].forEach((text) => {
      const s = document.createElement("span");
      s.textContent = text;
      meta.appendChild(s);
    });
    card.appendChild(meta);
    card.addEventListener("click", () => openHistoryEntry(entry.id));
    list.appendChild(card);
  });
}

function openHistoryEntry(id) {
  const entry = store.getHistoryEntry(id);
  if (!entry) return;
  state.historyEntryId = id;
  const template = entry.templateSnapshot;
  const container = $("#history-detail-body");
  container.innerHTML = "";

  const head = document.createElement("div");
  head.className = "summary-card";
  const h3 = document.createElement("h3");
  h3.textContent = template.name;
  head.appendChild(h3);
  [
    ["Reference-ID", template.referenceId],
    ["Version", "v" + entry.version],
    ["Arbejds-ID", entry.userId],
    ["Dato", new Date(entry.finishedAt).toLocaleString("da-DK")],
  ].forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "summary-stat";
    const a = document.createElement("span");
    a.textContent = label;
    const b = document.createElement("span");
    b.textContent = value;
    row.appendChild(a);
    row.appendChild(b);
    head.appendChild(row);
  });
  container.appendChild(head);

  template.groups.forEach((group) => {
    const groupHead = document.createElement("h3");
    groupHead.style.cssText = "padding:0 16px;margin-top:8px";
    groupHead.textContent = group.name;
    container.appendChild(groupHead);
    group.points.forEach((point) => {
      const values = ((entry.results[group.id] || {})[point.id] || {}).values || {};
      const card = renderPointCard(point, group.id, values, function () {}, "preview", template);
      const wrap = document.createElement("div");
      wrap.style.cssText = "padding:0 16px 12px";
      wrap.appendChild(card);
      container.appendChild(wrap);
    });
  });

  $("#btn-history-pdf").onclick = async () => {
    try {
      const report = buildReportData(template, entry.results, entry.userId, entry.finishedAt);
      const doc = await generatePdf(report);
      downloadBlob(doc.output("blob"), report.filename);
    } catch (err) {
      console.error(err);
      alert("Kunne ikke generere PDF.");
    }
  };

  showView("view-history-detail");
}

/* ── Start a template run ─────────────────────────────────── */
function startTemplate(template) {
  state.currentTemplate = template;
  state.results = initResultsForTemplate(template);
  $("#route-title").textContent = template.name;
  renderGroupSteps();
  showView("view-route");
}

$("#btn-back-routes").addEventListener("click", () => {
  renderDashboard();
  showView("view-dashboard");
});

function renderGroupSteps() {
  const container = $("#machine-steps");
  container.innerHTML = "";
  const template = state.currentTemplate;

  template.groups.forEach((group, idx) => {
    const progress = groupProgress(group);
    const complete = progress.done === progress.total;

    const card = document.createElement("div");
    card.className = "machine-card" + (complete ? " done" : "");

    const statusEl = document.createElement("div");
    statusEl.className = "machine-status";
    statusEl.textContent = complete ? "✓" : String(idx + 1);
    card.appendChild(statusEl);

    if (group.image) {
      const thumb = document.createElement("img");
      thumb.className = "machine-thumb";
      thumb.src = group.image;
      thumb.alt = "";
      card.appendChild(thumb);
    }

    const info = document.createElement("div");
    info.className = "machine-info";
    const h3 = document.createElement("h3");
    h3.textContent = group.name;
    const p = document.createElement("p");
    p.textContent =
      group.location + " · " + progress.done + " / " + progress.total + " kontrolpunkter";
    info.appendChild(h3);
    info.appendChild(p);
    card.appendChild(info);

    card.addEventListener("click", () => openGroup(idx));
    container.appendChild(card);
  });

  const doneGroups = template.groups.filter((g) => groupProgress(g).done === g.points.length).length;
  $("#route-progress").textContent = doneGroups + " / " + template.groups.length + " " + itemNoun(template, true);
  $("#progress-fill").style.width = (doneGroups / template.groups.length) * 100 + "%";
  $("#btn-finish-route").disabled = !templateComplete(template);
}

$("#btn-finish-route").addEventListener("click", () => finishTemplate());

/* ── Group detail: Oversigt / Punktvisning ────────────────── */
function pointCount(group) {
  return group && group.points ? group.points.length : 0;
}

function isAtFirstPoint() {
  const groups = state.currentTemplate.groups;
  for (let i = 0; i < state.currentGroupIdx; i++) {
    if (pointCount(groups[i])) return false;
  }
  return state.currentPointIdx === 0;
}

function isAtLastPoint() {
  const groups = state.currentTemplate.groups;
  for (let i = state.currentGroupIdx + 1; i < groups.length; i++) {
    if (pointCount(groups[i])) return false;
  }
  const n = pointCount(groups[state.currentGroupIdx]);
  return n === 0 || state.currentPointIdx >= n - 1;
}

function stepPoint(dir) {
  const groups = state.currentTemplate.groups;
  let g = state.currentGroupIdx;
  let p = state.currentPointIdx + dir;
  while (g >= 0 && g < groups.length) {
    const n = pointCount(groups[g]);
    if (n && p >= 0 && p < n) {
      openGroup(g, p);
      return true;
    }
    if (dir > 0) {
      g += 1;
      p = 0;
    } else {
      g -= 1;
      if (g >= 0) p = pointCount(groups[g]) - 1;
    }
  }
  return false;
}

function leaveGroupList() {
  renderGroupSteps();
  showView("view-route");
}

function openGroup(idx, pointIdx) {
  state.currentGroupIdx = idx;
  state.currentPointIdx = pointIdx == null ? 0 : pointIdx;
  const group = state.currentTemplate.groups[idx];
  $("#machine-title").textContent = group.name;
  $("#machine-location").textContent = group.location;

  const guide = $("#machine-guide");
  guide.innerHTML = "";
  if (group.image) {
    const img = document.createElement("img");
    img.src = group.image;
    img.alt = group.name;
    img.addEventListener("click", () => showLightbox(group.image));
    guide.appendChild(img);
    guide.classList.remove("hidden");
  } else {
    guide.classList.add("hidden");
  }

  const executionView = state.currentTemplate.executionView || "begge";
  if (executionView !== "begge") state.viewMode = executionView;
  renderViewToggle(executionView);
  renderGroupBody();
  showView("view-machine");
}

$("#btn-back-machines").addEventListener("click", () => {
  leaveGroupList();
});

function renderViewToggle(executionView) {
  const bar = $("#view-toggle");
  bar.innerHTML = "";
  if (executionView !== "begge") {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  [
    { id: "oversigt", label: "Oversigt" },
    { id: "punktvisning", label: "Punktvisning" },
  ].forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "view-toggle-btn" + (state.viewMode === opt.id ? " active" : "");
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      state.viewMode = opt.id;
      localStorage.setItem(VIEW_PREF_KEY, opt.id);
      renderViewToggle(executionView);
      renderGroupBody();
    });
    bar.appendChild(btn);
  });
}

function renderPointCard(point, groupId, valuesOverride, onFieldChange, mode, template) {
  const card = document.createElement("div");
  card.className = "point-card";
  const h4 = document.createElement("h4");
  h4.textContent = point.label;
  card.appendChild(h4);

  point.rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "field-grid";
    rowEl.dataset.cols = String(row.columns);
    row.fields.forEach((field) => {
      if (!field) return;
      const value = valuesOverride
        ? valuesOverride[field.id]
        : getValue(groupId, point.id, field.id);
      const node = fields.renderInput(field, value, (v) => onFieldChange(field.id, v), {
        mode: mode,
        answerSets: template.embeddedAnswerSets,
        helpers: helpers,
      });
      rowEl.appendChild(node);
    });
    card.appendChild(rowEl);
  });

  return card;
}

function renderGroupBody() {
  const template = state.currentTemplate;
  const group = template.groups[state.currentGroupIdx];
  const container = $("#check-items");
  const bottomBar = $("#machine-bottom-bar");
  container.innerHTML = "";

  function onChangeFor(point) {
    return (fieldId, value) => {
      setValue(group.id, point.id, fieldId, value);
    };
  }

  if (state.viewMode === "oversigt") {
    bottomBar.classList.add("hidden");
    group.points.forEach((point) => {
      container.appendChild(
        renderPointCard(point, group.id, null, onChangeFor(point), "execute", template)
      );
    });
  } else {
    bottomBar.classList.remove("hidden");
    if (state.currentPointIdx >= group.points.length) state.currentPointIdx = 0;
    const point = group.points[state.currentPointIdx];
    updatePointNav(group);
    container.appendChild(
      renderPointCard(point, group.id, null, onChangeFor(point), "execute", template)
    );
  }
}

function updatePointNav(group) {
  const atLast = isAtLastPoint();
  $("#btn-prev-point").disabled = isAtFirstPoint();
  $("#btn-next-point").disabled = false;
  $("#btn-next-point").textContent =
    atLast && templateComplete(state.currentTemplate) ? "Afslut" : "Næste";
  $("#point-nav-label").textContent =
    group.points.length ? state.currentPointIdx + 1 + " / " + group.points.length : "0 / 0";
}

$("#btn-prev-point").addEventListener("click", () => {
  stepPoint(-1);
});

$("#btn-next-point").addEventListener("click", () => {
  if (stepPoint(1)) return;
  if (templateComplete(state.currentTemplate)) {
    finishTemplate();
    return;
  }
  leaveGroupList();
});

/* ── Finish template / report / PDF ───────────────────────── */
function buildReportData(template, results, userId, when) {
  const stats = computeStats(template, results);
  const dateStr = (when ? new Date(when) : new Date()).toLocaleString("da-DK");

  const lines = [];
  lines.push("Inspectra-rapport – " + template.name);
  lines.push("Kategori: " + categoryLabel(template.category));
  if (template.zoneLabel) lines.push("Zone: " + template.zoneLabel);
  lines.push("Reference-ID: " + template.referenceId + " · v" + template.version);
  lines.push("Arbejds-ID: " + userId);
  lines.push("Dato: " + dateStr);
  lines.push("");

  template.groups.forEach((g) => {
    lines.push("── " + g.name + " (" + g.location + ") ──");
    g.points.forEach((p) => {
      lines.push("  " + p.label + ":");
      const values = ((results[g.id] || {})[p.id] || {}).values || {};
      allFields(p).forEach((f) => {
        const formatted = fields.formatValueForPdf(f, values[f.id], template.embeddedAnswerSets);
        if (formatted.kind === "text" && formatted.text) {
          lines.push("    " + f.label + ": " + formatted.text);
        } else if (formatted.kind === "images") {
          lines.push("    " + f.label + ": [" + formatted.images.length + " foto]");
        } else if (formatted.kind === "image") {
          lines.push("    " + f.label + ": [billede]");
        }
      });
    });
    lines.push("");
  });

  lines.push(
    "Opsummering: Påkrævede felter udfyldt " +
      stats.filledRequired +
      "/" +
      stats.totalRequired +
      "  Fotos=" +
      stats.photoCount +
      "  Signaturer=" +
      stats.signatureCount
  );

  const safeName = template.name.replace(/[^a-zA-Z0-9æøåÆØÅ_ -]/g, "").replace(/\s+/g, "_");
  const filename =
    "Inspectra_" + safeName + "_" + new Date().toISOString().slice(0, 10) + "_" + userId + ".pdf";

  return { template, results, userId, stats, lines, dateStr, filename };
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

  const template = report.template;

  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("INSPECTRA", margin, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(categoryLabel(template.category) + "-rapport", margin, 21);
  doc.setFontSize(8);
  doc.text(report.dateStr, pageW - margin, 14, { align: "right" });
  doc.text(template.name, pageW - margin, 21, { align: "right" });

  y = 36;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Rapportoplysninger", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Arbejds-ID: " + report.userId, margin, y);
  y += 5;
  doc.text("Reference-ID: " + template.referenceId + " · v" + template.version, margin, y);
  y += 5;
  doc.text("Kategori: " + categoryLabel(template.category), margin, y);
  y += 5;
  if (template.zoneLabel) {
    doc.text("Zone: " + template.zoneLabel, margin, y);
    y += 5;
  }
  doc.text("Plan: " + scheduleLabel(template.schedule), margin, y);
  y += 10;

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentW, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Opsummering", margin + 3, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Påkrævede felter udfyldt: " +
      report.stats.filledRequired +
      "/" +
      report.stats.totalRequired +
      "    Fotos: " +
      report.stats.photoCount +
      "    Signaturer: " +
      report.stats.signatureCount,
    margin + 3,
    y + 11
  );
  y += 22;

  template.groups.forEach((g) => {
    ensureSpace(20);
    doc.setFillColor(0, 0, 0);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(g.name + "  ·  " + g.location, margin + 2, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 10;

    g.points.forEach((p) => {
      ensureSpace(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(p.label, margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");

      const values = ((report.results[g.id] || {})[p.id] || {}).values || {};
      allFields(p).forEach((f) => {
        const formatted = fields.formatValueForPdf(f, values[f.id], template.embeddedAnswerSets);
        if (formatted.kind === "none") return;
        if (formatted.kind === "heading") {
          ensureSpace(8);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(formatted.text, margin + 2, y);
          y += 5;
          doc.setFont("helvetica", "normal");
        } else if (formatted.kind === "text") {
          ensureSpace(6);
          doc.setFontSize(8);
          const textLines = doc.splitTextToSize(f.label + ": " + formatted.text, contentW - 4);
          doc.text(textLines, margin + 2, y);
          y += textLines.length * 3.8;
        } else if (formatted.kind === "image" || formatted.kind === "images") {
          (formatted.images || []).forEach((src) => {
            try {
              const imgW = 45;
              const imgH = 34;
              ensureSpace(imgH + 4);
              doc.addImage(src, "JPEG", margin + 2, y, imgW, imgH);
              y += imgH + 3;
            } catch (err) {
              doc.setFontSize(8);
              doc.setTextColor(100, 100, 100);
              doc.text("[Billede kunne ikke indlejres]", margin + 2, y);
              doc.setTextColor(0, 0, 0);
              y += 4;
            }
          });
        }
      });

      doc.setDrawColor(200);
      doc.setLineWidth(0.15);
      doc.line(margin, y, pageW - margin, y);
      y += 5;
    });
    y += 4;
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("Inspectra · " + template.referenceId + " v" + template.version, margin, 290);
    doc.text("Side " + i + " / " + pageCount, pageW - margin, 290, { align: "right" });
  }

  return doc;
}

function finishTemplate() {
  const template = state.currentTemplate;
  markTemplateDone(template);
  const finishedAt = new Date().toISOString();
  const report = buildReportData(template, state.results, state.userId, finishedAt);
  state.lastReport = report;
  state.lastPdf = null;

  const historyEntry = {
    id: "hist-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6).toString(36),
    templateSnapshot: clone(template),
    referenceId: template.referenceId,
    version: template.version,
    userId: state.userId,
    startedAt: finishedAt,
    finishedAt: finishedAt,
    results: clone(state.results),
  };
  store.addHistoryEntry(historyEntry);

  const card = $("#summary-card");
  card.innerHTML = "";
  const h3 = document.createElement("h3");
  h3.textContent = report.template.name;
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
  addStat("Kategori", categoryLabel(report.template.category));
  if (report.template.zoneLabel) addStat("Zone", report.template.zoneLabel);
  addStat(itemNoun(report.template, true), report.template.groups.length);
  addStat("Påkrævede felter udfyldt", report.stats.filledRequired + "/" + report.stats.totalRequired);
  addStat("Fotos", report.stats.photoCount);
  addStat("Signaturer", report.stats.signatureCount);

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
}

async function buildPdfFile() {
  const doc = await generatePdf(state.lastReport);
  const blob = doc.output("blob");
  let file = null;
  try {
    file = new File([blob], state.lastReport.filename, { type: "application/pdf" });
  } catch (err) {
    file = null;
  }
  return { doc, blob, file };
}

async function ensurePdf() {
  if (state.lastPdf) return state.lastPdf;
  const result = await buildPdfFile();
  state.lastPdf = result;
  return result;
}

function reportMailParts() {
  return {
    subject: "Inspectra: " + state.lastReport.template.name + " – " + state.userId,
    body: state.lastReport.lines.join("\n"),
  };
}

function mailtoButtonLabel() {
  return canSharePdf() ? "Send via e-mail" : "Send via e-mail (PDF downloades først)";
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

$("#btn-mailto").addEventListener("click", async () => {
  if (!state.lastReport || !state.lastPdf) return;
  const mail = reportMailParts();
  const result = state.lastPdf;
  try {
    if (result.file && canSharePdf(result.file)) {
      const shared = await sharePdfFile(result.file, mail.subject, mail.body);
      if (shared) return;
    }
    downloadBlob(result.blob, state.lastReport.filename);
    alert(
      'PDF er gemt som "' +
        state.lastReport.filename +
        '".\nTryk OK, og vedhæft filen i mailen før du sender.'
    );
    window.location.href =
      "mailto:?subject=" +
      encodeURIComponent(mail.subject) +
      "&body=" +
      encodeURIComponent(mail.body + '\n\n---\nVedhæft filen "' + state.lastReport.filename + '".');
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
        "Inspectra rapport: " + state.lastReport.template.name
      );
      if (shared) return;
    }
    if (navigator.share) {
      downloadBlob(result.blob, state.lastReport.filename);
      await navigator.share({
        title: state.lastReport.filename,
        text: state.lastReport.lines.join("\n") + "\n\n(PDF er downloadet – vedhæft den manuelt)",
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
  state.currentTemplate = null;
  state.results = {};
  state.lastReport = null;
  state.lastPdf = null;
  renderDashboard();
  showView("view-dashboard");
});

/* ── Boot ──────────────────────────────────────────────────── */
(async function boot() {
  await ensureTemplatesInstalled();
  if (state.userId) {
    $("#user-id").value = state.userId;
    $("#user-label").textContent = state.userId;
    renderDashboard();
    showView("view-dashboard");
  } else {
    showView("view-login");
  }
})();
