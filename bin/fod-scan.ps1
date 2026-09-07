# IWA-NodeJS - Fortify on Demand Scan Script
$ErrorActionPreference = 'Stop'

$AppName = 'iwa-nodejs'
$BuildId = "$AppName-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "Running Fortify on Demand scan for $AppName..."

# TBD

Write-Host "Scan complete"
