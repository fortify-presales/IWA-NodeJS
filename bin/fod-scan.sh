#!/bin/bash
# IWA-NodeJS - Fortify on Demand Scan Script
set -e

APP_NAME="iwa-nodejs"
BUILD_ID="${APP_NAME}-$(date +%Y%m%d%H%M%S)"

echo "Running Fortify on Demand scan for $APP_NAME..."

# TBD

echo "Scan complete"
