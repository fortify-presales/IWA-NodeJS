#!/usr/bin/env pwsh

# Remove any conflicting environment variables so that FoD/SSC is used for Fortify Agentic Analyzer 
Get-ChildItem Env: | Where-Object Name -like "*SSC*" | ForEach-Object { Remove-Item "Env:$($_.Name)" }
Get-ChildItem Env: | Where-Object Name -like "*FOD*" | ForEach-Object { Remove-Item "Env:$($_.Name)" }

fcli fod session login
fcli ssc session login

#fortifyaa -pilogin
fortifyaa -selftest

# For SSC
fortifyaa -scan . --scope packages --ssc-appversion "fortify-presales/IWA-NodeJS:main" --output iwa-nodejs.faa.sarif --output-format zip
fortifyaa convert iwa-nodejs.faa.zip --output-format md-full
fcli ssc artifact upload --appversion "fortify-presales/IWA-NodeJS:main-faa" --file iwa-nodejs.faa.zip

# For FOD
fortifyaa -scan . --scope packages --fod-release "fortify-presales/IWA-NodeJS:main" --output iwa-nodejs.faa.sarif --message-format fod -clean
fortifyaa convert iwa-nodejs.faa.zip --output-format md-full
fcli fod sast-scan import-sarif --release "fortify-presales/IWA-NodeJS:main-faa" -f iwa-nodejs.faa.sarif

fcli fod session logout
fcli ssc session logout

