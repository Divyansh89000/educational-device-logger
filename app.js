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
async function collectClientDiagnostics() {
 
async function collectClientDiagnostics() {
  const ua = navigator.userAgent || "";
  const uaData = navigator.userAgentData;
  const connection = navigator.connection || null;

  const getMedia = (query) => {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return null;
    }
  };

  return {
    // Browser information
    userAgent: ua.slice(0, 500),
    browserHints: uaData ? {
      platform: uaData.platform || null,
      mobile: !!uaData.mobile,
      brands: (uaData.brands || []).map(x => ({
        brand: x.brand,
        version: x.version
      }))
    } : null,

    // Operating system and language
    platform: navigator.platform || null,
    language: navigator.language || null,
    languages: (navigator.languages || []).slice(0, 10),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,

    // Screen configuration
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    },

    viewport: {
      width: innerWidth,
      height: innerHeight
    },

    devicePixelRatio: window.devicePixelRatio || null,
    screenAvailableWidth: screen.availWidth || null,
    screenAvailableHeight: screen.availHeight || null,
    screenOrientation: screen.orientation?.type || null,

    // Hardware estimates
    deviceMemoryGB: navigator.deviceMemory || null,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    touchPoints: navigator.maxTouchPoints || 0,

    // Browser preferences
    colorScheme: getMedia("(prefers-color-scheme: dark)")
      ? "dark" : "light",

    reducedMotion: getMedia("(prefers-reduced-motion: reduce)"),
    reducedTransparency: getMedia("(prefers-reduced-transparency: reduce)"),

    // Network information (if supported)
    connection: connection ? {
      effectiveType: connection.effectiveType || null,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      saveData: connection.saveData || false
    } : null,

    // Device status
    online: navigator.onLine
  };
}

  }
});
