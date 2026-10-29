# PimpMyBrowser error codes

Every problem PimpMyBrowser can show you has a code like `PMB-301`. Find yours below.

**Getting help from an AI assistant:** click **Copy Error Details** on the error, then paste it into ChatGPT, Claude or similar along with a link to this page. For a plain-text copy that's easy for AI assistants to read, use https://raw.githubusercontent.com/jonpikereally/PimpMyBrowser/main/ERRORS.md

Codes are grouped: `1xx` extension updates, `2xx` saved switches and settings, `3xx` Map Search, `4xx` Hide YouTube Playables, `999` anything else. Codes are never reused or renumbered.

| Code | What happened | What to try |
|---|---|---|
| `PMB-101` | PimpMyBrowser couldn't reach the update feed. | Check your internet connection. If you set a custom Update source in Settings, make sure the URL is right, or clear it. |
| `PMB-102` | The update feed answered, but not with a valid `latest.json`. | Clear the Update source in Settings to go back to the built-in GitHub feed. If you're already on it, open an issue. |
| `PMB-103` | PimpMyBrowser's files were updated, but the part running in the background is still the old version, so it didn't answer the popup. | Open `chrome://extensions` (`brave://extensions` in Brave) and click ↻ on PimpMyBrowser. Then reopen the popup. |
| `PMB-201` | Flipping a switch (or saving Settings) failed, so it was put back the way it was. | Try again. If it repeats, restart the browser, then copy the details and open an issue. |
| `PMB-202` | PimpMyBrowser couldn't read your saved switches, so every tool is using its default (on). | Restart the browser. If it persists, copy the details and open an issue. |
| `PMB-301` | The **Search Google Maps** right-click item couldn't be added or removed, so the menu may not match the switch. | Turn Map Search off and on again. If it persists, click ↻ on PimpMyBrowser in the extensions page. |
| `PMB-302` | Choosing **Search Google Maps** couldn't open a new tab. | Try again. If it repeats, copy the details and open an issue. |
| `PMB-401` | On a YouTube page, Hide Playables couldn't read its switch, so it stayed on for that page. | Reload the YouTube tab. If it persists, click ↻ on PimpMyBrowser in the extensions page. |
| `PMB-999` | Something unexpected went wrong. | Copy the details and paste them into an AI assistant along with a link to this page. |
