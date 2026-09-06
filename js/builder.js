import { $, $$, esc, clone, nextId, slugify, uniqueId } from "./util.js";
import { initTheme } from "./theme.js";
import * as store from "./store.js";
import { ensureTemplatesInstalled, BUILTIN_ANSWER_SETS } from "./migrate.js";
import * as fieldsMod from "./fields.js";
import { fileToJpegDataUrl } from "./image.js";
import {
  downloadInspectraFile,
  downloadInspectraFileMulti,
  readInspectraFile,
  describeInstalls,
} from "./inspectra-io.js";
import { initUpdateChecker, dismissUpdate } from "./update-checker.js";

const SCHEDULE_LABEL = {
  daily: "Daglig",
  weekly: "Ugentlig",
  monthly: "Månedlig",
  yearly: "Årlig",
};

const SCHEDULE_ORDER = ["daily", "weekly", "monthly", "yearly"];

function scheduleSortIndex(schedule) {
  const i = SCHEDULE_ORDER.indexOf(schedule);
  return i === -1 ? SCHEDULE_ORDER.length : i;
}

const state = {
  category: "maskiner",
  templates: [],
  answerSets: {},
  editingRefId: null,
  collapsedGroupIds: new Set(),
};

function reloadFromStore() {
  state.templates = Object.values(store.getTemplates());
  state.answerSets = store.getAnswerSets();
}

function currentTemplate() {
  return state.templates.find((t) => t.referenceId === state.editingRefId) || null;
}

function itemNoun(template, plural) {
  const cat = (template || {}).category;
  if (cat === "rengoring") return plural ? "områder" : "område";
  if (cat === "maskiner") return plural ? "maskiner" : "maskine";
  return plural ? "grupper" : "gruppe";
}

function categoryLabel(cat) {
  if (cat === "rengoring") return "Rengøring";
  if (cat === "maskiner") return "Maskiner";
  return cat || "Andet";
}

function touch(template) {
  template.updatedAt = new Date().toISOString();
}

function persist() {
  const map = {};
  state.templates.forEach((t) => (map[t.referenceId] = t));
  store.saveTemplates(map);
  updateExportBar();
}

function ensureAnswerSetInLibrary(set) {
  if (!state.answerSets[set.id]) {
    state.answerSets[set.id] = set;
    store.upsertAnswerSet(set);
  }
}

/* ── id-regeneration for duplication ──────────────────────── */
function cloneFieldWithNewId(field) {
  if (!field) return null;
  const f = clone(field);
  f.id = nextId("felt");
  return f;
}
function cloneRowWithNewIds(row) {
  const r = clone(row);
  r.id = nextId("raekke");
  r.fields = row.fields.map(cloneFieldWithNewId);
  return r;
}
function clonePointWithNewIds(point) {
  const p = clone(point);
  p.id = nextId("punkt");
  p.rows = point.rows.map(cloneRowWithNewIds);
  return p;
}
function cloneGroupWithNewIds(group) {
  const g = clone(group);
  g.id = nextId("gruppe");
  g.points = group.points.map(clonePointWithNewIds);
  return g;
}

/* ── Empty factories ───────────────────────────────────────── */
function emptyGroup() {
  return { id: nextId("gruppe"), name: "", location: "", image: "", points: [] };
}
function emptyPoint() {
  return { id: nextId("punkt"), label: "", rows: [] };
}
function emptyRow(columns) {
  return { id: nextId("raekke"), columns: columns, fields: new Array(columns).fill(null) };
}

/* ── Validation ────────────────────────────────────────────── */
function validateTemplate(template) {
  const errors = [];
  if (!template.referenceId.trim()) errors.push("Mangler Reference-ID.");
  const dupRef = state.templates.some(
    (t) => t !== template && t.referenceId === template.referenceId
  );
  if (dupRef) errors.push("Reference-ID er allerede i brug.");
  if (!template.name.trim()) errors.push("Mangler navn.");
  const noun = itemNoun(template, false);
  if (!template.groups.length) errors.push("Tilføj mindst én " + noun + ".");
  template.groups.forEach((g, gi) => {
    const gLabel = g.name.trim() || noun + " " + (gi + 1);
    if (!g.name.trim()) errors.push(gLabel + ": mangler navn.");
    if (!g.points.length) errors.push(gLabel + ": tilføj mindst ét kontrolpunkt.");
    g.points.forEach((p) => {
      const pLabel = p.label.trim() || "Unavngivet punkt";
      if (!p.label.trim()) errors.push(gLabel + " → " + pLabel + ": mangler navn.");
      if (!p.rows.length) errors.push(gLabel + " → " + pLabel + ": tilføj mindst én række.");
      p.rows.forEach((row) => {
        row.fields.forEach((f) => {
          if (!f) {
            errors.push(gLabel + " → " + pLabel + ": tomt felt-felt i en række.");
          } else if (["single_choice", "multi_choice", "dropdown"].includes(f.type)) {
            const set = f.config.answerSetId && state.answerSets[f.config.answerSetId];
            if (!set || !set.options.length) {
              errors.push(
                gLabel + " → " + pLabel + " → " + (f.label || "felt") + ": mangler svarmuligheder."
              );
            }
          }
        });
      });
    });
  });
  return errors;
}

/* ── Theme / toast ─────────────────────────────────────────── */
initTheme();

/* ── Update checker ────────────────────────────────────────── */
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

let toastTimer = 0;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
}

function updateExportBar() {
  const template = currentTemplate();
  if (!template) return;
  const errors = validateTemplate(template);
  const btn = $("#btn-export-template");
  if (btn) btn.disabled = errors.length > 0;
}

/* ── List view ─────────────────────────────────────────────── */
function templateCategories() {
  const set = new Set(state.templates.map((t) => t.category || "andet"));
  set.add("maskiner");
  set.add("rengoring");
  if (state.category) set.add(state.category);
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
  templateCategories().forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-btn" + (state.category === cat ? " active" : "");
    btn.textContent = categoryLabel(cat);
    btn.addEventListener("click", () => {
      state.category = cat;
      renderList();
    });
    bar.appendChild(btn);
  });
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "category-btn";
  addBtn.textContent = "+";
  addBtn.title = "Ny kategori";
  addBtn.addEventListener("click", () => {
    const name = prompt("Navn på ny kategori (fx Sikkerhed):");
    if (!name || !name.trim()) return;
    state.category = slugify(name);
    renderList();
  });
  bar.appendChild(addBtn);
}

function renderList() {
  renderCategoryBar();
  const newBtn = $("#btn-new");
  newBtn.textContent = "Ny kontrol";

  const list = $("#route-list");
  list.innerHTML = "";
  const filtered = state.templates.filter((t) => (t.category || "andet") === state.category);

  if (!filtered.length) {
    const p = document.createElement("p");
    p.className = "intro";
    p.style.padding = "8px 0 0";
    p.textContent = "Ingen kontroller endnu. Tryk Ny kontrol.";
    list.appendChild(p);
    return;
  }

  filtered.sort((a, b) => scheduleSortIndex(a.schedule) - scheduleSortIndex(b.schedule));

  let currentSchedule = null;
  filtered.forEach((template) => {
    if (template.schedule !== currentSchedule) {
      currentSchedule = template.schedule;
      const heading = document.createElement("h4");
      heading.className = "route-group-heading";
      heading.textContent = SCHEDULE_LABEL[currentSchedule] || currentSchedule;
      list.appendChild(heading);
    }

    const card = document.createElement("div");
    card.className = "route-card";
    card.dataset.id = template.referenceId;

    const h3 = document.createElement("h3");
    h3.textContent = template.name.trim() || "Uden navn";
    card.appendChild(h3);

    if (template.description.trim()) {
      const desc = document.createElement("p");
      desc.style.cssText = "font-size:0.85rem;color:var(--text-muted)";
      desc.textContent = template.description;
      card.appendChild(desc);
    }

    const meta = document.createElement("div");
    meta.className = "route-meta";
    const s1 = document.createElement("span");
    s1.textContent = template.groups.length + " " + itemNoun(template, true);
    const s2 = document.createElement("span");
    s2.className = "sched-tag";
    s2.textContent = SCHEDULE_LABEL[template.schedule] || template.schedule;
    const s3 = document.createElement("span");
    s3.textContent = template.referenceId + " · v" + template.version;
    meta.appendChild(s1);
    meta.appendChild(s2);
    meta.appendChild(s3);
    if (template.zoneLabel.trim()) {
      const s4 = document.createElement("span");
      s4.textContent = template.zoneLabel;
      meta.appendChild(s4);
    }
    card.appendChild(meta);
    list.appendChild(card);
  });
}

function showList() {
  state.editingRefId = null;
  $("#page-header").classList.remove("hidden");
  $("#view-list").classList.remove("hidden");
  $("#view-editor").classList.add("hidden");
  renderList();
}

function showEditor() {
  $("#page-header").classList.add("hidden");
  $("#view-list").classList.add("hidden");
  $("#view-editor").classList.remove("hidden");
  renderEditor();
  updateExportBar();
  window.scrollTo(0, 0);
}

/* ── Photo picker (unchanged pattern) ─────────────────────── */
const UPLOAD_ICON =
  '<svg class="upload-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>';

function photoPicker(src, inputAttrs, emptyText, sizeClass) {
  const has = !!src;
  const cls = "photo-pick" + (sizeClass ? " " + sizeClass : "") + (has ? " has-img" : "");
  const empty =
    sizeClass === "sm" ? UPLOAD_ICON : UPLOAD_ICON + '<span class="photo-pick-label">' + esc(emptyText) + "</span>";
  return `
    <label class="${cls}" title="Upload billede">
      <input type="file" accept="image/*" ${inputAttrs} />
      ${has ? `<img src="${src}" alt="" />` : `<span class="photo-pick-empty">${empty}</span>`}
    </label>`;
}

/* ── Field-grid rendering ──────────────────────────────────── */
function renderAnswerSetPickerHtml(field, loc) {
  const sets = Object.values(state.answerSets);
  const options = sets
    .map(
      (s) =>
        `<option value="${esc(s.id)}" ${field.config.answerSetId === s.id ? "selected" : ""}>${esc(s.name)}</option>`
    )
    .join("");
  return `
    <div class="answerset-picker">
      <select data-field-answerset="${loc}">
        <option value="">– Vælg svarmuligheder –</option>
        ${options}
      </select>
      <button type="button" class="btn ghost icon" data-edit-answerset="${loc}" title="Rediger">✎</button>
    </div>
    <button type="button" class="btn ghost small" data-new-answerset="${loc}">+ Nyt sæt</button>`;
}

function renderFieldCellHtml(field, loc) {
  const icon = fieldsMod.iconFor(field.type);
  const typeLabel = fieldsMod.labelFor(field.type);
  let configHtml = "";
  if (["single_choice", "multi_choice", "dropdown"].includes(field.type)) {
    configHtml = renderAnswerSetPickerHtml(field, loc);
  } else if (field.type === "photo") {
    configHtml = `
      <select data-field-source="${loc}">
        <option value="both" ${field.config.source === "both" ? "selected" : ""}>Kamera + galleri</option>
        <option value="camera" ${field.config.source === "camera" ? "selected" : ""}>Kun kamera</option>
        <option value="gallery" ${field.config.source === "gallery" ? "selected" : ""}>Kun galleri</option>
      </select>
      <label class="required-toggle"><input type="checkbox" data-field-multiple="${loc}" ${field.config.multiple ? "checked" : ""}/> Flere billeder</label>`;
  } else if (field.type === "reference_image") {
    configHtml = photoPicker(field.config.src, `data-ref-image="${loc}"`, "Upload billede", "sm");
  } else if (field.type === "number") {
    configHtml = `<input type="text" data-field-unit="${loc}" value="${esc(field.config.unit || "")}" placeholder="Enhed (fx °C, valgfri)" />`;
  }
  const requiredToggle =
    field.type === "heading" || field.type === "reference_image"
      ? ""
      : `<label class="required-toggle"><input type="checkbox" data-field-required="${loc}" ${field.required ? "checked" : ""}/> Påkrævet</label>`;
  return `
    <div class="field-cell-editor">
      <div class="field-cell-head">
        <span class="type-icon">${icon}</span>
        <span>${esc(typeLabel)}</span>
        <button type="button" class="btn ghost icon" data-del-field="${loc}" title="Fjern felt" style="margin-left:auto">×</button>
      </div>
      <input type="text" data-field-label="${loc}" value="${esc(field.label)}" placeholder="Feltnavn" />
      ${configHtml}
      ${requiredToggle}
    </div>`;
}

function renderRowHtml(row, gIdx, pIdx, rIdx) {
  const cellsHtml = row.fields
    .map((field, fIdx) => {
      const loc = gIdx + ":" + pIdx + ":" + rIdx + ":" + fIdx;
      if (!field) return `<button type="button" class="field-slot-empty" data-add-field="${loc}">+ Felt</button>`;
      return renderFieldCellHtml(field, loc);
    })
    .join("");
  const rowLoc = gIdx + ":" + pIdx + ":" + rIdx;
  return `
    <div class="row-strip" data-drag-row="${rowLoc}" draggable="false">
      <div class="row-tools">
        <span class="drag-handle" data-drag-handle title="Flyt række">⠿</span>
        <button type="button" class="btn ghost icon" data-del-row="${rowLoc}" title="Slet række">×</button>
      </div>
      ${cellsHtml}
    </div>`;
}

function renderPointHtml(gIdx, point, pIdx) {
  const rowsHtml = point.rows.map((row, rIdx) => renderRowHtml(row, gIdx, pIdx, rIdx)).join("");
  const pointLoc = gIdx + ":" + pIdx;
  return `
    <div class="point-card" data-drag-point="${pointLoc}" draggable="false">
      <div class="point-head">
        <span class="drag-handle" data-drag-handle title="Flyt kontrolpunkt">⠿</span>
        <input type="text" data-point-label="${pointLoc}" value="${esc(point.label)}" placeholder="Kontrolpunkt-navn" />
        <button type="button" class="btn ghost icon" data-dup-point="${pointLoc}" title="Dupliker">⧉</button>
        <button type="button" class="btn ghost icon" data-del-point="${pointLoc}" title="Slet">×</button>
      </div>
      ${rowsHtml}
      <div class="column-picker">
        <button type="button" data-add-row="${pointLoc}:1">+ Række (1)</button>
        <button type="button" data-add-row="${pointLoc}:2">+ Række (2)</button>
        <button type="button" data-add-row="${pointLoc}:3">+ Række (3)</button>
      </div>
    </div>`;
}

/* ── Editor ────────────────────────────────────────────────── */
function renderTemplateHeaderHtml(template) {
  const refField = template.publishedAt
    ? `<div class="ref-id-locked" title="Låst efter udgivelse">🔒 ${esc(template.referenceId)}</div>`
    : `<div class="field"><label for="f-refid">Reference-ID</label><input id="f-refid" type="text" value="${esc(template.referenceId)}" placeholder="Fx AVA2-PK-001" /></div>`;
  const meta = `
    <div class="template-meta">
      <span>v${template.version}</span>
      <span>Ændret ${new Date(template.updatedAt).toLocaleString("da-DK")}</span>
      ${template.publishedAt ? `<span>Udgivet ${new Date(template.publishedAt).toLocaleString("da-DK")}</span>` : "<span>Ikke udgivet endnu</span>"}
    </div>`;
  return `<div class="form-card">${refField}${meta}</div>`;
}

function renderGroupHtml(group, idx, template) {
  const title = group.name.trim() || "Ny " + itemNoun(template, false);
  const titleClass = group.name.trim() ? "item-title" : "item-title empty";
  const pointsHtml = group.points.map((p, pIdx) => renderPointHtml(idx, p, pIdx)).join("");
  const openAttr = state.collapsedGroupIds.has(group.id) ? "" : "open";
  return `
    <details class="item-card" data-group-id="${esc(group.id)}" data-drag-group="${idx}" draggable="false" ${openAttr}>
      <summary>
        <span class="drag-handle" data-drag-handle title="Flyt">⠿</span>
        <span class="${titleClass}" data-item-title="${idx}">${esc(title)}</span>
        <span class="item-tools">
          <button type="button" class="btn ghost icon" data-dup-item="${idx}" title="Dupliker">⧉</button>
          <button type="button" class="btn ghost icon" data-del-item="${idx}" title="Slet">×</button>
        </span>
      </summary>
      <div class="item-fields">
        <div class="form-row-2">
          <div class="field">
            <label>Navn</label>
            <input type="text" data-item="${idx}" data-item-field="name" value="${esc(group.name)}" placeholder="Navn på ${itemNoun(template, false)}" />
          </div>
          <div class="field">
            <label>Placering</label>
            <input type="text" data-item="${idx}" data-item-field="location" value="${esc(group.location)}" placeholder="Fx Hal A · Zone 1" />
          </div>
        </div>
        <div class="field">
          <label>Billede (valgfrit)</label>
          ${photoPicker(group.image, `data-item-image="${idx}"`, "Tilføj billede")}
          ${group.image ? `<button type="button" class="btn ghost small" data-clear-item-image="${idx}">Fjern billede</button>` : ""}
        </div>
        <div>
          <p class="checks-label">Kontrolpunkter</p>
          <div class="item-list">
            ${pointsHtml || '<p class="intro" style="padding:0">Ingen kontrolpunkter endnu.</p>'}
          </div>
          <button type="button" class="btn secondary small" data-add-point="${idx}" style="margin-top:10px">+ Kontrolpunkt</button>
        </div>
      </div>
    </details>`;
}

function rerenderEditor() {
  const y = window.scrollY;
  renderEditor();
  window.scrollTo(0, y);
}

function renderEditor() {
  const template = currentTemplate();
  if (!template) {
    showList();
    return;
  }

  $("#editor-title").textContent = "Rediger kontrol";
  $("#editor-sub").textContent = categoryLabel(template.category);

  const noun = itemNoun(template, false);
  const nounPlural = itemNoun(template, true);

  const groupsHtml = template.groups.map((g, idx) => renderGroupHtml(g, idx, template)).join("");
  const emptyGroups = template.groups.length ? "" : `<p class="intro" style="padding:0">Ingen ${nounPlural} endnu.</p>`;

  $("#editor-body").innerHTML = `
    ${renderTemplateHeaderHtml(template)}
    <div class="form-card">
      <div class="form-grid">
        <div class="form-row-2">
          <div class="field">
            <label for="f-name">Navn</label>
            <input id="f-name" type="text" data-field="name" value="${esc(template.name)}" placeholder="Fx Rute 1 – Hal A" />
          </div>
          <div class="field">
            <label for="f-schedule">Interval</label>
            <select id="f-schedule" data-field="schedule">
              <option value="daily"${template.schedule === "daily" ? " selected" : ""}>Daglig</option>
              <option value="weekly"${template.schedule === "weekly" ? " selected" : ""}>Ugentlig</option>
              <option value="monthly"${template.schedule === "monthly" ? " selected" : ""}>Månedlig</option>
              <option value="yearly"${template.schedule === "yearly" ? " selected" : ""}>Årlig</option>
            </select>
          </div>
        </div>
        <div class="form-row-2">
          <div class="field">
            <label for="f-category">Kategori</label>
            <input id="f-category" type="text" data-field="category" value="${esc(template.category)}" placeholder="maskiner / rengoring / …" />
          </div>
          <div class="field">
            <label for="f-view">Udførelsesvisning</label>
            <select id="f-view" data-field="executionView">
              <option value="oversigt"${template.executionView === "oversigt" ? " selected" : ""}>Oversigt</option>
              <option value="punktvisning"${template.executionView === "punktvisning" ? " selected" : ""}>Punktvisning</option>
              <option value="begge"${template.executionView === "begge" ? " selected" : ""}>Begge</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="f-desc">Beskrivelse</label>
          <textarea id="f-desc" data-field="description" placeholder="Kort om kontrollen">${esc(template.description)}</textarea>
        </div>
        <div class="field">
          <label for="f-zone">Zone/lokation (valgfrit)</label>
          <input id="f-zone" type="text" data-field="zoneLabel" value="${esc(template.zoneLabel)}" placeholder="Fx Blå · Vask" />
        </div>
      </div>
    </div>
    <div class="section-head">
      <h3>${nounPlural.charAt(0).toUpperCase() + nounPlural.slice(1)}</h3>
      <button type="button" class="btn secondary small" id="btn-add-item">Tilføj ${noun}</button>
    </div>
    <div class="item-list">
      ${emptyGroups}
      ${groupsHtml}
    </div>
    <div class="editor-danger" style="display:flex;flex-direction:column;gap:10px">
      <button type="button" class="btn secondary full" id="btn-duplicate-template">Dupliker kontrol (ny Reference-ID)</button>
      <button type="button" class="btn primary full" id="btn-export-template">Eksportér .inspectra</button>
      <button type="button" class="btn secondary full" id="btn-delete-route">Slet kontrol</button>
    </div>
  `;

  $$("[data-group-id]", $("#editor-body")).forEach((details) => {
    details.addEventListener("toggle", () => {
      const id = details.dataset.groupId;
      if (details.open) state.collapsedGroupIds.delete(id);
      else state.collapsedGroupIds.add(id);
    });
  });
}

/* ── Mutations: template / group ──────────────────────────── */
function addTemplate() {
  const used = new Set(state.templates.map((t) => t.referenceId));
  const refId = uniqueId(slugify("ny-kontrol"), used);
  const answerSetId = state.category === "rengoring" ? "rengoring-status" : "tilstand";
  const builtinSet = BUILTIN_ANSWER_SETS[answerSetId];
  const set = builtinSet
    ? clone(builtinSet)
    : { id: answerSetId, name: answerSetId, options: [], defaultOptionIds: [] };
  ensureAnswerSetInLibrary(set);
  const now = new Date().toISOString();
  const template = {
    referenceId: refId,
    name: "",
    description: "",
    category: state.category,
    schedule: "daily",
    zoneLabel: "",
    executionView: "begge",
    version: 1,
    updatedAt: now,
    publishedAt: "",
    builtin: false,
    embeddedAnswerSets: { [set.id]: clone(set) },
    groups: [emptyGroup()],
  };
  state.templates.push(template);
  state.editingRefId = refId;
  persist();
  showEditor();
  const name = $("#f-name");
  if (name) name.focus();
}

function openTemplate(refId) {
  state.editingRefId = refId;
  showEditor();
}

function backToList() {
  showList();
}

function deleteTemplate() {
  const template = currentTemplate();
  if (!template) return;
  if (!confirm('Slet "' + (template.name.trim() || template.referenceId) + '"?')) return;
  state.templates = state.templates.filter((t) => t.referenceId !== template.referenceId);
  store.deleteTemplate(template.referenceId);
  persist();
  showList();
}

function duplicateTemplate() {
  const template = currentTemplate();
  if (!template) return;
  const used = new Set(state.templates.map((t) => t.referenceId));
  let newRef = prompt("Ny Reference-ID for kopien:", template.referenceId + "-kopi");
  if (newRef === null) return;
  newRef = newRef.trim();
  if (!newRef || used.has(newRef)) {
    alert("Reference-ID mangler eller er allerede i brug.");
    return;
  }
  const copy = clone(template);
  copy.referenceId = newRef;
  copy.version = 1;
  copy.updatedAt = new Date().toISOString();
  copy.publishedAt = "";
  copy.builtin = false;
  copy.groups = template.groups.map(cloneGroupWithNewIds);
  state.templates.push(copy);
  state.editingRefId = newRef;
  persist();
  showEditor();
}

function collectUsedAnswerSetIds(template) {
  const ids = new Set();
  template.groups.forEach((g) =>
    g.points.forEach((p) =>
      p.rows.forEach((row) =>
        row.fields.forEach((f) => {
          if (f && f.config && f.config.answerSetId) ids.add(f.config.answerSetId);
        })
      )
    )
  );
  return ids;
}

function snapshotEmbeddedAnswerSets(template) {
  const used = collectUsedAnswerSetIds(template);
  const snapshot = {};
  used.forEach((id) => {
    if (state.answerSets[id]) snapshot[id] = clone(state.answerSets[id]);
  });
  template.embeddedAnswerSets = snapshot;
}

function exportTemplate() {
  const template = currentTemplate();
  if (!template) return;
  const errors = validateTemplate(template);
  if (errors.length) {
    alert("Kan ikke eksportere endnu:\n- " + errors.join("\n- "));
    return;
  }
  snapshotEmbeddedAnswerSets(template);
  template.version += 1;
  template.publishedAt = new Date().toISOString();
  touch(template);
  persist();
  const filename = downloadInspectraFile(template);
  toast("Eksporteret som " + filename);
  rerenderEditor();
}

function addGroup() {
  const template = currentTemplate();
  if (!template) return;
  template.groups.push(emptyGroup());
  touch(template);
  persist();
  renderEditor();
}

function reorderArray(arr, from, to) {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return false;
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  return true;
}

function reorderGroup(from, to) {
  const template = currentTemplate();
  if (!template || !reorderArray(template.groups, from, to)) return;
  touch(template);
  persist();
  rerenderEditor();
}

function deleteGroup(idx) {
  const template = currentTemplate();
  if (!template) return;
  const group = template.groups[idx];
  const label = (group && group.name.trim()) || itemNoun(template, false);
  if (!confirm("Slet " + label + "?")) return;
  template.groups.splice(idx, 1);
  touch(template);
  persist();
  renderEditor();
}

function duplicateGroup(idx) {
  const template = currentTemplate();
  if (!template || !template.groups[idx]) return;
  const copy = cloneGroupWithNewIds(template.groups[idx]);
  copy.name = copy.name ? copy.name + " (kopi)" : copy.name;
  template.groups.splice(idx + 1, 0, copy);
  touch(template);
  persist();
  renderEditor();
}

/* ── Mutations: point / row / field ───────────────────────── */
function addPoint(gIdx) {
  const template = currentTemplate();
  const group = template && template.groups[gIdx];
  if (!group) return;
  group.points.push(emptyPoint());
  touch(template);
  persist();
  renderEditor();
}

function reorderPoint(gIdx, from, to) {
  const template = currentTemplate();
  const group = template && template.groups[gIdx];
  if (!group || !reorderArray(group.points, from, to)) return;
  touch(template);
  persist();
  rerenderEditor();
}

function deletePoint(gIdx, pIdx) {
  const template = currentTemplate();
  const group = template && template.groups[gIdx];
  if (!group) return;
  if (!confirm("Slet kontrolpunkt?")) return;
  group.points.splice(pIdx, 1);
  touch(template);
  persist();
  renderEditor();
}

function duplicatePoint(gIdx, pIdx) {
  const template = currentTemplate();
  const group = template && template.groups[gIdx];
  const point = group && group.points[pIdx];
  if (!point) return;
  const copy = clonePointWithNewIds(point);
  group.points.splice(pIdx + 1, 0, copy);
  touch(template);
  persist();
  renderEditor();
}

function addRow(gIdx, pIdx, cols) {
  const template = currentTemplate();
  const point = template && template.groups[gIdx] && template.groups[gIdx].points[pIdx];
  if (!point) return;
  point.rows.push(emptyRow(cols));
  touch(template);
  persist();
  renderEditor();
}

function reorderRow(gIdx, pIdx, from, to) {
  const template = currentTemplate();
  const point = template && template.groups[gIdx] && template.groups[gIdx].points[pIdx];
  if (!point || !reorderArray(point.rows, from, to)) return;
  touch(template);
  persist();
  rerenderEditor();
}

function deleteRow(gIdx, pIdx, rIdx) {
  const template = currentTemplate();
  const point = template && template.groups[gIdx] && template.groups[gIdx].points[pIdx];
  if (!point) return;
  point.rows.splice(rIdx, 1);
  touch(template);
  persist();
  renderEditor();
}

function getField(gIdx, pIdx, rIdx, fIdx) {
  const template = currentTemplate();
  const row =
    template && template.groups[gIdx] && template.groups[gIdx].points[pIdx] && template.groups[gIdx].points[pIdx].rows[rIdx];
  return row ? { template, row, field: row.fields[fIdx] } : { template: null, row: null, field: null };
}

function addField(gIdx, pIdx, rIdx, fIdx, type) {
  const { template, row } = getField(gIdx, pIdx, rIdx, fIdx);
  if (!row) return;
  const field = fieldsMod.newField(type);
  if (["single_choice", "dropdown"].includes(type)) {
    field.config.answerSetId = "tilstand";
  } else if (type === "multi_choice") {
    field.config.answerSetId = null;
  }
  row.fields[fIdx] = field;
  touch(template);
  persist();
  renderEditor();
}

function deleteField(gIdx, pIdx, rIdx, fIdx) {
  const { template, row } = getField(gIdx, pIdx, rIdx, fIdx);
  if (!row) return;
  row.fields[fIdx] = null;
  touch(template);
  persist();
  renderEditor();
}

/* ── AnswerSet modal ───────────────────────────────────────── */
function renderAnswerSetModal(set) {
  const body = $("#answerset-modal-body");
  const optionsHtml = set.options
    .map(
      (o, i) => `
      <div class="option-row">
        <input type="text" value="${esc(o.label)}" data-opt-id="${o.id}" />
        <button type="button" class="btn ${set.defaultOptionIds.includes(o.id) ? "primary" : "ghost"} small" data-opt-default="${o.id}">Std.</button>
        <button type="button" class="btn ghost icon" data-opt-up="${o.id}" ${i === 0 ? "disabled" : ""}>↑</button>
        <button type="button" class="btn ghost icon" data-opt-down="${o.id}" ${i === set.options.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" class="btn ghost icon" data-opt-del="${o.id}">×</button>
      </div>`
    )
    .join("");

  body.innerHTML = `
    <h3>Rediger svarmuligheder</h3>
    <div class="field">
      <label>Navn på sæt</label>
      <input type="text" id="answerset-name" value="${esc(set.name)}" />
    </div>
    <div class="answerset-editor">
      ${optionsHtml || '<p class="intro" style="padding:0">Ingen muligheder endnu.</p>'}
      <div class="option-row">
        <input type="text" id="answerset-new-option" placeholder="Ny mulighed…" />
        <button type="button" class="btn secondary small" id="answerset-add-option">Tilføj</button>
      </div>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn primary full" id="answerset-close">Færdig</button>
    </div>`;

  function save() {
    // Answer sets are edited against the shared global library while
    // building; a template only snapshots the sets it actually uses into
    // its own embeddedAnswerSets once, at export time (see
    // snapshotEmbeddedAnswerSets), so two templates sharing a set never
    // drift out of sync with each other just from edit ordering.
    state.answerSets[set.id] = set;
    store.upsertAnswerSet(set);
    const template = currentTemplate();
    if (template) {
      touch(template);
      persist();
    }
  }

  $("#answerset-name").addEventListener("input", (e) => {
    set.name = e.target.value;
    save();
    rerenderEditor();
  });
  body.querySelectorAll("[data-opt-id]").forEach((input) => {
    input.addEventListener("input", (e) => {
      const opt = set.options.find((o) => o.id === input.dataset.optId);
      if (opt) opt.label = e.target.value;
      save();
    });
  });
  body.querySelectorAll("[data-opt-default]").forEach((btn) => {
    btn.addEventListener("click", () => {
      set.defaultOptionIds = [btn.dataset.optDefault];
      save();
      renderAnswerSetModal(set);
    });
  });
  body.querySelectorAll("[data-opt-up]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = set.options.findIndex((o) => o.id === btn.dataset.optUp);
      if (i > 0) [set.options[i - 1], set.options[i]] = [set.options[i], set.options[i - 1]];
      save();
      renderAnswerSetModal(set);
    });
  });
  body.querySelectorAll("[data-opt-down]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = set.options.findIndex((o) => o.id === btn.dataset.optDown);
      if (i !== -1 && i < set.options.length - 1) {
        [set.options[i + 1], set.options[i]] = [set.options[i], set.options[i + 1]];
      }
      save();
      renderAnswerSetModal(set);
    });
  });
  body.querySelectorAll("[data-opt-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      set.options = set.options.filter((o) => o.id !== btn.dataset.optDel);
      set.defaultOptionIds = set.defaultOptionIds.filter((id) => id !== btn.dataset.optDel);
      save();
      renderAnswerSetModal(set);
    });
  });
  $("#answerset-add-option").addEventListener("click", () => {
    const input = $("#answerset-new-option");
    const label = input.value.trim();
    if (!label) return;
    set.options.push({ id: nextId("opt"), label: label });
    save();
    renderAnswerSetModal(set);
  });
  $("#answerset-close").addEventListener("click", () => {
    $("#answerset-modal").classList.add("hidden");
    rerenderEditor();
  });
}

function openAnswerSetModal(setId) {
  const set = state.answerSets[setId];
  if (!set) return;
  renderAnswerSetModal(set);
  $("#answerset-modal").classList.remove("hidden");
}

/* ── Field-type picker modal ───────────────────────────────── */
function openFieldTypeModal(loc) {
  const body = $("#field-type-modal-body");
  body.innerHTML =
    "<h3>Vælg felttype</h3><div class=\"field-type-picker\">" +
    fieldsMod.FIELD_TYPE_LIST.map(
      (type) =>
        `<button type="button" class="chip" data-pick-type="${type}"><span class="type-icon">${fieldsMod.iconFor(type)}</span>${esc(fieldsMod.labelFor(type))}</button>`
    ).join("") +
    "</div>";
  body.querySelectorAll("[data-pick-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [gIdx, pIdx, rIdx, fIdx] = loc.split(":").map(Number);
      addField(gIdx, pIdx, rIdx, fIdx, btn.dataset.pickType);
      $("#field-type-modal").classList.add("hidden");
    });
  });
  $("#field-type-modal").classList.remove("hidden");
}

/* ── Import (.inspectra) ───────────────────────────────────── */
function conflictInfoHtml(decision, template) {
  if (decision.action === "new") {
    return `<strong>${esc(template.name)}</strong><span>Ny · Reference: ${esc(template.referenceId)} · v${template.version}</span>`;
  } else if (decision.action === "update") {
    return `<strong>${esc(template.name)}</strong><span>Opdatering · Installeret v${decision.installedVersion} → Importeret v${decision.importedVersion}</span>`;
  }
  return `<strong>${esc(template.name)}</strong><span>Ingen opdatering nødvendig · Installeret v${decision.installedVersion} · Importeret v${decision.importedVersion}</span>`;
}

function showImportConflictModal(entries) {
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
  cancel.addEventListener("click", () => $("#import-modal").classList.add("hidden"));
  actions.appendChild(cancel);

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "btn primary";
  confirm.textContent = entries.some((e) => e.decision.action !== "same-or-older")
    ? "Installer/Opdater alle"
    : "Installer alligevel";
  confirm.addEventListener("click", () => {
    let lastCategory = null;
    entries.forEach(({ template }) => {
      store.mergeEmbeddedAnswerSets(template.embeddedAnswerSets);
      store.upsertTemplate(template);
      lastCategory = template.category || "andet";
    });
    reloadFromStore();
    if (lastCategory) state.category = lastCategory;
    $("#import-modal").classList.add("hidden");
    showList();
    toast(entries.length === 1 ? "Importeret" : "Importeret " + entries.length + " kontroller");
  });
  actions.appendChild(confirm);
  body.appendChild(actions);
  $("#import-modal").classList.remove("hidden");
}

/* ── Export multiple (.inspectra) ─────────────────────────── */
function showExportPickerModal() {
  const body = $("#export-modal-body");
  const sorted = state.templates
    .slice()
    .sort((a, b) => (a.category || "").localeCompare(b.category || "") || a.name.localeCompare(b.name));

  const rowsHtml = sorted
    .map(
      (t) => `
      <label class="option-row">
        <input type="checkbox" data-export-pick="${esc(t.referenceId)}" checked />
        <span>${esc(t.name.trim() || "Uden navn")} <span style="color:var(--text-muted)">· ${esc(categoryLabel(t.category))} · v${t.version}</span></span>
      </label>`
    )
    .join("");

  body.innerHTML = `
    <h3>Eksportér kontroller</h3>
    ${
      sorted.length
        ? `<div class="answerset-editor">${rowsHtml}</div>
           <div class="modal-actions" style="justify-content:flex-start">
             <button type="button" class="btn ghost small" id="export-select-all">Vælg alle</button>
             <button type="button" class="btn ghost small" id="export-select-none">Fravælg alle</button>
           </div>`
        : '<p class="intro" style="padding:0">Ingen kontroller at eksportere endnu.</p>'
    }
    <div class="modal-actions">
      <button type="button" class="btn secondary" id="export-cancel">Annullér</button>
      <button type="button" class="btn primary" id="export-confirm" ${sorted.length ? "" : "disabled"}>Eksportér valgte</button>
    </div>`;

  function checkboxes() {
    return Array.from(body.querySelectorAll("[data-export-pick]"));
  }

  const selectAll = $("#export-select-all");
  if (selectAll) selectAll.addEventListener("click", () => checkboxes().forEach((cb) => (cb.checked = true)));
  const selectNone = $("#export-select-none");
  if (selectNone) selectNone.addEventListener("click", () => checkboxes().forEach((cb) => (cb.checked = false)));

  $("#export-cancel").addEventListener("click", () => $("#export-modal").classList.add("hidden"));
  $("#export-confirm").addEventListener("click", () => {
    const pickedIds = checkboxes()
      .filter((cb) => cb.checked)
      .map((cb) => cb.dataset.exportPick);
    if (!pickedIds.length) {
      alert("Vælg mindst én kontrol.");
      return;
    }
    const picked = sorted.filter((t) => pickedIds.includes(t.referenceId));
    const invalid = picked.filter((t) => validateTemplate(t).length);
    if (invalid.length) {
      alert(
        "Kan ikke eksportere - følgende har fejl:\n- " +
          invalid.map((t) => t.name.trim() || t.referenceId).join("\n- ")
      );
      return;
    }
    picked.forEach((t) => {
      snapshotEmbeddedAnswerSets(t);
      t.version += 1;
      t.publishedAt = new Date().toISOString();
      touch(t);
    });
    persist();
    const filename = downloadInspectraFileMulti(picked);
    toast("Eksporteret som " + filename);
    $("#export-modal").classList.add("hidden");
    if (currentTemplate()) rerenderEditor();
  });

  $("#export-modal").classList.remove("hidden");
}

/* ── Events: list ──────────────────────────────────────────── */
$("#btn-new").addEventListener("click", addTemplate);
$("#btn-back").addEventListener("click", backToList);

$("#route-list").addEventListener("click", (e) => {
  const card = e.target.closest(".route-card");
  if (card && card.dataset.id) openTemplate(card.dataset.id);
});

$("#import-template-file").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    const parsed = await readInspectraFile(file);
    showImportConflictModal(describeInstalls(parsed.templates));
  } catch (err) {
    alert(err.message || "Kunne ikke importere filen.");
  }
});

$("#btn-export-multi").addEventListener("click", showExportPickerModal);

/* ── Events: editor (delegated) ────────────────────────────── */
$("#editor-body").addEventListener(
  "click",
  (e) => {
    if (e.target.closest(".item-tools") || e.target.closest(".point-head") || e.target.closest(".drag-handle")) e.preventDefault();
  },
  true
);

/* ── Drag & drop reordering (groups, points, rows) ────────── */
// Ordered most-specific first: a point/row handle sits *inside* an
// ancestor group/point container too, and .closest() would happily match
// those outer containers — checking narrowest scope first picks the
// container the handle actually belongs to.
const DRAG_KINDS = [
  {
    attr: "dragRow",
    selector: "[data-drag-row]",
    parseKey: (v) => v.split(":").map(Number),
    reorder: ([gIdx, pIdx], from, to) => reorderRow(gIdx, pIdx, from, to),
    label: () => "Række",
  },
  {
    attr: "dragPoint",
    selector: "[data-drag-point]",
    parseKey: (v) => v.split(":").map(Number),
    reorder: ([gIdx], from, to) => reorderPoint(gIdx, from, to),
    label: (el) => el.querySelector("[data-point-label]")?.value?.trim() || "Kontrolpunkt",
  },
  {
    attr: "dragGroup",
    selector: "[data-drag-group]",
    parseKey: (v) => Number(v),
    reorder: (key, from, to) => reorderGroup(from, to),
    label: (el) => el.querySelector(".item-title")?.textContent?.trim() || "Emne",
  },
];

// Reordering is driven by our own mouse tracking rather than the native
// HTML5 drag API — native drag captures the pointer in a way that also
// suppresses mouse-wheel scrolling in most browsers, which made it
// impossible to scroll the page while dragging. Auto-scroll near the
// viewport edges is kept as the way to reach items further up/down.
let dragPending = null; // { kind, container, startX, startY } — before the move threshold is hit
let dragCtx = null; // { kind, container, key, group, indicator, hoverTarget, hoverBefore } — active drag
let dragPreviewEl = null;

function dragKeyOf(kind, el) {
  const parsed = kind.parseKey(el.dataset[kind.attr]);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function containerForHandle(handle) {
  for (const kind of DRAG_KINDS) {
    const container = handle.closest(kind.selector);
    if (container) return { kind, container };
  }
  return null;
}

function dropIndicator() {
  if (!dragCtx.indicator) {
    const bar = document.createElement("div");
    bar.className = "drop-indicator";
    dragCtx.indicator = bar;
  }
  return dragCtx.indicator;
}

function placeIndicator(el, before) {
  const bar = dropIndicator();
  el.parentNode.insertBefore(bar, before ? el : el.nextSibling);
}

function removeIndicator() {
  if (dragCtx && dragCtx.indicator && dragCtx.indicator.parentNode) {
    dragCtx.indicator.parentNode.removeChild(dragCtx.indicator);
  }
}

function movePreview(x, y) {
  if (dragPreviewEl) {
    dragPreviewEl.style.left = x + 16 + "px";
    dragPreviewEl.style.top = y + 16 + "px";
  }
}

function beginDrag(e) {
  const { kind, container } = dragPending;
  const key = dragKeyOf(kind, container);
  dragCtx = { kind, container, key, group: key.slice(0, -1).join(":"), hoverTarget: null, hoverBefore: null };
  container.classList.add("dragging");
  document.body.classList.add("dragging-active");

  const preview = document.createElement("div");
  preview.className = "drag-preview";
  preview.innerHTML = `<span class="drag-preview-icon">⠿</span><span class="drag-preview-label"></span>`;
  preview.querySelector(".drag-preview-label").textContent = kind.label(container);
  document.body.appendChild(preview);
  dragPreviewEl = preview;
  movePreview(e.clientX, e.clientY);

  startAutoScroll();
}

function onDragMouseMove(e) {
  if (!dragPending) return;
  if (!dragCtx) {
    const dx = e.clientX - dragPending.startX;
    const dy = e.clientY - dragPending.startY;
    if (Math.hypot(dx, dy) < 4) return;
    beginDrag(e);
  }
  movePreview(e.clientX, e.clientY);
  autoScrollY = e.clientY;

  const hit = document.elementFromPoint(e.clientX, e.clientY);
  const target = hit && hit.closest(dragCtx.kind.selector);
  if (!target || target === dragCtx.container || target.classList.contains("dragging")) return;
  const key = dragKeyOf(dragCtx.kind, target);
  if (key.slice(0, -1).join(":") !== dragCtx.group) return;
  const rect = target.getBoundingClientRect();
  const before = e.clientY - rect.top < rect.height / 2;
  placeIndicator(target, before);
  dragCtx.hoverTarget = target;
  dragCtx.hoverBefore = before;
}

function onDragMouseUp() {
  document.removeEventListener("mousemove", onDragMouseMove);
  if (dragCtx) {
    if (dragCtx.hoverTarget) {
      const key = dragKeyOf(dragCtx.kind, dragCtx.hoverTarget);
      const from = dragCtx.key[dragCtx.key.length - 1];
      let to = key[key.length - 1];
      if (!dragCtx.hoverBefore) to += 1;
      if (to > from) to -= 1;
      dragCtx.kind.reorder(dragCtx.key, from, to);
    }
    if (dragCtx.container) dragCtx.container.classList.remove("dragging");
    removeIndicator();
    dragCtx = null;
  }
  document.body.classList.remove("dragging-active");
  stopAutoScroll();
  if (dragPreviewEl) {
    dragPreviewEl.remove();
    dragPreviewEl = null;
  }
  dragPending = null;
}

$("#editor-body").addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  const handle = e.target.closest(".drag-handle");
  if (!handle) return;
  const match = containerForHandle(handle);
  if (!match) return;
  e.preventDefault();
  dragPending = { kind: match.kind, container: match.container, startX: e.clientX, startY: e.clientY };
  document.addEventListener("mousemove", onDragMouseMove);
  document.addEventListener("mouseup", onDragMouseUp, { once: true });
});

/* Auto-scroll the page while dragging near the top/bottom edge, for
   reaching items further up/down than the viewport shows. */
let autoScrollY = null;
let autoScrollRaf = null;

function startAutoScroll() {
  if (autoScrollRaf) return;
  const EDGE = 90;
  const MAX_SPEED = 20;
  const tick = () => {
    if (!dragCtx) {
      autoScrollRaf = null;
      return;
    }
    if (autoScrollY != null) {
      const h = window.innerHeight;
      if (autoScrollY < EDGE) {
        window.scrollBy(0, -MAX_SPEED * (1 - autoScrollY / EDGE));
      } else if (autoScrollY > h - EDGE) {
        window.scrollBy(0, MAX_SPEED * (1 - (h - autoScrollY) / EDGE));
      }
    }
    autoScrollRaf = requestAnimationFrame(tick);
  };
  autoScrollRaf = requestAnimationFrame(tick);
}

function stopAutoScroll() {
  if (autoScrollRaf) cancelAnimationFrame(autoScrollRaf);
  autoScrollRaf = null;
  autoScrollY = null;
}

$("#editor-body").addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;

  if (t.id === "btn-add-item") return addGroup();
  if (t.id === "btn-delete-route") return deleteTemplate();
  if (t.id === "btn-duplicate-template") return duplicateTemplate();
  if (t.id === "btn-export-template") return exportTemplate();

  if (t.dataset.delItem !== undefined) {
    e.preventDefault();
    e.stopPropagation();
    return deleteGroup(Number(t.dataset.delItem));
  }
  if (t.dataset.dupItem !== undefined) {
    e.preventDefault();
    e.stopPropagation();
    return duplicateGroup(Number(t.dataset.dupItem));
  }
  if (t.dataset.clearItemImage !== undefined) {
    const template = currentTemplate();
    const group = template && template.groups[Number(t.dataset.clearItemImage)];
    if (group) {
      group.image = "";
      touch(template);
      persist();
      rerenderEditor();
    }
    return;
  }
  if (t.dataset.addPoint !== undefined) return addPoint(Number(t.dataset.addPoint));

  if (t.dataset.delPoint) {
    const [gIdx, pIdx] = t.dataset.delPoint.split(":").map(Number);
    return deletePoint(gIdx, pIdx);
  }
  if (t.dataset.dupPoint) {
    const [gIdx, pIdx] = t.dataset.dupPoint.split(":").map(Number);
    return duplicatePoint(gIdx, pIdx);
  }
  if (t.dataset.addRow) {
    const [gIdx, pIdx, cols] = t.dataset.addRow.split(":").map(Number);
    return addRow(gIdx, pIdx, cols);
  }
  if (t.dataset.delRow) {
    const [gIdx, pIdx, rIdx] = t.dataset.delRow.split(":").map(Number);
    return deleteRow(gIdx, pIdx, rIdx);
  }
  if (t.dataset.addField) return openFieldTypeModal(t.dataset.addField);
  if (t.dataset.delField) {
    const [gIdx, pIdx, rIdx, fIdx] = t.dataset.delField.split(":").map(Number);
    return deleteField(gIdx, pIdx, rIdx, fIdx);
  }
  if (t.dataset.editAnswerset) {
    const [gIdx, pIdx, rIdx, fIdx] = t.dataset.editAnswerset.split(":").map(Number);
    const { field } = getField(gIdx, pIdx, rIdx, fIdx);
    if (!field || !field.config.answerSetId) {
      alert("Vælg et svarmuligheds-sæt først.");
      return;
    }
    return openAnswerSetModal(field.config.answerSetId);
  }
  if (t.dataset.newAnswerset) {
    const loc = t.dataset.newAnswerset;
    const name = prompt("Navn på nyt svarmuligheds-sæt:");
    if (!name || !name.trim()) return;
    const id = uniqueId(slugify(name), new Set(Object.keys(state.answerSets)));
    const set = { id, name: name.trim(), options: [], defaultOptionIds: [] };
    ensureAnswerSetInLibrary(set);
    const [gIdx, pIdx, rIdx, fIdx] = loc.split(":").map(Number);
    const { template, field } = getField(gIdx, pIdx, rIdx, fIdx);
    if (field) {
      field.config.answerSetId = id;
      touch(template);
      persist();
      renderEditor();
    }
    openAnswerSetModal(id);
  }
});

$("#editor-body").addEventListener("input", (e) => {
  const el = e.target;
  const template = currentTemplate();
  if (!template) return;

  if (el.id === "f-refid") {
    const value = el.value.trim();
    const dup = state.templates.some((t) => t !== template && t.referenceId === value);
    if (!value || dup) return;
    template.referenceId = value;
    state.editingRefId = value;
    touch(template);
    persist();
    return;
  }

  if (el.dataset.field) {
    template[el.dataset.field] = el.value;
    touch(template);
    persist();
    return;
  }

  if (el.dataset.item !== undefined && el.dataset.itemField) {
    const group = template.groups[Number(el.dataset.item)];
    if (!group) return;
    group[el.dataset.itemField] = el.value;
    if (el.dataset.itemField === "name") {
      const title = document.querySelector('[data-item-title="' + el.dataset.item + '"]');
      if (title) {
        title.textContent = el.value.trim() || "Ny " + itemNoun(template, false);
        title.classList.toggle("empty", !el.value.trim());
      }
    }
    touch(template);
    persist();
    return;
  }

  if (el.dataset.pointLabel) {
    const [gIdx, pIdx] = el.dataset.pointLabel.split(":").map(Number);
    const point = template.groups[gIdx] && template.groups[gIdx].points[pIdx];
    if (point) {
      point.label = el.value;
      touch(template);
      persist();
    }
    return;
  }

  if (el.dataset.fieldLabel) {
    const [gIdx, pIdx, rIdx, fIdx] = el.dataset.fieldLabel.split(":").map(Number);
    const { field } = getField(gIdx, pIdx, rIdx, fIdx);
    if (field) {
      field.label = el.value;
      touch(template);
      persist();
    }
    return;
  }

  if (el.dataset.fieldUnit) {
    const [gIdx, pIdx, rIdx, fIdx] = el.dataset.fieldUnit.split(":").map(Number);
    const { field } = getField(gIdx, pIdx, rIdx, fIdx);
    if (field) {
      field.config.unit = el.value;
      touch(template);
      persist();
    }
  }
});

$("#editor-body").addEventListener("change", async (e) => {
  const el = e.target;
  const template = currentTemplate();
  if (!template) return;

  if (el.matches('input[type="file"][data-item-image]')) {
    const file = el.files && el.files[0];
    el.value = "";
    if (!file) return;
    const group = template.groups[Number(el.dataset.itemImage)];
    if (!group) return;
    try {
      group.image = await fileToJpegDataUrl(file, 960, 0.72);
      touch(template);
      persist();
      rerenderEditor();
    } catch (err) {
      toast("Kunne ikke læse billedet");
    }
    return;
  }

  if (el.matches('input[type="file"][data-ref-image]')) {
    const file = el.files && el.files[0];
    el.value = "";
    if (!file) return;
    const [gIdx, pIdx, rIdx, fIdx] = el.dataset.refImage.split(":").map(Number);
    const { field } = getField(gIdx, pIdx, rIdx, fIdx);
    if (!field) return;
    try {
      field.config.src = await fileToJpegDataUrl(file, 1200, 0.75);
      touch(template);
      persist();
      rerenderEditor();
    } catch (err) {
      toast("Kunne ikke læse billedet");
    }
    return;
  }

  if (el.dataset.fieldRequired) {
    const [gIdx, pIdx, rIdx, fIdx] = el.dataset.fieldRequired.split(":").map(Number);
    const { field } = getField(gIdx, pIdx, rIdx, fIdx);
    if (field) {
      field.required = el.checked;
      touch(template);
      persist();
    }
    return;
  }

  if (el.dataset.fieldSource) {
    const [gIdx, pIdx, rIdx, fIdx] = el.dataset.fieldSource.split(":").map(Number);
    const { field } = getField(gIdx, pIdx, rIdx, fIdx);
    if (field) {
      field.config.source = el.value;
      touch(template);
      persist();
    }
    return;
  }

  if (el.dataset.fieldMultiple) {
    const [gIdx, pIdx, rIdx, fIdx] = el.dataset.fieldMultiple.split(":").map(Number);
    const { field } = getField(gIdx, pIdx, rIdx, fIdx);
    if (field) {
      field.config.multiple = el.checked;
      touch(template);
      persist();
    }
    return;
  }

  if (el.dataset.fieldAnswerset) {
    const [gIdx, pIdx, rIdx, fIdx] = el.dataset.fieldAnswerset.split(":").map(Number);
    const { field } = getField(gIdx, pIdx, rIdx, fIdx);
    if (field) {
      field.config.answerSetId = el.value || null;
      touch(template);
      persist();
    }
    return;
  }

  if (!el.dataset.field) return;
  template[el.dataset.field] = el.value;
  touch(template);
  persist();
});

/* ── Boot ──────────────────────────────────────────────────── */
(async function boot() {
  await ensureTemplatesInstalled();
  reloadFromStore();
  showList();
})();
