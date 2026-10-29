// Every error a user can see has a stable code. Never reuse or renumber.
// The public list lives in ERRORS.md; scripts/check-errors.sh fails the
// build if a code used in the code is missing from it.
//   1xx updates   2xx settings   3xx Map Search   4xx Hide Playables
//   999 unexpected

export const REPO = "jonpikereally/PimpMyBrowser";
export const ERROR_LIST_URL = `https://github.com/${REPO}/blob/main/ERRORS.md`;
export const ERROR_LIST_RAW = `https://raw.githubusercontent.com/${REPO}/main/ERRORS.md`;
export const ERROR_HOVER = `Look this code up on the PimpMyBrowser error list: ${ERROR_LIST_URL}`;

export const ERRORS = {
  "PMB-101": ["Couldn't reach the update feed.", "Check your internet connection, or the Update source in Settings."],
  "PMB-102": ["The update feed returned something unreadable.", "Clear the Update source in Settings to go back to the built-in feed."],
  "PMB-103": ["PimpMyBrowser was updated but hasn't been reloaded.", "Click ↻ on PimpMyBrowser in chrome://extensions (brave://extensions in Brave), then reopen this."],
  "PMB-201": ["Couldn't save that switch.", "Try again. If it repeats, restart the browser and copy the details."],
  "PMB-202": ["Couldn't read your saved switches, so the defaults are being used.", "Restart the browser. If it persists, copy the details."],
  "PMB-301": ["Couldn't add or remove the Map Search right-click item.", "Turn Map Search off and on again. If it persists, reload the extension."],
  "PMB-302": ["Couldn't open Google Maps in a new tab.", "Try again. If it repeats, copy the details."],
  "PMB-401": ["Hide Playables couldn't read its switch on a YouTube page, so it stayed on.", "Reload the YouTube tab. If it persists, reload the extension."],
  "PMB-999": ["Something unexpected went wrong.", "Copy the details and paste them into an AI assistant along with the error list link."],
};

export function describe(code) {
  const [summary, hint] = ERRORS[code] || ERRORS["PMB-999"];
  return { code: ERRORS[code] ? code : "PMB-999", summary, hint };
}

export function coded(code, message) {
  return Object.assign(new Error(message || describe(code).summary), { code });
}

export function detailsText(err, version) {
  const d = describe(err.code);
  return [
    `PimpMyBrowser error ${d.code}: ${d.summary}`,
    `What to try: ${d.hint}`,
    err.details ? `Details: ${err.details}` : null,
    `When: ${new Date(err.t || Date.now()).toISOString()}`,
    `PimpMyBrowser version: ${version}`,
    `Browser: ${navigator.userAgent}`,
    `Error list: ${ERROR_LIST_URL}`,
    `Error list (plain text for AI assistants): ${ERROR_LIST_RAW}`,
  ].filter(Boolean).join("\n");
}

// Background errors land here so the popup can show them. Only codes and
// technical details are logged, never page contents or selected text.
export async function logError(code, details) {
  try {
    const { errors = [] } = await chrome.storage.local.get("errors");
    errors.push({ code, details: String(details || "").slice(0, 2000), t: Date.now() });
    await chrome.storage.local.set({ errors: errors.slice(-30) });
    console.warn(`[PimpMyBrowser] ${code}`, details);
  } catch (e) {
    console.error("[PimpMyBrowser] couldn't log error", code, details, e);
  }
}
