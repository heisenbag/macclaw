#!/bin/bash
# Patch @ui-tars/sdk to extend the hardcoded 30s timeout to 10 minutes.
# The SDK hard-codes `timeout: 30000` AFTER spreading options, so any config override is ignored.
# This script runs automatically after `npm install` via the `postinstall` hook.
echo "[macclaw] Patching @ui-tars/sdk timeout (30s → 600s)..."
for f in \
  "node_modules/@ui-tars/sdk/dist/Model.mjs" \
  "node_modules/@ui-tars/sdk/dist/Model.js"; do
  if [ -f "$f" ]; then
    sed -i '' 's/timeout: 30000/timeout: 600000/g' "$f"
    echo "  ✓ Patched $f"
  fi
done
echo "[macclaw] Done."
