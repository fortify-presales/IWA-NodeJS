# IWA-NodeJS - Fortify SCA/SAST Scan Script
$ErrorActionPreference = 'Stop'

$AppName = 'iwa-nodejs'
$BuildId = "$AppName-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "Running Fortify SCA SAST scan for $AppName..."

sourceanalyzer -b "$BuildId" -clean
npm run clean
npm run build
sourceanalyzer -b $BuildId -exclude ".fortify/**/*" -exclude "data/**/*" -exclude "packages/agent/dist/**/*" -exclude "packages/api/dist/**/*" -exclude "packages/web/dist/**/*" -exclude "packages/shared/dist/**/*" -exclude "Src/**/*" -exclude "packages/api/tests/**/*.*" .
sourceanalyzer -b $BuildId -scan -f "$BuildId.fpr"

Write-Host "Scan complete: $BuildId.fpr"
