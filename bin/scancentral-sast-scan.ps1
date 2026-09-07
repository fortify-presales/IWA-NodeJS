# IWA-NodeJS - ScanCentral SAST Scan Script
$ErrorActionPreference = 'Stop'

$AppName = 'iwa-nodejs'

Write-Host "Packaging and uploading for ScanCentral SAST scan..."
scancentral package -bt none -o package.zip
scancentral start -bt none -upload -f package.zip -n "$AppName" -sensor-version 26.2

Write-Host "ScanCentral SAST scan started."
