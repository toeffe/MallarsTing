export const KEYS = {
  TEMPLATES: "inspectra_templates",
  ANSWERSETS: "inspectra_answersets",
  HISTORY: "inspectra_history",
  DONE: "inspectra_done",
  CATEGORIES: "inspectra_categories",
};

function readMap(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch (err) {
    return {};
  }
}

function writeMap(key, map) {
  try {
    localStorage.setItem(key, JSON.stringify(map));
    return true;
  } catch (err) {
    return false;
  }
}

/* ── templates ─────────────────────────────────────────── */

export function getTemplates() {
  return readMap(KEYS.TEMPLATES);
}

export function getTemplate(referenceId) {
  return getTemplates()[referenceId] || null;
}

export function saveTemplates(map) {
  return writeMap(KEYS.TEMPLATES, map);
}

export function upsertTemplate(template) {
  const map = getTemplates();
  map[template.referenceId] = template;
  return writeMap(KEYS.TEMPLATES, map);
}

export function deleteTemplate(referenceId) {
  const map = getTemplates();
  delete map[referenceId];
  return writeMap(KEYS.TEMPLATES, map);
}

export function hasAnyTemplates() {
  return Object.keys(getTemplates()).length > 0;
}

/* ── answer sets (shared library) ─────────────────────── */

export function getAnswerSets() {
  return readMap(KEYS.ANSWERSETS);
}

export function saveAnswerSets(map) {
  return writeMap(KEYS.ANSWERSETS, map);
}

export function upsertAnswerSet(set) {
  const map = getAnswerSets();
  map[set.id] = set;
  writeMap(KEYS.ANSWERSETS, map);
  return set;
}

export function deleteAnswerSet(id) {
  const map = getAnswerSets();
  delete map[id];
  return writeMap(KEYS.ANSWERSETS, map);
}

/**
 * Installs any answer sets embedded in a template into the shared global
 * library, without overwriting sets that already exist locally (a
 * company's own customized shared vocabulary always wins over an
 * imported template's copy of the same id).
 */
export function mergeEmbeddedAnswerSets(embeddedAnswerSets) {
  if (!embeddedAnswerSets) return;
  const map = getAnswerSets();
  let changed = false;
  Object.keys(embeddedAnswerSets).forEach((id) => {
    if (!map[id]) {
      map[id] = embeddedAnswerSets[id];
      changed = true;
    }
  });
  if (changed) writeMap(KEYS.ANSWERSETS, map);
}

/* ── history ───────────────────────────────────────────── */

export function getHistory() {
  return readMap(KEYS.HISTORY);
}

export function getHistoryEntry(id) {
  return getHistory()[id] || null;
}

export function addHistoryEntry(entry) {
  const map = getHistory();
  map[entry.id] = entry;
  return writeMap(KEYS.HISTORY, map);
}

/* ── categories ────────────────────────────────────────── */

function readList(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (err) {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  } catch (err) {
    return false;
  }
}

export function getCategories() {
  return readList(KEYS.CATEGORIES);
}

export function addCategory(slug) {
  const list = getCategories();
  if (!list.includes(slug)) {
    list.push(slug);
    writeList(KEYS.CATEGORIES, list);
  }
}

export function deleteCategory(slug) {
  const list = getCategories().filter((c) => c !== slug);
  return writeList(KEYS.CATEGORIES, list);
}

/* ── "done this period" flags ─────────────────────────── */

export function getDoneMap() {
  return readMap(KEYS.DONE);
}

export function saveDoneMap(map) {
  return writeMap(KEYS.DONE, map);
}
