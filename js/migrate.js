import { nextId } from "./util.js";
import * as store from "./store.js";

export const BUILTIN_ANSWER_SETS = {
  tilstand: {
    id: "tilstand",
    name: "Tilstand",
    options: [
      { id: "ok", label: "OK" },
      { id: "slidt", label: "Slidt" },
      { id: "kritisk", label: "Kritisk" },
    ],
    defaultOptionIds: [],
  },
  "rengoring-status": {
    id: "rengoring-status",
    name: "Rengøring-status",
    options: [
      { id: "udfort", label: "Udført" },
      { id: "ikke-aktuelt", label: "Ikke aktuelt" },
      { id: "afvigelse", label: "Afvigelse" },
    ],
    defaultOptionIds: [],
  },
};

function answerSetIdForCategory(category) {
  return category === "rengoring" ? "rengoring-status" : "tilstand";
}

function convertCheck(check, category, answerSetId) {
  const isMaskiner = category !== "rengoring";
  const rows = [];

  if (check.image) {
    rows.push({
      id: nextId("raekke"),
      columns: 1,
      fields: [
        {
          id: nextId("felt"),
          type: "reference_image",
          label: "Reference",
          required: false,
          config: { src: check.image },
        },
      ],
    });
  }

  rows.push({
    id: nextId("raekke"),
    columns: 1,
    fields: [
      {
        id: nextId("felt"),
        type: "single_choice",
        label: isMaskiner ? "Tilstand" : "Status",
        required: true,
        config: { answerSetId: answerSetId },
      },
    ],
  });

  rows.push({
    id: nextId("raekke"),
    columns: 1,
    fields: [
      {
        id: nextId("felt"),
        type: "comment",
        label: "Kommentar",
        required: isMaskiner,
        config: {},
      },
    ],
  });

  rows.push({
    id: nextId("raekke"),
    columns: 1,
    fields: [
      {
        id: nextId("felt"),
        type: "photo",
        label: "Foto",
        required: isMaskiner,
        config: { source: "both", multiple: false },
      },
    ],
  });

  return { id: check.id || nextId("punkt"), label: check.label, rows: rows };
}

/**
 * Converts one legacy Route ({id,name,description,schedule,category,
 * zoneLabel,machines:[{id,name,location,image,checks:[{id,label,image}]}]})
 * into a new generic Template. Used both for the shipped seed data and for
 * migrating an end user's existing builder draft.
 */
export function convertLegacyRoute(route) {
  const category = route.category === "rengoring" ? "rengoring" : "maskiner";
  const answerSetId = answerSetIdForCategory(category);
  const answerSet = BUILTIN_ANSWER_SETS[answerSetId];
  const now = new Date().toISOString();

  return {
    referenceId: route.id,
    name: route.name || "",
    description: route.description || "",
    category: category,
    schedule: route.schedule || "daily",
    zoneLabel: route.zoneLabel || "",
    executionView: "begge",
    version: 1,
    updatedAt: now,
    publishedAt: now,
    builtin: true,
    embeddedAnswerSets: { [answerSet.id]: answerSet },
    groups: (route.machines || []).map((m) => ({
      id: m.id || nextId("gruppe"),
      name: m.name || "",
      location: m.location || "",
      image: m.image || "",
      points: (m.checks || [])
        .filter((c) => c.label && c.label.trim())
        .map((c) => convertCheck(c, category, answerSetId)),
    })),
  };
}

function installTemplate(template) {
  store.mergeEmbeddedAnswerSets(template.embeddedAnswerSets);
  store.upsertTemplate(template);
}

/**
 * One-time upgrade path: if a legacy builder draft exists in localStorage,
 * convert it into the new Template shape and install it, then remove the
 * legacy key. Returns true if a migration happened.
 */
export function migrateLegacyDraftIfPresent() {
  const DRAFT_KEY = "inspectra_builder_draft";
  let raw;
  try {
    raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || "");
  } catch (err) {
    raw = null;
  }
  if (!raw || !Array.isArray(raw.routes) || !raw.routes.length) {
    return false;
  }
  raw.routes.forEach((route) => {
    installTemplate(convertLegacyRoute(route));
  });
  localStorage.removeItem(DRAFT_KEY);
  return true;
}

/**
 * Installs the shipped seed templates as builtin entries. Only called when
 * no legacy draft was migrated and no templates are installed yet.
 */
export function installSeedTemplates(seedTemplates) {
  seedTemplates.forEach((template) => installTemplate(template));
}

/**
 * Runs at startup in both entry points: migrate a legacy draft if present,
 * otherwise install the shipped seed data if nothing is installed yet.
 */
export async function ensureTemplatesInstalled() {
  const migrated = migrateLegacyDraftIfPresent();
  if (!migrated && !store.hasAnyTemplates()) {
    const mod = await import("./seed-templates.js");
    installSeedTemplates(mod.SEED_TEMPLATES);
  }
}
