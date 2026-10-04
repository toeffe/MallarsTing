import { $, esc } from "./util.js";

function openDialog(bodyHtml, onMount) {
  const modal = $("#dialog-modal");
  const body = $("#dialog-modal-body");
  body.innerHTML = bodyHtml;
  modal.classList.remove("hidden");
  if (onMount) onMount(body);
  return () => modal.classList.add("hidden");
}

export function alertDialog(message) {
  return new Promise((resolve) => {
    const close = openDialog(
      `<p class="dialog-message">${esc(message)}</p>
       <div class="modal-actions">
         <button type="button" class="btn primary full" id="dialog-ok">OK</button>
       </div>`,
      (body) => {
        $("#dialog-ok", body).addEventListener("click", () => {
          close();
          resolve();
        });
      }
    );
  });
}

export function confirmDialog(message) {
  return new Promise((resolve) => {
    const close = openDialog(
      `<p class="dialog-message">${esc(message)}</p>
       <div class="modal-actions">
         <button type="button" class="btn ghost full" id="dialog-cancel">Annuller</button>
         <button type="button" class="btn primary full" id="dialog-ok">OK</button>
       </div>`,
      (body) => {
        $("#dialog-cancel", body).addEventListener("click", () => {
          close();
          resolve(false);
        });
        $("#dialog-ok", body).addEventListener("click", () => {
          close();
          resolve(true);
        });
      }
    );
  });
}

export function promptDialog(message, defaultValue) {
  return new Promise((resolve) => {
    const close = openDialog(
      `<p class="dialog-message">${esc(message)}</p>
       <input type="text" id="dialog-input" value="${esc(defaultValue || "")}" />
       <div class="modal-actions">
         <button type="button" class="btn ghost full" id="dialog-cancel">Annuller</button>
         <button type="button" class="btn primary full" id="dialog-ok">OK</button>
       </div>`,
      (body) => {
        const input = $("#dialog-input", body);
        input.focus();
        input.select();
        const submit = () => {
          const value = input.value;
          close();
          resolve(value);
        };
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") submit();
        });
        $("#dialog-cancel", body).addEventListener("click", () => {
          close();
          resolve(null);
        });
        $("#dialog-ok", body).addEventListener("click", submit);
      }
    );
  });
}
