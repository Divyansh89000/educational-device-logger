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
  const ua = navigator.userAgent || "";
  const uaData = navigator.userAgentData;
  const connection = navigator.connection || null;

  // Safely collect storage keys, never their values
  function getStorageInfo(storage) {
    try {
      const keys = [];

      for (let i = 0; i < storage.length && i < 100; i++) {
        keys.push(storage.key(i));
      }

      return {
        available: true,
        count: storage.length,
        keys
      };
    } catch {
      return {
        available: false,
        count: null,
        keys: []
      };
    }
  }

  // Collect accessible cookie names only
  function getCookieNames() {
    try {
      return document.cookie
        .split(";")
        .map(cookie => cookie.trim().split("=")[0])
        .filter(Boolean)
        .slice(0, 100);
    } catch {
      return [];
    }
  }

  // Collect IndexedDB database names only
  async function getIndexedDBNames() {
    try {
      if (!indexedDB.databases) {
        return {
          available: false,
          names: []
        };
      }

      const databases = await indexedDB.databases();

      return {
        available: true,
        names: databases
          .map(db => db.name)
          .filter(Boolean)
          .slice(0, 100)
      };
    } catch {
      return {
        available: false,
        names: []
      };
    }
  }

  // Read browser preferences safely
  function getMedia(query) {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return null;
    }
  }

  return {
    // Browser information
    userAgent: ua.slice(0, 500),

    browserHints: uaData ? {
      platform: uaData.platform || null,
      mobile: !!uaData.mobile,
      brands: (uaData.brands || []).map(item => ({
        brand: item.brand,
        version: item.version
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

    // Network information, if supported
    connection: connection ? {
      effectiveType: connection.effectiveType || null,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      saveData: connection.saveData || false
    } : null,

    online: navigator.onLine,

    // Cookie names only, never values
    cookieNames: getCookieNames(),

    // Local Storage keys only
    localStorage: getStorageInfo(window.localStorage),

    // Session Storage keys only
    sessionStorage: getStorageInfo(window.sessionStorage),

    // IndexedDB database names only
    indexedDbNames: await getIndexedDBNames()
  };
}

  }
});
