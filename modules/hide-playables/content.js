// Hide Playables: hide.css only matches while <html> has this class, so the
// switch takes effect in open YouTube tabs without a reload. The class goes
// on straight away (the module is on by default) so nothing flashes, and
// comes off if the saved switch says off.
(() => {
  const CLASS = "pmb-hide-playables";
  const root = document.documentElement;
  const set = (on) => root.classList.toggle(CLASS, on !== false);

  set(true);
  chrome.storage.sync.get("modules").then(
    ({ modules }) => set(modules?.hidePlayables),
    (e) => {
      set(true);
      chrome.storage.local.get("errors").then(({ errors = [] }) => {
        errors.push({ code: "PMB-401", details: e.message, t: Date.now() });
        return chrome.storage.local.set({ errors: errors.slice(-30) });
      }).catch(() => {});
    }
  );
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.modules) set(changes.modules.newValue?.hidePlayables);
  });
})();
