# IWA-NodeJS - Debricked SCA Scan Script
$ErrorActionPreference = 'Stop'

if (-not $env:DEBRICKED_TOKEN) {
    Write-Error "DEBRICKED_TOKEN environment variable is not set."
    exit 1
}

Write-Host "Running Debricked SCA scan..."
debricked scan -t "$env:DEBRICKED_TOKEN" -r iwa-nodejs -c main .
Write-Host "Debricked scan complete."
