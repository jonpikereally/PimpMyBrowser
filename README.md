# PimpMyBrowser

An all-purpose Chrome/Brave extension: a toolbox of small browser tweaks, each with its own on/off switch in the toolbar popup.

## Tools

| Tool | What it does |
|---|---|
| **Hide YouTube Playables** | Hides YouTube's Playables games everywhere: the home-feed shelf, game cards in feeds and search, and the Playables sidebar link. Switching it off brings them back in open tabs straight away. |
| **Map Search** | Highlight an address on any page, right-click, and choose **Search Google Maps for "…"**. Google Maps opens in a new tab next to the current one. Multi-line selections are collapsed to one line. Switching it off removes the menu item. |

Both are on after install. Click the PimpMyBrowser icon in the toolbar to turn any of them off. Your switches sync to other computers signed into the same browser profile.

## Install

1. Download this repo (**Code → Download ZIP**, then unzip) or `git clone` it.
2. Open `chrome://extensions` (`brave://extensions` in Brave).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and choose the `PimpMyBrowser` folder.

## Updates

PimpMyBrowser checks this repo every 6 hours. When a newer version exists, the toolbar icon shows **↑** and the popup links the new zip. Replace the folder (or `git pull`), then click ↻ on PimpMyBrowser in the extensions page.

## Permissions

- `storage`: remembers your switches.
- `contextMenus`: the Map Search right-click item. The extension only receives the text you right-click.
- `alarms`: the 6-hourly update check.
- YouTube pages only: the Hide Playables stylesheet. No other site is touched.

No data is collected or sent anywhere.

## Errors

Every error shows a code like `PMB-301`. See [ERRORS.md](ERRORS.md).

## Adding a tool

See [AGENTS.md](AGENTS.md).

## License

MIT
