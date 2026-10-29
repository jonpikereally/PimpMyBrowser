// node tests/core.test.mjs
import assert from "node:assert/strict";
import { MODULES, withDefaults, newer } from "../src/modules.js";
import { mapsUrl } from "../modules/map-search/background.js";

assert.equal(newer("1.10.0", "1.9.9"), true);
assert.equal(newer("1.0.0", "1.0.0"), false);
assert.equal(newer("1.0", "1.0.1"), false);
assert.equal(newer("2.0.0", "1.99"), true);

assert.deepEqual(withDefaults(null), { hidePlayables: true, mapSearch: true });
assert.deepEqual(withDefaults({ mapSearch: false, gone: true }), { hidePlayables: true, mapSearch: false });
assert.equal(new Set(MODULES.map((m) => m.id)).size, MODULES.length, "module ids must be unique");

assert.equal(mapsUrl("  123 Main St\n  Springfield, IL  "), "https://www.google.com/maps/search/?api=1&query=123%20Main%20St%20Springfield%2C%20IL");
assert.equal(mapsUrl("   \n "), null);
assert.equal(mapsUrl(undefined), null);

console.log("All tests passed.");
