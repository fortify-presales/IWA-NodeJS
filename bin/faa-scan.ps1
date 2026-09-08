#!/usr/bin/env pwsh

# FAA, as a preview, can be downloaded by any of our clients. These are the coordinates:
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
#    SFTP Access :     sftp -o Port=2222 faa@ftp-pro.houston.softwaregrp.com
#                      sftp -P 2222 faa@ftp-pro.houston.softwaregrp.com
#    HTTPS Access:     https://ftp-pro.houston.softwaregrp.com/mffts
#    FTP Access  :     ftp://faa:4uu_SP6m@ftp-pro.houston.softwaregrp.com
#    Drop Box Host:    ftp-pro.houston.softwaregrp.com  (129.84.2.77, Failover: 129.84.2.77)
#    Login:            faa
#    Password:         4uu_SP6m  (NOTE: CASE-sensitive)
#    Account Expires:  12/28/2026 5:00:43 AM  (drop box expiry/deletion date)
#    Access Type:      read-only
##-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

# Remove any conflicting FCLI_DEFAULT_SSC_* environment variables so that FoD is used for Fortify Agentic Analyzer 
#Get-ChildItem Env: | Where-Object Name -like "FCLI_DEFAULT_SSC_*" | ForEach-Object { Remove-Item "Env:$($_.Name)" }

fcli fod session login

#fortifyaa -pilogin
fortifyaa -selftest

fortifyaa -scan . --scope src --fod-release "fortify-presales/IWA-NodeJS:main" --output iwa-nodejs.faa.sarif --message-format fod -clean

#fortifyaa -scan . --scope src --fod-release "fortify-presales/IWA-NodeJS:main" --baseline iwa-nodejs.faa.sarif --incremental HEAD~1 --output iwa-nodejs.faa-incremental.sarif --message-format fod

fcli fod sast-scan import-sarif --release "fortify-presales/IWA-NodeJS:faa-main" -f iwa-nodejs.faa.sarif

fcli fod session logout

