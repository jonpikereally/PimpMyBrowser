import { MODULES, withDefaults, newer } from "../src/modules.js";
import { REPO, ERROR_HOVER, ERROR_LIST_URL, describe, detailsText } from "../src/shared/errors.js";

const VERSION = chrome.runtime.getManifest().version;
const $ = (sel, el = document) => el.querySelector(sel);

let shownErrors = []; // errors raised in this popup, plus unseen ones from the background

// ---------- errors ----------

function addError(err) {
  shownErrors.push({ t: Date.now(), ...err });
  renderErrors();
}

function renderErrors() {
  const box = $("#errors");
  box.textContent = "";
  for (const err of shownErrors.slice(-3)) {
    const d = describe(err.code);
    const el = document.createElement("div");
    el.className = "error";
    el.title = ERROR_HOVER;
    el.innerHTML = `<div><span class="code"></span> <span class="summary"></span><a class="help" target="_blank" rel="noopener">?</a></div>
      <div class="hint"></div>
      <div class="actions"><button class="copy">Copy Error Details</button><button class="dismiss">Dismiss</button></div>`;
    $(".code", el).textContent = `Error ${d.code}:`;
    $(".summary", el).textContent = d.summary;
    $(".hint", el).textContent = d.hint;
    $(".help", el).href = ERROR_LIST_URL;
    $(".help", el).title = ERROR_HOVER;
    $(".copy", el).onclick = async (e) => {
      await navigator.clipboard.writeText(detailsText(err, VERSION));
      e.target.textContent = "Copied";
    };
    $(".dismiss", el).onclick = () => {
      shownErrors = shownErrors.filter((x) => x !== err);
      renderErrors();
    };
    box.append(el);
  }
}

async function loadBackgroundErrors() {
  try {
    const { errors = [], errorsSeenAt = 0 } = await chrome.storage.local.get(["errors", "errorsSeenAt"]);
    shownErrors.push(...errors.filter((e) => e.t > errorsSeenAt));
    await chrome.storage.local.set({ errorsSeenAt: Date.now() });
  } catch (e) {
    shownErrors.push({ code: "PMB-202", details: e.message });
  }
  renderErrors();
}

// The background answers every known message; no answer means it's an older
// copy that hasn't been reloaded since the files changed.
async function send(type) {
  let res;
  try {
    res = await chrome.runtime.sendMessage({ type });
  } catch (e) {
    throw Object.assign(new Error(e.message), { code: "PMB-103" });
  }
  if (!res) throw Object.assign(new Error(`no answer to "${type}"`), { code: "PMB-103" });
  if (!res.ok) throw Object.assign(new Error(res.error.details), { code: res.error.code });
  return res.result;
}

// ---------- module switches ----------

async function renderModules() {
  let saved = null;
  try {
    ({ modules: saved } = await chrome.storage.sync.get("modules"));
  } catch (e) {
    addError({ code: "PMB-202", details: e.message });
  }
  const on = withDefaults(saved);
  const main = $("#modules");
  main.textContent = "";
  for (const m of MODULES) {
    const row = $("#module-row").content.firstElementChild.cloneNode(true);
    $(".name", row).textContent = m.name;
    $(".desc", row).textContent = m.description;
    const box = $("input", row);
    box.checked = on[m.id];
    box.setAttribute("aria-label", m.name);
    box.onchange = async () => {
      try {
        const { modules } = await chrome.storage.sync.get("modules");
        await chrome.storage.sync.set({ modules: { ...withDefaults(modules), [m.id]: box.checked } });
      } catch (e) {
        box.checked = !box.checked;
        addError({ code: "PMB-201", details: `${m.id}: ${e.message}` });
      }
    };
    main.append(row);
  }
}

// ---------- updates ----------

function renderUpdate(u) {
  const banner = $("#update-banner");
  // The saved check may predate an update you've already installed.
  if (!u?.available || !newer(u.latest, VERSION)) {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
  banner.innerHTML = `<strong></strong><p class="notes"></p>
    <p>Download the <a class="zip" target="_blank" rel="noopener">new zip</a> (or <code>git pull</code>), replace this folder, then click ↻ on PimpMyBrowser in the extensions page.</p>`;
  $("strong", banner).textContent = `Update available: v${u.latest} (you have v${VERSION})`;
  $(".notes", banner).textContent = u.notes || "";
  $(".zip", banner).href = u.url || `https://github.com/${REPO}`;
}

async function checkUpdates() {
  const btn = $("#check-updates");
  const out = $("#update-result");
  btn.disabled = true;
  btn.textContent = "Checking for Updates…";
  out.textContent = "";
  try {
    const u = await send("checkUpdates");
    renderUpdate(u);
    if (u.error) addError(u.error);
    else if (!u.available) out.textContent = `PimpMyBrowser is up to date (v${VERSION}).`;
  } catch (e) {
    addError({ code: e.code || "PMB-999", details: e.message });
  } finally {
    btn.disabled = false;
    btn.textContent = "Check for Updates…";
  }
}

// ---------- settings ----------

async function loadSettings() {
  try {
    const { settings = {} } = await chrome.storage.local.get("settings");
    $("#update-source").value = settings.updateSource || "";
  } catch (e) {
    addError({ code: "PMB-202", details: e.message });
  }
}

$("#open-settings").onclick = (e) => {
  const s = $("#settings");
  s.hidden = !s.hidden;
  e.currentTarget.classList.toggle("active", !s.hidden);
};
$("#save-settings").onclick = async (e) => {
  try {
    await chrome.storage.local.set({ settings: { updateSource: $("#update-source").value.trim() } });
    e.target.textContent = "Saved";
    setTimeout(() => (e.target.textContent = "Save"), 1200);
  } catch (err) {
    addError({ code: "PMB-201", details: `settings: ${err.message}` });
  }
};
$("#check-updates").onclick = checkUpdates;

$("#version").textContent = `v${VERSION}`;
$("#github").href = `https://github.com/${REPO}`;

renderModules();
loadSettings();
loadBackgroundErrors();
chrome.storage.local.get("update").then(({ update }) => renderUpdate(update), () => {});
