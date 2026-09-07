# IWA-NodeJS - Fortify SCA/SAST Scan Script
$ErrorActionPreference = 'Stop'

$AppName = 'iwa-nodejs'
$BuildId = "$AppName-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "Running Fortify SCA SAST scan for $AppName..."

sourceanalyzer -b "$BuildId" -clean
sourceanalyzer -b $BuildId -exclude ".fortify/**/*" -exclude "data/**/*" -exclude "dist/**/*" -exclude "packages/api/tests/**/*.*"
sourceanalyzer -b $BuildId -scan -f "$BuildId.fpr"

Write-Host "Scan complete: $BuildId.fpr"
