import { esc, nextId } from "./util.js";

export const FIELD_TYPE_LIST = [
  "heading",
  "short_text",
  "long_text",
  "comment",
  "number",
  "yesno",
  "single_choice",
  "multi_choice",
  "dropdown",
  "date",
  "photo",
  "reference_image",
  "signature",
];

const META = {
  heading: { icon: "═", label: "Overskrift" },
  short_text: { icon: "—", label: "Kort tekst" },
  long_text: { icon: "≡", label: "Lang tekst" },
  comment: { icon: "❝", label: "Kommentar" },
  number: { icon: "#", label: "Tal" },
  yesno: { icon: "✓", label: "Ja/Nej" },
  single_choice: { icon: "◉", label: "Enkeltvalg" },
  multi_choice: { icon: "☑", label: "Checkbokse" },
  dropdown: { icon: "▾", label: "Dropdown" },
  date: { icon: "▦", label: "Dato" },
  photo: { icon: "▣", label: "Kontrolbillede" },
  reference_image: { icon: "▧", label: "Referencebillede" },
  signature: { icon: "✎", label: "Signatur" },
};

export function iconFor(type) {
  return (META[type] || {}).icon || "?";
}

export function labelFor(type) {
  return (META[type] || {}).label || type;
}

export function defaultConfig(type) {
  switch (type) {
    case "number":
      return { min: null, max: null, step: null, unit: "" };
    case "single_choice":
    case "multi_choice":
    case "dropdown":
      return { answerSetId: null };
    case "photo":
      return { source: "both", multiple: true };
    case "reference_image":
      return { src: "" };
    default:
      return {};
  }
}

export function newField(type) {
  return {
    id: nextId("felt"),
    type: type,
    label: labelFor(type),
    required: false,
    config: defaultConfig(type),
  };
}

function isAnswerType(type) {
  return type === "single_choice" || type === "multi_choice" || type === "dropdown";
}

function answerSetFor(field, answerSets) {
  const id = field.config && field.config.answerSetId;
  return (id && answerSets && answerSets[id]) || null;
}

function optionLabel(answerSet, optionId) {
  if (!answerSet) return optionId;
  const opt = (answerSet.options || []).find((o) => o.id === optionId);
  return opt ? opt.label : optionId;
}

/* ── value helpers ─────────────────────────────────────── */

export function isRequiredFieldFilled(field, value) {
  if (!field.required) return true;
  switch (field.type) {
    case "heading":
    case "reference_image":
      return true;
    case "number":
    case "date":
    case "short_text":
    case "long_text":
    case "comment":
    case "single_choice":
    case "dropdown":
    case "signature":
      return value !== null && value !== undefined && String(value).trim() !== "";
    case "yesno":
      return value === "yes" || value === "no";
    case "multi_choice":
    case "photo":
      return Array.isArray(value) && value.length > 0;
    default:
      return true;
  }
}

export function formatValueForPdf(field, value, answerSets) {
  switch (field.type) {
    case "heading":
      return { kind: "heading", text: field.label };
    case "reference_image":
      return field.config.src
        ? { kind: "image", images: [field.config.src] }
        : { kind: "none" };
    case "short_text":
    case "long_text":
    case "comment":
      return { kind: "text", text: value ? String(value) : "" };
    case "number": {
      if (value === null || value === undefined || value === "") return { kind: "text", text: "" };
      const unit = field.config.unit ? " " + field.config.unit : "";
      return { kind: "text", text: String(value) + unit };
    }
    case "date":
      return { kind: "text", text: value ? String(value) : "" };
    case "yesno":
      return { kind: "text", text: value === "yes" ? "Ja" : value === "no" ? "Nej" : "" };
    case "single_choice":
    case "dropdown": {
      const set = answerSetFor(field, answerSets);
      return { kind: "text", text: value ? optionLabel(set, value) : "" };
    }
    case "multi_choice": {
      const set = answerSetFor(field, answerSets);
      const labels = (Array.isArray(value) ? value : []).map((id) => optionLabel(set, id));
      return { kind: "text", text: labels.join(", ") };
    }
    case "photo":
      return Array.isArray(value) && value.length
        ? { kind: "images", images: value }
        : { kind: "none" };
    case "signature":
      return value ? { kind: "image", images: [value] } : { kind: "none" };
    default:
      return { kind: "none" };
  }
}

/* ── rendering ─────────────────────────────────────────── */

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function labelRow(field) {
  const row = el("div", "field-label");
  row.appendChild(el("span", null, field.label));
  if (field.required) row.appendChild(el("span", "field-required-mark", "*"));
  return row;
}

function renderHeading(field) {
  const wrap = el("div", "field-cell field-heading");
  wrap.appendChild(el("h4", null, field.label));
  return wrap;
}

function renderReferenceImage(field, ctx) {
  const wrap = el("div", "field-cell field-reference-image");
  wrap.appendChild(labelRow(field));
  if (field.config.src) {
    const img = el("img");
    img.src = field.config.src;
    img.alt = field.label;
    if (ctx.helpers && ctx.helpers.showLightbox) {
      img.addEventListener("click", () => ctx.helpers.showLightbox(field.config.src));
    }
    wrap.appendChild(img);
  } else {
    wrap.appendChild(el("div", "field-empty-note", "Intet referencebillede"));
  }
  return wrap;
}

function renderText(field, value, onChange, ctx, multiline) {
  const wrap = el("div", "field-cell");
  wrap.appendChild(labelRow(field));
  const input = el(multiline ? "textarea" : "input");
  if (!multiline) input.type = "text";
  input.value = value || "";
  input.placeholder = field.config.placeholder || "";
  input.disabled = ctx.mode !== "execute";
  input.addEventListener("input", () => onChange(input.value));
  wrap.appendChild(input);
  return wrap;
}

function renderNumber(field, value, onChange, ctx) {
  const wrap = el("div", "field-cell");
  wrap.appendChild(labelRow(field));
  const input = el("input");
  input.type = "number";
  if (field.config.min !== null && field.config.min !== undefined && field.config.min !== "") input.min = field.config.min;
  if (field.config.max !== null && field.config.max !== undefined && field.config.max !== "") input.max = field.config.max;
  if (field.config.step !== null && field.config.step !== undefined && field.config.step !== "") input.step = field.config.step;
  input.value = value === null || value === undefined ? "" : value;
  input.disabled = ctx.mode !== "execute";
  input.addEventListener("input", () => onChange(input.value === "" ? null : Number(input.value)));
  wrap.appendChild(input);
  if (field.config.unit) wrap.appendChild(el("span", "field-unit", field.config.unit));
  return wrap;
}

function renderDate(field, value, onChange, ctx) {
  const wrap = el("div", "field-cell");
  wrap.appendChild(labelRow(field));
  const input = el("input");
  input.type = "date";
  input.value = value || "";
  input.disabled = ctx.mode !== "execute";
  input.addEventListener("input", () => onChange(input.value || null));
  wrap.appendChild(input);
  return wrap;
}

function renderYesNo(field, value, onChange, ctx) {
  const wrap = el("div", "field-cell");
  wrap.appendChild(labelRow(field));
  const row = el("div", "status-row status-row-2");
  [
    { id: "yes", label: "Ja" },
    { id: "no", label: "Nej" },
  ].forEach((opt) => {
    const btn = el("button", "status-btn" + (value === opt.id ? " active" : ""), opt.label);
    btn.type = "button";
    btn.disabled = ctx.mode !== "execute";
    btn.addEventListener("click", () => {
      row.querySelectorAll(".status-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      onChange(opt.id);
    });
    row.appendChild(btn);
  });
  wrap.appendChild(row);
  return wrap;
}

function renderSingleChoice(field, value, onChange, ctx) {
  const wrap = el("div", "field-cell");
  wrap.appendChild(labelRow(field));
  const set = answerSetFor(field, ctx.answerSets);
  if (!set || !set.options.length) {
    wrap.appendChild(el("div", "field-empty-note", "Ingen svarmuligheder valgt"));
    return wrap;
  }
  const row = el("div", "status-row status-row-wrap");
  set.options.forEach((opt) => {
    const btn = el("button", "status-btn" + (value === opt.id ? " active" : ""), opt.label);
    btn.type = "button";
    btn.disabled = ctx.mode !== "execute";
    btn.addEventListener("click", () => {
      row.querySelectorAll(".status-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      onChange(opt.id);
    });
    row.appendChild(btn);
  });
  wrap.appendChild(row);
  return wrap;
}

function renderMultiChoice(field, value, onChange, ctx) {
  const wrap = el("div", "field-cell");
  wrap.appendChild(labelRow(field));
  const set = answerSetFor(field, ctx.answerSets);
  const selected = new Set(Array.isArray(value) ? value : []);
  if (!set || !set.options.length) {
    wrap.appendChild(el("div", "field-empty-note", "Ingen svarmuligheder valgt"));
    return wrap;
  }
  const row = el("div", "status-row status-row-wrap");
  set.options.forEach((opt) => {
    const btn = el("button", "status-btn" + (selected.has(opt.id) ? " active" : ""), opt.label);
    btn.type = "button";
    btn.disabled = ctx.mode !== "execute";
    btn.addEventListener("click", () => {
      if (selected.has(opt.id)) selected.delete(opt.id);
      else selected.add(opt.id);
      btn.classList.toggle("active");
      onChange(Array.from(selected));
    });
    row.appendChild(btn);
  });
  wrap.appendChild(row);
  return wrap;
}

function renderDropdown(field, value, onChange, ctx) {
  const wrap = el("div", "field-cell");
  wrap.appendChild(labelRow(field));
  const set = answerSetFor(field, ctx.answerSets);
  const select = el("select");
  select.disabled = ctx.mode !== "execute";
  const blank = el("option", null, "– Vælg –");
  blank.value = "";
  select.appendChild(blank);
  (set ? set.options : []).forEach((opt) => {
    const o = el("option", null, opt.label);
    o.value = opt.id;
    if (value === opt.id) o.selected = true;
    select.appendChild(o);
  });
  select.addEventListener("change", () => onChange(select.value || null));
  wrap.appendChild(select);
  if (!set || !set.options.length) wrap.appendChild(el("div", "field-empty-note", "Ingen svarmuligheder valgt"));
  return wrap;
}

function renderPhoto(field, value, onChange, ctx) {
  const wrap = el("div", "field-cell");
  wrap.appendChild(labelRow(field));
  const photos = Array.isArray(value) ? value.slice() : [];
  const row = el("div", "photo-row");

  function redrawThumbs() {
    row.querySelectorAll(".photo-thumb").forEach((n) => n.remove());
    if (!photos.length) {
      const empty = el("div", "photo-thumb empty", "Foto");
      row.insertBefore(empty, row.firstChild);
    }
    photos.forEach((src, i) => {
      const thumb = el("div", "photo-thumb photo-thumb-fill");
      const img = el("img");
      img.src = src;
      img.alt = "foto";
      if (ctx.helpers && ctx.helpers.showLightbox) {
        img.addEventListener("click", () => ctx.helpers.showLightbox(src));
      }
      thumb.appendChild(img);
      if (ctx.mode === "execute") {
        const rm = el("button", "photo-thumb-remove", "×");
        rm.type = "button";
        rm.addEventListener("click", () => {
          photos.splice(i, 1);
          onChange(photos.slice());
          redrawThumbs();
        });
        thumb.appendChild(rm);
      }
      row.insertBefore(thumb, row.lastChild);
    });
  }

  if (ctx.mode === "execute") {
    const actions = el("div", "photo-field-actions");
    const source = field.config.source || "both";
    if (source === "camera" || source === "both") {
      actions.appendChild(makeFileButton("Tag foto", "environment", field, photos, onChange, redrawThumbs, ctx));
    }
    if (source === "gallery" || source === "both") {
      actions.appendChild(makeFileButton("Vælg foto", null, field, photos, onChange, redrawThumbs, ctx));
    }
    row.appendChild(actions);
  }

  redrawThumbs();
  wrap.appendChild(row);
  return wrap;
}

function makeFileButton(text, capture, field, photos, onChange, redraw, ctx) {
  const label = el("label", "btn secondary small file-btn", text);
  const input = el("input");
  input.type = "file";
  input.accept = "image/*";
  if (capture) input.capture = capture;
  if (field.config.multiple) input.multiple = true;
  input.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    try {
      for (const file of files) {
        const dataUrl = await ctx.helpers.fileToJpegDataUrl(file);
        if (!field.config.multiple) photos.length = 0;
        photos.push(dataUrl);
      }
      onChange(photos.slice());
      redraw();
    } catch (err) {
      console.error(err);
      alert("Kunne ikke læse fotoet. Prøv igen.");
    }
  });
  label.appendChild(input);
  return label;
}

function renderSignature(field, value, onChange, ctx) {
  const wrap = el("div", "field-cell field-signature");
  wrap.appendChild(labelRow(field));
  const pad = el("div", "signature-pad");
  const canvas = el("canvas");
  pad.appendChild(canvas);
  wrap.appendChild(pad);

  if (ctx.mode === "execute" && ctx.helpers && ctx.helpers.createSignaturePad) {
    const actions = el("div", "signature-actions");
    const clearBtn = el("button", "btn ghost small", "Ryd");
    clearBtn.type = "button";
    actions.appendChild(clearBtn);
    wrap.appendChild(actions);

    const controller = ctx.helpers.createSignaturePad(canvas, {
      onChange: (dataUrl) => onChange(dataUrl),
    });
    if (value) controller.loadDataUrl(value);
    clearBtn.addEventListener("click", () => controller.clear());
  } else if (value) {
    const img = el("img");
    img.src = value;
    img.alt = "Signatur";
    pad.appendChild(img);
    canvas.remove();
  }
  return wrap;
}

const RENDERERS = {
  heading: (f, v, oc, ctx) => renderHeading(f, ctx),
  short_text: (f, v, oc, ctx) => renderText(f, v, oc, ctx, false),
  long_text: (f, v, oc, ctx) => renderText(f, v, oc, ctx, true),
  comment: (f, v, oc, ctx) => renderText(f, v, oc, ctx, true),
  number: renderNumber,
  date: renderDate,
  yesno: renderYesNo,
  single_choice: renderSingleChoice,
  multi_choice: renderMultiChoice,
  dropdown: renderDropdown,
  photo: renderPhoto,
  reference_image: (f, v, oc, ctx) => renderReferenceImage(f, ctx),
  signature: renderSignature,
};

export function renderInput(field, value, onChange, options) {
  const ctx = Object.assign({ mode: "execute", answerSets: {}, helpers: {} }, options || {});
  const fn = RENDERERS[field.type];
  if (!fn) {
    const wrap = el("div", "field-cell");
    wrap.appendChild(el("div", "field-empty-note", "Ukendt felttype: " + esc(field.type)));
    return wrap;
  }
  const node = fn(field, value, onChange, ctx);
  node.dataset.fieldType = field.type;
  node.dataset.fieldId = field.id;
  return node;
}

export { isAnswerType };
