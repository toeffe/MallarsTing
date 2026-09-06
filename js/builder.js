import { ROUTES, STATUS, STATUS_LABEL } from "./data.js";
import { fileToJpegDataUrl } from "./image.js";

const DRAFT_KEY = "inspectra_builder_draft";
const THEME_KEY = "inspectra_theme";

const PRESETS = {
  maskiner: ["Pakninger", "Remme", "Sensorer", "Nødstop"],
  rengoring: ["Gulv og afløb", "Flader", "Affald"],
};

const SCHEDULE_LABEL = {
  daily: "Daglig",
  weekly: "Ugentlig",
  monthly: "Månedlig",
  yearly: "Årlig",
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

let seq = 1;
function nextId(prefix) {
  return prefix + "-" + Date.now().toString(36) + "-" + seq++;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(text) {
  const s = String(text || "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "id";
}

function uniqueId(base, used) {
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = base + "-" + n;
    n++;
  }
  used.add(id);
  return id;
}

function normalize(routes) {
  if (!Array.isArray(routes)) return [];
  return routes.map((r) => ({
    id: r.id || nextId("rute"),
    name: r.name || "",
    description: r.description || "",
    schedule: r.schedule || "daily",
    category: r.category === "rengoring" ? "rengoring" : "maskiner",
    zoneLabel: r.zoneLabel || "",
    machines: (r.machines || []).map((m) => ({
      id: m.id || nextId("item"),
      name: m.name || "",
      location: m.location || "",
      image: typeof m.image === "string" ? m.image : "",
      checks: (m.checks || []).map((c) => ({
        id: c.id || nextId("punkt"),
        label: c.label || "",
        image: typeof c.image === "string" ? c.image : "",
      })),
    })),
  }));
}

function loadDraft() {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || "");
    if (raw && Array.isArray(raw.routes)) return normalize(raw.routes);
  } catch (err) {
    /* ignore */
  }
  return null;
}

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ routes: state.routes }));
    return true;
  } catch (err) {
    toast("Udkast for stort – fjern et billede eller download data.js");
    return false;
  }
}

const state = {
  category: "maskiner",
  routes: loadDraft() || normalize(clone(ROUTES)),
  editingId: null,
};

function isCleaning(route) {
  return (route || {}).category === "rengoring";
}

function itemNoun(route, plural) {
  if (isCleaning(route)) return plural ? "områder" : "område";
  return plural ? "maskiner" : "maskine";
}

function currentRoute() {
  return state.routes.find((r) => r.id === state.editingId) || null;
}

function isBlankRoute(route) {
  if (!route) return true;
  if (route.name.trim() || route.description.trim() || route.zoneLabel.trim()) {
    return false;
  }
  return route.machines.every(
    (m) =>
      !m.name.trim() &&
      !m.location.trim() &&
      !m.image &&
      m.checks.every((c) => !c.label.trim() && !c.image)
  );
}

function validate(routes) {
  const errors = [];
  if (!routes.length) errors.push("Tilføj mindst én rute.");
  routes.forEach((r, i) => {
    const label = r.name.trim() || "Rute " + (i + 1);
    if (!r.name.trim()) errors.push(label + ": mangler navn.");
    const items = r.machines || [];
    const noun = itemNoun(r, false);
    if (!items.length) errors.push(label + ": tilføj mindst ét " + noun + ".");
    items.forEach((m, j) => {
      const mLabel = m.name.trim() || noun + " " + (j + 1);
      if (!m.name.trim()) errors.push(label + " → " + mLabel + ": mangler navn.");
      const checks = (m.checks || []).filter((c) => c.label.trim());
      if (!checks.length) {
        errors.push(label + " → " + mLabel + ": tilføj mindst ét kontrolpunkt.");
      }
    });
  });
  return errors;
}

function withExportIds(routes) {
  const usedRoutes = new Set();
  return routes.map((route) => {
    const id = uniqueId(slugify(route.name), usedRoutes);
    const usedMachines = new Set();
    const machines = (route.machines || []).map((m) => {
      const mid = uniqueId(slugify(m.name), usedMachines);
      const usedChecks = new Set();
      const checks = (m.checks || [])
        .filter((c) => c.label.trim())
        .map((c) => {
          const row = {
            id: uniqueId(slugify(c.label), usedChecks),
            label: c.label.trim(),
          };
          if (c.image) row.image = c.image;
          return row;
        });
      const machineOut = {
        id: mid,
        name: m.name.trim(),
        location: (m.location || "").trim(),
        checks,
      };
      if (m.image) machineOut.image = m.image;
      return machineOut;
    });
    const out = {
      id,
      name: route.name.trim(),
      description: (route.description || "").trim(),
      schedule: route.schedule || "daily",
      category: route.category || "maskiner",
      machines,
    };
    if (out.category === "rengoring" && (route.zoneLabel || "").trim()) {
      out.zoneLabel = route.zoneLabel.trim();
    }
    return out;
  });
}

function isIdent(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function toJs(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const inner = "  ".repeat(indent + 1);
  if (value === null) return "null";
  const t = typeof value;
  if (t === "string") return JSON.stringify(value);
  if (t === "number" && Number.isFinite(value)) return String(value);
  if (t === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return (
      "[\n" +
      value.map((v) => inner + toJs(v, indent + 1)).join(",\n") +
      "\n" +
      pad +
      "]"
    );
  }
  if (t === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return "{}";
    const lines = keys.map((k) => {
      const key = isIdent(k) ? k : JSON.stringify(k);
      return inner + key + ": " + toJs(value[k], indent + 1);
    });
    return "{\n" + lines.join(",\n") + "\n" + pad + "}";
  }
  return "null";
}

function emitFile(routes) {
  const data = withExportIds(routes);
  return (
    "/** Pre-defined routes & machines – edit freely */\n\n" +
    "export const ROUTES = " +
    toJs(data, 0) +
    ";\n\n" +
    "export const STATUS = " +
    toJs(STATUS, 0) +
    ";\n\n" +
    "export const STATUS_LABEL = " +
    toJs(STATUS_LABEL, 0) +
    ";\n"
  );
}

/* ── Theme ─────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
}

const savedTheme =
  localStorage.getItem(THEME_KEY) ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
applyTheme(savedTheme);

document.querySelectorAll(".theme-toggle").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(cur === "dark" ? "light" : "dark");
  });
});

/* ── Toast ─────────────────────────────────────────── */
let toastTimer = 0;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
}

/* ── Export bar ────────────────────────────────────── */
function updateExportBar() {
  const errors = validate(state.routes);
  const status = $("#export-status");
  const ok = errors.length === 0;
  $("#btn-copy").disabled = !ok;
  $("#btn-download").disabled = !ok;
  status.classList.toggle("ok", ok);
  if (ok) {
    status.textContent = "Klar · " + state.routes.length + " ruter";
    return;
  }
  const extra = errors.length > 1 ? " · +" + (errors.length - 1) : "";
  status.textContent = errors[0] + extra;
}

/* ── List ──────────────────────────────────────────── */
function renderList() {
  $$(".category-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === state.category);
  });
  const newBtn = $("#btn-new");
  newBtn.textContent = state.category === "rengoring" ? "Ny zone" : "Ny rute";

  const list = $("#route-list");
  list.innerHTML = "";
  const filtered = state.routes.filter((r) => r.category === state.category);

  if (!filtered.length) {
    const p = document.createElement("p");
    p.className = "intro";
    p.style.padding = "8px 0 0";
    p.textContent =
      state.category === "rengoring"
        ? "Ingen zoner endnu. Tryk Ny zone."
        : "Ingen ruter endnu. Tryk Ny rute.";
    list.appendChild(p);
    return;
  }

  filtered.forEach((route) => {
    const card = document.createElement("div");
    card.className = "route-card";
    card.dataset.id = route.id;

    const h3 = document.createElement("h3");
    h3.textContent = route.name.trim() || "Uden navn";
    card.appendChild(h3);

    if (route.description.trim()) {
      const desc = document.createElement("p");
      desc.style.cssText = "font-size:0.85rem;color:var(--text-muted)";
      desc.textContent = route.description;
      card.appendChild(desc);
    }

    const meta = document.createElement("div");
    meta.className = "route-meta";
    const s1 = document.createElement("span");
    s1.textContent = route.machines.length + " " + itemNoun(route, true);
    const s2 = document.createElement("span");
    s2.className = "sched-tag";
    s2.textContent = SCHEDULE_LABEL[route.schedule] || route.schedule;
    meta.appendChild(s1);
    meta.appendChild(s2);
    if (route.zoneLabel.trim()) {
      const s3 = document.createElement("span");
      s3.textContent = route.zoneLabel;
      meta.appendChild(s3);
    }
    card.appendChild(meta);
    list.appendChild(card);
  });
}

function showList() {
  state.editingId = null;
  $("#page-header").classList.remove("hidden");
  $("#view-list").classList.remove("hidden");
  $("#view-editor").classList.add("hidden");
  renderList();
  updateExportBar();
}

function showEditor() {
  $("#page-header").classList.add("hidden");
  $("#view-list").classList.add("hidden");
  $("#view-editor").classList.remove("hidden");
  renderEditor();
  updateExportBar();
  window.scrollTo(0, 0);
}

/* ── Editor ────────────────────────────────────────── */
function emptyItem() {
  return {
    id: nextId("item"),
    name: "",
    location: "",
    image: "",
    checks: [{ id: nextId("punkt"), label: "", image: "" }],
  };
}

const UPLOAD_ICON =
  '<svg class="upload-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>';

function photoPicker(src, inputAttrs, emptyText, sizeClass) {
  const has = !!src;
  const cls = "photo-pick" + (sizeClass ? " " + sizeClass : "") + (has ? " has-img" : "");
  const empty =
    sizeClass === "sm"
      ? UPLOAD_ICON
      : UPLOAD_ICON + '<span class="photo-pick-label">' + esc(emptyText) + "</span>";
  return `
    <label class="${cls}" title="Upload billede">
      <input type="file" accept="image/*" ${inputAttrs} />
      ${has ? `<img src="${src}" alt="" />` : `<span class="photo-pick-empty">${empty}</span>`}
    </label>`;
}

function rerenderEditor() {
  const y = window.scrollY;
  renderEditor();
  window.scrollTo(0, y);
}

function renderEditor() {
  const route = currentRoute();
  if (!route) {
    showList();
    return;
  }

  const cleaning = isCleaning(route);
  $("#editor-title").textContent = cleaning ? "Rediger zone" : "Rediger rute";
  $("#editor-sub").textContent = cleaning ? "Rengøring" : "Maskiner";

  const noun = itemNoun(route, false);
  const nounPlural = itemNoun(route, true);
  const presets = PRESETS[route.category] || [];

  const zoneField = cleaning
    ? `<div class="field">
        <label for="f-zone">Zone-navn</label>
        <input id="f-zone" type="text" data-field="zoneLabel" value="${esc(route.zoneLabel)}" placeholder="Fx Blå · Vask" />
      </div>`
    : "";

  const itemsHtml = route.machines
    .map((m, idx) => {
      const title = m.name.trim() || "Nyt " + noun;
      const titleClass = m.name.trim() ? "item-title" : "item-title empty";
      const checks = m.checks
        .map((c, ci) => {
          const photo = photoPicker(
            c.image,
            `data-image="${idx}:${ci}"`,
            "Upload",
            "sm"
          );
          const clear = c.image
            ? `<button type="button" class="btn ghost icon" data-clear-image="${idx}:${ci}" title="Fjern billede">⌫</button>`
            : "";
          return `
          <div class="check-row">
            ${photo}
            <input type="text" data-item="${idx}" data-check="${ci}" value="${esc(c.label)}" placeholder="Kontrolpunkt" />
            ${clear}
            <button type="button" class="btn ghost icon" data-del-check="${idx}:${ci}" title="Fjern punkt">×</button>
          </div>`;
        })
        .join("");
      const chips = presets
        .map(
          (p) =>
            `<button type="button" class="chip" data-preset="${idx}" data-label="${esc(p)}">${esc(p)}</button>`
        )
        .join("");

      return `
        <details class="item-card" open>
          <summary>
            <span class="${titleClass}" data-item-title="${idx}">${esc(title)}</span>
            <span class="item-tools">
              <button type="button" class="btn ghost icon" data-move="${idx}:-1" ${idx === 0 ? "disabled" : ""} title="Flyt op">↑</button>
              <button type="button" class="btn ghost icon" data-move="${idx}:1" ${idx === route.machines.length - 1 ? "disabled" : ""} title="Flyt ned">↓</button>
              <button type="button" class="btn ghost icon" data-del-item="${idx}" title="Slet">×</button>
            </span>
          </summary>
          <div class="item-fields">
            <div class="form-row-2">
              <div class="field">
                <label>Navn</label>
                <input type="text" data-item="${idx}" data-item-field="name" value="${esc(m.name)}" placeholder="Navn på ${noun}" />
              </div>
              <div class="field">
                <label>Placering</label>
                <input type="text" data-item="${idx}" data-item-field="location" value="${esc(m.location)}" placeholder="${cleaning ? "Fx Blå zone · venstre linje" : "Fx Hal A · Zone 1"}" />
              </div>
            </div>
            <div class="field">
              <label>Billede (valgfrit)</label>
              ${photoPicker(m.image, `data-item-image="${idx}"`, "Tilføj billede")}
              ${m.image ? `<button type="button" class="btn ghost small" data-clear-item-image="${idx}">Fjern billede</button>` : ""}
            </div>
            <div>
              <p class="checks-label">Kontrolpunkter · billede vises i appen</p>
              ${checks}
              <button type="button" class="btn secondary small" data-add-check="${idx}">+ Punkt</button>
              <div class="presets">${chips}</div>
            </div>
          </div>
        </details>`;
    })
    .join("");

  const emptyItems = route.machines.length
    ? ""
    : `<p class="intro" style="padding:0">Ingen ${nounPlural} endnu.</p>`;

  $("#editor-body").innerHTML = `
    <div class="form-card">
      <div class="form-grid">
        <div class="form-row-2">
          <div class="field">
            <label for="f-name">Navn</label>
            <input id="f-name" type="text" data-field="name" value="${esc(route.name)}" placeholder="${cleaning ? "Fx Blå zone – Vask" : "Fx Rute 1 – Hal A"}" />
          </div>
          <div class="field">
            <label for="f-schedule">Interval</label>
            <select id="f-schedule" data-field="schedule">
              <option value="daily"${route.schedule === "daily" ? " selected" : ""}>Daglig</option>
              <option value="weekly"${route.schedule === "weekly" ? " selected" : ""}>Ugentlig</option>
              <option value="monthly"${route.schedule === "monthly" ? " selected" : ""}>Månedlig</option>
              <option value="yearly"${route.schedule === "yearly" ? " selected" : ""}>Årlig</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="f-desc">Beskrivelse</label>
          <textarea id="f-desc" data-field="description" placeholder="Kort om runden">${esc(route.description)}</textarea>
        </div>
        ${zoneField}
      </div>
    </div>
    <div class="section-head">
      <h3>${nounPlural.charAt(0).toUpperCase() + nounPlural.slice(1)}</h3>
      <button type="button" class="btn secondary small" id="btn-add-item">Tilføj ${noun}</button>
    </div>
    <div class="item-list">
      ${emptyItems}
      ${itemsHtml}
    </div>
    <div class="editor-danger">
      <button type="button" class="btn secondary full" id="btn-delete-route">Slet ${cleaning ? "zone" : "rute"}</button>
    </div>
  `;
}

function persist() {
  saveDraft();
  updateExportBar();
}

function addRoute() {
  const route = {
    id: nextId("rute"),
    name: "",
    description: "",
    schedule: "daily",
    category: state.category,
    zoneLabel: "",
    machines: [emptyItem()],
  };
  state.routes.push(route);
  state.editingId = route.id;
  persist();
  showEditor();
  const name = $("#f-name");
  if (name) name.focus();
}

function openRoute(id) {
  state.editingId = id;
  showEditor();
}

function backToList() {
  const route = currentRoute();
  if (route && isBlankRoute(route)) {
    state.routes = state.routes.filter((r) => r.id !== route.id);
    persist();
  }
  showList();
}

function deleteRoute() {
  const route = currentRoute();
  if (!route) return;
  const label = route.name.trim() || (isCleaning(route) ? "zonen" : "ruten");
  if (!confirm("Slet " + label + "?")) return;
  state.routes = state.routes.filter((r) => r.id !== route.id);
  persist();
  showList();
}

function addItem() {
  const route = currentRoute();
  if (!route) return;
  route.machines.push(emptyItem());
  persist();
  renderEditor();
}

function moveItem(idx, dir) {
  const route = currentRoute();
  if (!route) return;
  const to = idx + dir;
  if (to < 0 || to >= route.machines.length) return;
  const arr = route.machines;
  const tmp = arr[idx];
  arr[idx] = arr[to];
  arr[to] = tmp;
  persist();
  renderEditor();
}

function deleteItem(idx) {
  const route = currentRoute();
  if (!route) return;
  const item = route.machines[idx];
  const label = (item && item.name.trim()) || itemNoun(route, false);
  if (!confirm("Slet " + label + "?")) return;
  route.machines.splice(idx, 1);
  persist();
  renderEditor();
}

function addCheck(idx) {
  const route = currentRoute();
  if (!route || !route.machines[idx]) return;
  route.machines[idx].checks.push({ id: nextId("punkt"), label: "", image: "" });
  persist();
  renderEditor();
  const inputs = $$('#editor-body input[data-check]');
  const last = inputs.filter((el) => el.dataset.item === String(idx)).pop();
  if (last) last.focus();
}

function deleteCheck(itemIdx, checkIdx) {
  const route = currentRoute();
  if (!route || !route.machines[itemIdx]) return;
  route.machines[itemIdx].checks.splice(checkIdx, 1);
  persist();
  renderEditor();
}

function addPreset(itemIdx, label) {
  const route = currentRoute();
  const item = route && route.machines[itemIdx];
  if (!item) return;
  const exists = item.checks.some(
    (c) => c.label.trim().toLowerCase() === label.toLowerCase()
  );
  if (exists) return;
  const empty = item.checks.find((c) => !c.label.trim());
  if (empty) empty.label = label;
  else item.checks.push({ id: nextId("punkt"), label, image: "" });
  persist();
  renderEditor();
}

/* ── Events ────────────────────────────────────────── */
$$(".category-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.category = btn.dataset.category;
    renderList();
  });
});

$("#btn-new").addEventListener("click", addRoute);
$("#btn-back").addEventListener("click", backToList);

$("#route-list").addEventListener("click", (e) => {
  const card = e.target.closest(".route-card");
  if (card && card.dataset.id) openRoute(card.dataset.id);
});

$("#editor-body").addEventListener(
  "click",
  (e) => {
    if (e.target.closest(".item-tools")) e.preventDefault();
  },
  true
);

$("#editor-body").addEventListener("click", (e) => {
  const t = e.target.closest("[data-move], [data-del-item], [data-add-check], [data-del-check], [data-preset], [data-clear-image], [data-clear-item-image], #btn-add-item, #btn-delete-route");
  if (!t) return;

  if (t.id === "btn-add-item") {
    addItem();
    return;
  }
  if (t.id === "btn-delete-route") {
    deleteRoute();
    return;
  }

  if (t.dataset.move) {
    e.preventDefault();
    e.stopPropagation();
    const [idx, dir] = t.dataset.move.split(":").map(Number);
    moveItem(idx, dir);
    return;
  }
  if (t.dataset.delItem !== undefined) {
    e.preventDefault();
    e.stopPropagation();
    deleteItem(Number(t.dataset.delItem));
    return;
  }
  if (t.dataset.addCheck !== undefined) {
    addCheck(Number(t.dataset.addCheck));
    return;
  }
  if (t.dataset.delCheck) {
    const [i, c] = t.dataset.delCheck.split(":").map(Number);
    deleteCheck(i, c);
    return;
  }
  if (t.dataset.preset !== undefined) {
    addPreset(Number(t.dataset.preset), t.dataset.label);
    return;
  }
  if (t.dataset.clearImage) {
    const [i, c] = t.dataset.clearImage.split(":").map(Number);
    const item = currentRoute() && currentRoute().machines[i];
    if (item && item.checks[c]) {
      item.checks[c].image = "";
      persist();
      rerenderEditor();
    }
    return;
  }
  if (t.dataset.clearItemImage !== undefined) {
    const item = currentRoute() && currentRoute().machines[Number(t.dataset.clearItemImage)];
    if (item) {
      item.image = "";
      persist();
      rerenderEditor();
    }
  }
});

$("#editor-body").addEventListener("input", (e) => {
  const el = e.target;
  const route = currentRoute();
  if (!route) return;

  if (el.dataset.field) {
    route[el.dataset.field] = el.value;
    persist();
    return;
  }

  if (el.dataset.item !== undefined && el.dataset.itemField) {
    const item = route.machines[Number(el.dataset.item)];
    if (!item) return;
    item[el.dataset.itemField] = el.value;
    if (el.dataset.itemField === "name") {
      const title = document.querySelector(
        '[data-item-title="' + el.dataset.item + '"]'
      );
      if (title) {
        const noun = itemNoun(route, false);
        title.textContent = el.value.trim() || "Nyt " + noun;
        title.classList.toggle("empty", !el.value.trim());
      }
    }
    persist();
    return;
  }

  if (el.dataset.item !== undefined && el.dataset.check !== undefined) {
    const item = route.machines[Number(el.dataset.item)];
    const check = item && item.checks[Number(el.dataset.check)];
    if (!check) return;
    check.label = el.value;
    persist();
  }
});

$("#editor-body").addEventListener("change", async (e) => {
  const el = e.target;
  const route = currentRoute();
  if (!route) return;

  if (el.matches('input[type="file"][data-image]')) {
    const file = el.files && el.files[0];
    el.value = "";
    if (!file) return;
    const [itemIdx, checkIdx] = el.dataset.image.split(":").map(Number);
    const check = route.machines[itemIdx] && route.machines[itemIdx].checks[checkIdx];
    if (!check) return;
    try {
      check.image = await fileToJpegDataUrl(file, 880, 0.7);
      persist();
      rerenderEditor();
    } catch (err) {
      toast("Kunne ikke læse billedet");
    }
    return;
  }

  if (el.matches('input[type="file"][data-item-image]')) {
    const file = el.files && el.files[0];
    el.value = "";
    if (!file) return;
    const item = route.machines[Number(el.dataset.itemImage)];
    if (!item) return;
    try {
      item.image = await fileToJpegDataUrl(file, 960, 0.72);
      persist();
      rerenderEditor();
    } catch (err) {
      toast("Kunne ikke læse billedet");
    }
    return;
  }

  if (!el.dataset.field) return;
  route[el.dataset.field] = el.value;
  persist();
});

$("#btn-restore").addEventListener("click", () => {
  if (
    !confirm(
      "Gendan ruterne fra data.js? Dit udkast i browseren slettes."
    )
  ) {
    return;
  }
  localStorage.removeItem(DRAFT_KEY);
  state.routes = normalize(clone(ROUTES));
  state.editingId = null;
  showList();
  toast("Gendannet fra data.js");
});

$("#btn-copy").addEventListener("click", async () => {
  if (validate(state.routes).length) return;
  const text = emitFile(state.routes);
  try {
    await navigator.clipboard.writeText(text);
    toast("Kopieret til udklipsholder");
  } catch (err) {
    toast("Kunne ikke kopiere – brug Download");
  }
});

$("#btn-download").addEventListener("click", () => {
  if (validate(state.routes).length) return;
  const text = emitFile(state.routes);
  const blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Downloadet – erstat js/data.js");
});

showList();
