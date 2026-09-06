import { downloadBlob } from "./util.js";
import { getTemplate } from "./store.js";

const FORMAT_VERSION = 1;

export function buildInspectraFile(template) {
  return {
    formatVersion: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    template: template,
  };
}

export function buildInspectraFileMulti(templates) {
  return {
    formatVersion: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    templates: templates,
  };
}

export function downloadInspectraFile(template) {
  const payload = buildInspectraFile(template);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const filename = template.referenceId + "_v" + template.version + ".inspectra";
  downloadBlob(blob, filename);
  return filename;
}

/**
 * Exports several templates in a single .inspectra file. With exactly one
 * template this reuses the normal single-template filename/shape so a
 * one-item selection behaves the same as the regular export button.
 */
export function downloadInspectraFileMulti(templates) {
  if (templates.length === 1) return downloadInspectraFile(templates[0]);
  const payload = buildInspectraFileMulti(templates);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const filename = "Inspectra_" + templates.length + "-kontroller_" + new Date().toISOString().slice(0, 10) + ".inspectra";
  downloadBlob(blob, filename);
  return filename;
}

function isValidTemplateShape(t) {
  return !!(t && typeof t === "object" && t.referenceId && t.name && Array.isArray(t.groups));
}

/**
 * Parses a .inspectra file. Normalizes both the single-template shape
 * ({ template }) and the multi-template shape ({ templates: [...] }) into
 * a `templates` array on the returned object, so callers only need to
 * handle one case.
 */
export function parseInspectraFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error("Filen kunne ikke læses som Inspectra-data.");
  }
  if (!data || typeof data !== "object") {
    throw new Error("Filen indeholder ikke en gyldig kontrolskabelon.");
  }
  const templates = Array.isArray(data.templates)
    ? data.templates
    : data.template
      ? [data.template]
      : null;
  if (!templates || !templates.length) {
    throw new Error("Filen indeholder ikke en gyldig kontrolskabelon.");
  }
  if (!templates.every(isValidTemplateShape)) {
    throw new Error("Kontrolskabelonen mangler påkrævede felter.");
  }
  return Object.assign({}, data, { templates });
}

export function readInspectraFile(file) {
  return file.text().then(parseInspectraFile);
}

/**
 * Compares an imported template against whatever is already installed
 * locally under the same referenceId.
 * Returns one of:
 *   { action: "new" }
 *   { action: "update", installedVersion, importedVersion }
 *   { action: "same-or-older", installedVersion, importedVersion }
 */
export function describeInstall(incomingTemplate) {
  const existing = getTemplate(incomingTemplate.referenceId);
  if (!existing) return { action: "new" };
  if (incomingTemplate.version > existing.version) {
    return {
      action: "update",
      installedVersion: existing.version,
      importedVersion: incomingTemplate.version,
      installedUpdatedAt: existing.updatedAt,
    };
  }
  return {
    action: "same-or-older",
    installedVersion: existing.version,
    importedVersion: incomingTemplate.version,
  };
}

/** Same as describeInstall, but for every template in a parsed multi-file. */
export function describeInstalls(templates) {
  return templates.map((template) => ({ template, decision: describeInstall(template) }));
}
