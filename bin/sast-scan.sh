#!/bin/bash
# IWA-NodeJS - Fortify SCA/SAST Scan Script
set -e

APP_NAME="iwa-nodejs"
BUILD_ID="${APP_NAME}-$(date +%Y%m%d%H%M%S)"

echo "Running Fortify SCA SAST scan for $APP_NAME..."

sourceanalyzer -b "$BUILD_ID" -clean
npm run clean
npm run build
sourceanalyzer -b "$BUILD_ID" -exclude ".fortify/**/*" -exclude "data/**/*" -exclude "packages/agent/dist/**/*" -exclude "packages/api/dist/**/*" -exclude "packages/web/dist/**/*" -exclude "packages/shared/dist/**/*" -exclude "Src/**/*" -exclude "packages/api/tests/**/*.*" .
sourceanalyzer -b "$BUILD_ID" -scan -f "${BUILD_ID}.fpr"

echo "Scan complete: ${BUILD_ID}.fpr"
