#!/usr/bin/env pwsh

# Remove any conflicting FCLI_DEFAULT_SSC_* environment variables so that FoD is used for Fortify Agentic Analyzer 
Get-ChildItem Env: | Where-Object Name -like "FCLI_DEFAULT_SSC_*" | ForEach-Object { Remove-Item "Env:$($_.Name)" }

fcli fod session login

#fortifyaa -pilogin
fortifyaa -selftest

fortifyaa -scan . --scope packages --fod-release "fortify-presales/IWA-NodeJS:main" --output iwa-nodejs.faa.sarif --message-format fod -clean

#fortifyaa -scan . --scope packages --fod-release "fortify-presales/IWA-NodeJS:main" --baseline iwa-nodejs.faa.sarif --incremental HEAD~1 --output iwa-nodejs.faa-incremental.sarif --message-format fod

fcli fod sast-scan import-sarif --release "fortify-presales/IWA-NodeJS:faa-main" -f iwa-nodejs.faa.sarif

fcli fod session logout

