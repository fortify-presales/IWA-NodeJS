#!/bin/bash
# IWA-NodeJS - ScanCentral SAST Scan Script
set -e

APP_NAME="iwa-nodejs"

echo "Packaging and uploading for ScanCentral SAST scan..."
scancentral package -bt none -o package.zip
scancentral start -bt none -upload -f package.zip -n "$APP_NAME" -sensor-version 23.1

echo "ScanCentral SAST scan started."
