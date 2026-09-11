#!/usr/bin/env bash

# IWA-NodeJS - Fortify Agentic Analyzer scan and FoD SARIF import
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SARIF_FILE="${FAA_OUTPUT_FILE:-iwa-nodejs.faa.sarif}"
FOD_RELEASE="${FAA_FOD_RELEASE:-fortify-presales/IWA-NodeJS:main}"
FOD_IMPORT_RELEASE="${FAA_FOD_IMPORT_RELEASE:-fortify-presales/IWA-NodeJS:main-faa}"

# Use the default fcli session unless the commands are configured otherwise.
# Remove SSC defaults so the Agentic Analyzer and import target FoD.
for variable in ${!FCLI_DEFAULT_SSC_@}; do
  unset "$variable"
done

cleanup() {
  fcli fod session logout || true
}
trap cleanup EXIT

cd "$REPO_ROOT"

echo "Logging in to Fortify on Demand using the default fcli session..."
fcli fod session login

fortifyaa -selftest
fortifyaa -scan . \
  --scope packages \
  --fod-release "$FOD_RELEASE" \
  --output "$SARIF_FILE" \
  --message-format fod \
  -clean

# Optional incremental scan example:
# fortifyaa -scan . --scope packages \
#   --fod-release "$FOD_RELEASE" \
#   --baseline "$SARIF_FILE" \
#   --incremental HEAD~1 \
#   --output iwa-nodejs.faa-incremental.sarif \
#   --message-format fod \
#   -clean

fcli fod sast-scan import-sarif \
  --release "$FOD_IMPORT_RELEASE" \
  -f "$SARIF_FILE"

echo "Fortify Agentic Analyzer scan and SARIF import complete."
