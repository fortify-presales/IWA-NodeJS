#!/usr/bin/env bash

# IWA-NodeJS - Fortify Agentic Analyzer scans and SSC/FoD result import
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-both}"

case "$TARGET" in
  both|ssc|fod) ;;
  *)
    echo "Usage: $0 [both|ssc|fod]" >&2
    exit 2
    ;;
esac

# Remove conflicting Fortify environment settings before creating platform sessions.
while IFS='=' read -r variable _; do
  case "${variable^^}" in
    *SSC*|*FOD*) unset "$variable" ;;
  esac
done < <(env)

SSC_APPVERSION="fortify-presales/IWA-NodeJS:main"
SSC_IMPORT_APPVERSION="fortify-presales/IWA-NodeJS:main-faa"
FOD_RELEASE="fortify-presales/IWA-NodeJS:main"
FOD_IMPORT_RELEASE="fortify-presales/IWA-NodeJS:main-faa"
SSC_OUTPUT="iwa-nodejs.faa-ssc.sarif"
SSC_ZIP="iwa-nodejs.faa-ssc.zip"
FOD_SARIF="iwa-nodejs.faa-fod.sarif"

cleanup() {
  local exit_code=$?
  trap - EXIT
  if [[ "$TARGET" == both || "$TARGET" == ssc ]]; then
    fcli ssc session logout || true
  fi
  if [[ "$TARGET" == both || "$TARGET" == fod ]]; then
    fcli fod session logout || true
  fi
  exit "$exit_code"
}
trap cleanup EXIT

cd "$REPO_ROOT"

if [[ "$TARGET" == both || "$TARGET" == ssc ]]; then
  echo "Logging in to Fortify SSC..."
  fcli ssc session login
fi
if [[ "$TARGET" == both || "$TARGET" == fod ]]; then
  echo "Logging in to Fortify on Demand..."
  fcli fod session login
fi

echo "Running Fortify Agentic Analyzer self-test..."
fortifyaa -selftest

if [[ "$TARGET" == both || "$TARGET" == ssc ]]; then
  echo "Scanning for SSC app version $SSC_APPVERSION..."
  fortifyaa -scan . \
    --scope packages \
    --ssc-appversion "$SSC_APPVERSION" \
    --output "$SSC_OUTPUT" \
    --output-format zip \
    --output-zip "$SSC_ZIP" \
    -clean
  fortifyaa -convert "$SSC_ZIP" --output-format md-full
  fcli ssc artifact upload \
    --appversion "$SSC_IMPORT_APPVERSION" \
    --file "$SSC_ZIP"
fi

if [[ "$TARGET" == both || "$TARGET" == fod ]]; then
  echo "Scanning for FoD release $FOD_RELEASE..."
  fortifyaa -scan . \
    --scope packages \
    --fod-release "$FOD_RELEASE" \
    --output "$FOD_SARIF" \
    --message-format fod \
    -clean
  fortifyaa -convert "$FOD_SARIF" --output-format md-full --message-format fod
  fcli fod sast-scan import-sarif \
    --release "$FOD_IMPORT_RELEASE" \
    -f "$FOD_SARIF"
fi

echo "Fortify Agentic Analyzer scan and result import complete for: $TARGET."
