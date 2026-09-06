globalThis.localStorage = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
};

import { writeFileSync } from "fs";
import { ROUTES } from "../src/data.js";
import { convertLegacyRoute } from "../js/migrate.js";

const templates = ROUTES.map(convertLegacyRoute);
const body =
  "// Builtin Mallars Ting kontroller — generated from src/data.js via convertLegacyRoute.\n" +
  "// Regenerate: node scripts/gen-seed.mjs\n" +
  "export const SEED_TEMPLATES = " +
  JSON.stringify(templates, null, 2) +
  ";\n";

writeFileSync(new URL("../js/seed-templates.js", import.meta.url), body);
console.log("wrote", templates.length, "templates,", body.length, "chars");
console.log(templates.map((t) => t.referenceId + " (" + t.category + ")").join("\n"));
