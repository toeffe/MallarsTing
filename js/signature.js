export function createSignaturePad(canvas, opts) {
  const onChange = (opts && opts.onChange) || function () {};
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let hasInk = false;
  let last = null;
  let pendingLoad = null;

  function applyStrokeStyle() {
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Always ink in a fixed dark color, regardless of theme: the signature
    // is exported onto a white PDF page, so a theme-derived (light) color
    // would render washed out there.
    ctx.strokeStyle = "#1a1a1a";
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const prev = hasInk ? canvas.toDataURL("image/png") : pendingLoad;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    applyStrokeStyle();
    if (prev) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = prev;
      if (prev === pendingLoad) {
        hasInk = true;
        pendingLoad = null;
      }
    }
  }

  function pointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e) {
    drawing = true;
    last = pointFromEvent(e);
    canvas.setPointerCapture(e.pointerId);
  }

  function move(e) {
    if (!drawing) return;
    const p = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    hasInk = true;
    onChange(getDataUrl());
  }

  function end(e) {
    if (!drawing) return;
    drawing = false;
    last = null;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
  }

  function getDataUrl() {
    return hasInk ? canvas.toDataURL("image/png") : null;
  }

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk = false;
    pendingLoad = null;
    onChange(null);
  }

  function isEmpty() {
    return !hasInk;
  }

  function loadDataUrl(dataUrl) {
    if (!dataUrl) return;
    pendingLoad = dataUrl;
    resize();
  }

  canvas.addEventListener("pointerdown", start);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  // The canvas is often still detached from the document at construction
  // time (the caller appends the returned node afterwards), so
  // getBoundingClientRect() would read 0x0 here. ResizeObserver's first
  // callback fires once the element actually has layout, whenever that
  // happens to be.
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
  } else {
    window.addEventListener("resize", resize);
    setTimeout(resize, 0);
  }

  return { getDataUrl, clear, isEmpty, loadDataUrl, resize };
}
