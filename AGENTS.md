# PimpMyBrowser: notes for maintainers (human or AI)

MV3 extension, no build step. Load the folder unpacked to run it.

## Layout

- `manifest.json`: permissions and the content scripts of every module.
- `src/modules.js`: **the module registry**. One entry per tool (`id`, `name`, `description`, `defaultOn`). The popup draws a switch for each entry. On/off state is `chrome.storage.sync` → `modules` (`{ [id]: boolean }`); missing ids fall back to `defaultOn`.
- `src/background.js`: service worker. Calls `apply(on)` on every module listed in its `BACKGROUND` map whenever the switches change, on install and on startup. Also runs the notify-only update check.
- `src/shared/errors.js`: error catalogue (`PMB-` codes). Every code must also be in `ERRORS.md`; `scripts/check-errors.sh` enforces it.
- `app/`: the toolbar popup.
- `modules/<name>/`: one folder per tool.

## Adding a module

1. Make `modules/<name>/` with its files.
2. Add an entry to `MODULES` in `src/modules.js`.
3. Content-script module: add it to `content_scripts` in the manifest, and have the script read `chrome.storage.sync.get("modules")` and watch `chrome.storage.onChanged` for its id so the switch works live (see `modules/hide-playables/content.js`: CSS scoped to a class on `<html>` that the script toggles).
4. Background module: export `apply(on)` (idempotent: called often) and register it in `BACKGROUND` in `src/background.js`. Register event listeners at the top level of the worker, not inside `apply`.
5. Add any new permission to the manifest and the README's Permissions list.
6. New error codes: next free number in a new hundred-block for the module, in both `errors.js` and `ERRORS.md`.

## Releasing

Bump `version` in `manifest.json`, write `RELEASE_NOTES.txt`, push to main. `.github/workflows/release.yml` builds `updates/PimpMyBrowser.zip` and `updates/latest.json`, which installed copies poll.

## Tests

`node tests/core.test.mjs` (version compare, defaults, Maps URL). `tests/popup-harness.html` renders the popup with a fake `chrome` API when served over HTTP.
