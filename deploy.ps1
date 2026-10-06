# Shveraa Deployment Script for PowerShell
param (
    [string]$Target = "server"
)

$ServerIP = "187.53.141.150"
$ServerUser = "root"
$RemoteServerDir = "/home/mani/public_html/server"
$RemoteClientDir = "/home/mani/public_html"
$Pm2App = "shveraa-api"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "           SHVERAA ONE-CLICK DEPLOYMENT TOOL          " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

if ($Target -eq "server" -or $Target -eq "all") {
    Write-Host "`n[1/3] Compressing backend code (skipping .env, uploads, node_modules)..." -ForegroundColor Yellow
    tar -czf update_server.tar.gz -C server config controllers helper middleware models routes services webhooks server.js package.json
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to archive server files." -ForegroundColor Red
        exit 1
    }

    Write-Host "[2/3] Uploading update_server.tar.gz to $ServerIP..." -ForegroundColor Yellow
    scp update_server.tar.gz "${ServerUser}@${ServerIP}:${RemoteServerDir}/"

    Write-Host "[3/3] Extracting on server, installing dependencies and restarting $Pm2App..." -ForegroundColor Yellow
    ssh "${ServerUser}@${ServerIP}" "cd $RemoteServerDir && tar -xzf update_server.tar.gz && rm -f update_server.tar.gz && npm install --omit=dev && pm2 restart $Pm2App"
    
    Remove-Item -Path update_server.tar.gz -Force -ErrorAction SilentlyContinue
    Write-Host "Backend updated and PM2 restarted successfully!" -ForegroundColor Green
}

if ($Target -eq "client" -or $Target -eq "all") {
    Write-Host "`n[1/3] Building frontend client bundle..." -ForegroundColor Yellow
    Push-Location client
    npm run build
    Pop-Location

    Write-Host "[2/3] Compressing dist files..." -ForegroundColor Yellow
    tar -czf update_client.tar.gz -C client/dist .

    Write-Host "[3/3] Uploading and extracting on server..." -ForegroundColor Yellow
    scp update_client.tar.gz "${ServerUser}@${ServerIP}:${RemoteClientDir}/"
    ssh "${ServerUser}@${ServerIP}" "cd $RemoteClientDir && tar -xzf update_client.tar.gz && rm -f update_client.tar.gz"

    Remove-Item -Path update_client.tar.gz -Force -ErrorAction SilentlyContinue
    Write-Host "Frontend updated and deployed live successfully!" -ForegroundColor Green
}

Write-Host "`nDeployment Completed!" -ForegroundColor Cyan
