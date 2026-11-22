const consent = document.getElementById("consent");
const send = document.getElementById("send");
const statusEl = document.getElementById("status");
consent.addEventListener("change", () => { send.disabled = !consent.checked; });

function storageSummary(storage) {
  const keys = [];
  try {
    for (let i = 0; i < storage.length; i++) keys.push(storage.key(i));
  } catch (_) {}
  return { count: keys.length, keys: keys.filter(Boolean).slice(0, 100) };
}
function cookieNames() {
  // document.cookie exposes only non-HttpOnly cookies for this exact origin.
  return document.cookie.split(";").map(x => x.trim().split("=")[0]).filter(Boolean).slice(0, 100);
}
async function indexedDbNames() {
  try {
    if (indexedDB.databases) {
      const dbs = await indexedDB.databases();
      return dbs.map(db => db.name).filter(Boolean).slice(0, 100);
    }
  } catch (_) {}
  return [];
}
function collectClientDiagnostics() {
  const ua = navigator.userAgent || "";
  const uaData = navigator.userAgentData;
  return {
    userAgent: ua.slice(0, 500),
    browserHints: uaData ? {
      platform: uaData.platform || null,
      mobile: !!uaData.mobile,
      brands: (uaData.brands || []).map(x => ({ brand: x.brand, version: x.version }))
    } : null,
    platform: navigator.platform || null,
    language: navigator.language || null,
    languages: (navigator.languages || []).slice(0, 10),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    screen: { width: screen.width, height: screen.height, colorDepth: screen.colorDepth },
    viewport: { width: innerWidth, height: innerHeight },
    deviceMemoryGB: navigator.deviceMemory || null,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    touchPoints: navigator.maxTouchPoints || 0,
    online: navigator.onLine,
    localStorage: storageSummary(localStorage),
    sessionStorage: storageSummary(sessionStorage),
    cookieNames: cookieNames(),
    indexedDbNames: await indexedDbNames()
  };
}
send.addEventListener("click", async () => {
  if (!consent.checked) return;
  send.disabled = true;
  statusEl.textContent = "Sending your consented diagnostics…";
  try {
    const payload = await collectClientDiagnostics();
    const response = await fetch(`${window.APP_CONFIG.API_BASE}/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    statusEl.textContent = "Report submitted. Redirecting to Amazon India…";
    window.location.assign("https://www.amazon.in/");
  } catch (err) {
    statusEl.textContent = `Could not submit the report: ${err.message}. Please try again later.`;
    send.disabled = false;
  }
});