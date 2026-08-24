#!/bin/bash
# IWA-NodeJS - Debricked SCA Scan Script
set -e

echo "Running Debricked SCA scan..."
debricked scan -t "$DEBRICKED_TOKEN" -r iwa-nodejs -c main .
echo "Debricked scan complete."
