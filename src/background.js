import { MODULES, withDefaults, newer } from "./modules.js";
import { REPO, coded, logError } from "./shared/errors.js";
import * as mapSearch from "../modules/map-search/background.js";

const VERSION = chrome.runtime.getManifest().version;
const FEED = `https://raw.githubusercontent.com/${REPO}/main/updates/latest.json`;

// Modules that need background code. Content-script-only modules (like
// Hide Playables) watch the switch themselves and don't appear here.
const BACKGROUND = { mapSearch };

// Every apply goes through one queue so two quick toggles can't interleave
// a remove and a create.
let queue = Promise.resolve();
const serial = (fn) => (queue = queue.then(fn, fn));

async function getModules() {
  try {
    const { modules } = await chrome.storage.sync.get("modules");
    return withDefaults(modules);
  } catch (e) {
    logError("PMB-202", e.message);
    return withDefaults(null);
  }
}

function applyAll() {
  return serial(async () => {
    const on = await getModules();
    for (const m of MODULES) {
      const mod = BACKGROUND[m.id];
      if (!mod) continue;
      try {
        await mod.apply(on[m.id]);
      } catch (e) {
        await logError(e.code || "PMB-999", `${m.id}: ${e.message}`);
      }
    }
  });
}

// ---------- updates ----------
// Unpacked extensions can't replace their own files, so this only tells you
// a newer version exists; the popup shows how to install it.

async function checkForUpdates(manual = false) {
  const { settings = {} } = await chrome.storage.local.get("settings").catch(() => ({}));
  const feed = String(settings.updateSource || "").trim() || FEED;
  let state;
  try {
    let res;
    try {
      res = await fetch(feed, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      throw coded("PMB-101", `${feed}: ${e.message}`);
    }
    let latest;
    try {
      latest = await res.json();
      if (!latest.version) throw new Error("no version field");
    } catch (e) {
      throw coded("PMB-102", `${feed}: ${e.message}`);
    }
    state = {
      checkedAt: Date.now(),
      current: VERSION,
      latest: latest.version,
      available: newer(latest.version, VERSION),
      notes: latest.notes || "",
      url: latest.url ? new URL(latest.url, feed).toString() : null,
    };
  } catch (e) {
    state = { checkedAt: Date.now(), current: VERSION, available: false, error: { code: e.code || "PMB-999", details: e.message } };
    if (manual) await logError(state.error.code, state.error.details);
  }
  await chrome.storage.local.set({ update: state });
  await chrome.action.setBadgeText({ text: state.available ? "↑" : "" });
  await chrome.action.setTitle({ title: state.available ? `PimpMyBrowser: update to v${state.latest} available` : "PimpMyBrowser" });
  return state;
}

// ---------- messages from the popup ----------

const handlers = {
  ping: () => ({ version: VERSION }),
  checkUpdates: () => checkForUpdates(true),
};

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  const fn = handlers[msg?.type];
  if (!fn) return false;
  Promise.resolve(fn(msg)).then(
    (result) => reply({ ok: true, result }),
    (e) => reply({ ok: false, error: { code: e.code || "PMB-999", details: e.message } })
  );
  return true;
});

// ---------- wiring ----------

mapSearch.listen();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.modules) applyAll();
});

chrome.alarms.create("updates", { periodInMinutes: 6 * 60 });
chrome.alarms.onAlarm.addListener((a) => a.name === "updates" && checkForUpdates());

chrome.runtime.onStartup.addListener(() => {
  applyAll();
  setTimeout(checkForUpdates, 5000);
});
// After an install or reload, forget the old check result straight away.
chrome.runtime.onInstalled.addListener(() => {
  applyAll();
  chrome.storage.local.remove("update");
  setTimeout(checkForUpdates, 5000);
});
