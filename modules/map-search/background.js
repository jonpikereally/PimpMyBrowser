// Map Search: right-click selected text → Google Maps in a new tab.
import { coded, logError } from "../../src/shared/errors.js";

const MENU_ID = "pmb-map-search";

export function mapsUrl(selection) {
  // Addresses copied off pages often span lines; collapse to one line.
  const query = String(selection || "").replace(/\s+/g, " ").trim();
  return query ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query) : null;
}

// Context menus survive service-worker restarts, so always remove first and
// re-add only when on. That way the menu matches the switch either way.
export async function apply(on) {
  try {
    await chrome.contextMenus.remove(MENU_ID).catch(() => {});
    if (on) {
      await new Promise((resolve, reject) =>
        chrome.contextMenus.create({ id: MENU_ID, title: "Search Google Maps for \"%s\"", contexts: ["selection"] }, () =>
          chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError.message)) : resolve()
        )
      );
    }
  } catch (e) {
    throw coded("PMB-301", e.message);
  }
}

export function listen() {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== MENU_ID) return;
    const url = mapsUrl(info.selectionText);
    if (!url) return;
    try {
      await chrome.tabs.create({ url, index: tab ? tab.index + 1 : undefined, openerTabId: tab ? tab.id : undefined });
    } catch (e) {
      logError("PMB-302", e.message);
    }
  });
}
