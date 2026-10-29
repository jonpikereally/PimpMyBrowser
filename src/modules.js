// Every tool in PimpMyBrowser is a module listed here. The popup draws one
// switch per entry; the on/off state lives in chrome.storage.sync under
// "modules" so it follows you to other computers signed into the browser.
//
// To add a module: put its files in modules/<folder>/, add an entry below,
// and if it has background code, register it in src/background.js.

export const MODULES = [
  {
    id: "hidePlayables",
    name: "Hide YouTube Playables",
    description: "Hides the Playables games shelf, game cards and the Playables sidebar link on YouTube.",
    defaultOn: true,
  },
  {
    id: "mapSearch",
    name: "Map Search",
    description: "Highlight an address, right-click, and choose “Search Google Maps” to open it in a new tab.",
    defaultOn: true,
  },
];

export function withDefaults(saved) {
  const out = {};
  for (const m of MODULES) out[m.id] = typeof saved?.[m.id] === "boolean" ? saved[m.id] : m.defaultOn;
  return out;
}

// Dotted version compare, numeric per part: newer("1.10.0", "1.9.9") is true.
export function newer(a, b) {
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x > y;
  }
  return false;
}
