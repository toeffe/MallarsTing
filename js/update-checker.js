const CHECK_INTERVAL_MS = 5 * 60 * 1000;

let baselineVersion = null;
let dismissedVersion = null;
let onAvailable = function () {};

async function fetchVersionInfo() {
  try {
    const res = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.version ? data : null;
  } catch (err) {
    return null;
  }
}

async function fetchVersion() {
  const info = await fetchVersionInfo();
  return info ? info.version : null;
}

async function check() {
  const latest = await fetchVersion();
  if (!latest) return;
  if (baselineVersion === null) {
    baselineVersion = latest;
    return;
  }
  if (latest !== baselineVersion && latest !== dismissedVersion) {
    onAvailable(latest);
  }
}

export function dismissUpdate(version) {
  dismissedVersion = version;
}

export function getLocalVersion() {
  return baselineVersion;
}

export async function getRemoteVersionInfo() {
  return fetchVersionInfo();
}

export function initUpdateChecker(onUpdateAvailable) {
  onAvailable = onUpdateAvailable || onAvailable;
  check();
  setInterval(check, CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
  window.addEventListener("focus", check);
}
