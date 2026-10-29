#!/usr/bin/env bash
# Builds updates/PimpMyBrowser.zip and writes updates/latest.json (last, so
# the feed never points at a half-written zip). Run by the release workflow.
set -euo pipefail
cd "$(dirname "$0")/.."
./scripts/check-errors.sh
version=$(python3 -c 'import json;print(json.load(open("manifest.json"))["version"])')
notes=$(cat RELEASE_NOTES.txt 2>/dev/null || true)
stage=$(mktemp -d)
mkdir "$stage/PimpMyBrowser"
cp -R manifest.json src app modules icons LICENSE README.md ERRORS.md "$stage/PimpMyBrowser/"
mkdir -p updates
rm -f updates/PimpMyBrowser.zip
(cd "$stage" && zip -qr -X - PimpMyBrowser) > updates/PimpMyBrowser.zip
python3 - "$version" "$notes" > updates/latest.json <<'PY'
import json, sys
print(json.dumps({"version": sys.argv[1], "url": "PimpMyBrowser.zip", "notes": sys.argv[2].strip()}, indent=2))
PY
echo "Built PimpMyBrowser v$version"
