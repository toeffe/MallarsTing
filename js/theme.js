const THEME_KEY = "inspectra_theme";

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
}

export function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(cur === "dark" ? "light" : "dark");
}

export function initTheme() {
  const saved =
    localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  applyTheme(saved);
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleTheme();
    });
  });
}
