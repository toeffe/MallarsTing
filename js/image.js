/** Compress images to JPEG (blob or data URL). */

async function drawToCanvas(file, maxEdge) {
  try {
    if (typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
      const w = Math.max(1, Math.round(bmp.width * scale));
      const h = Math.max(1, Math.round(bmp.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
      if (bmp.close) bmp.close();
      return canvas;
    }
  } catch (err) {
    /* fall through */
  }

  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error("Kunne ikke læse billedet"));
    };
    img.src = url;
  });
}

export async function fileToJpegBlob(file, maxEdge = 1600, quality = 0.82) {
  const canvas = await drawToCanvas(file, maxEdge);
  return new Promise(function (resolve, reject) {
    canvas.toBlob(
      function (blob) {
        if (blob) resolve(blob);
        else reject(new Error("Kunne ikke komprimere billedet"));
      },
      "image/jpeg",
      quality
    );
  });
}

export async function fileToJpegDataUrl(file, maxEdge = 1600, quality = 0.82) {
  const blob = await fileToJpegBlob(file, maxEdge, quality);
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function showLightbox(src) {
  let box = document.getElementById("guide-lightbox");
  if (!box) {
    box = document.createElement("div");
    box.id = "guide-lightbox";
    box.className = "guide-lightbox hidden";
    box.addEventListener("click", () => box.classList.add("hidden"));
    document.body.appendChild(box);
  }
  box.innerHTML = "";
  const img = document.createElement("img");
  img.alt = "Billede";
  img.src = src;
  box.appendChild(img);
  box.classList.remove("hidden");
}
