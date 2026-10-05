@echo off
setlocal enabledelayedexpansion

set SERVER_IP=187.53.141.150
set SERVER_USER=root
set REMOTE_SERVER_DIR=/home/mani/public_html/server
set REMOTE_CLIENT_DIR=/home/mani/public_html
set PM2_APP=shveraa-api

set ACTION=%1

if "%ACTION%"=="" (
    echo ======================================================
    echo           SHVERAA ONE-CLICK DEPLOYMENT TOOL
    echo ======================================================
    echo  [1] Deploy Backend (Server code - Fast)
    echo  [2] Deploy Frontend (Build Client and Upload)
    echo  [3] Deploy Both (Full Update)
    echo  [4] Exit
    echo ======================================================
    set /p CHOICE="Choose an option (1-4, Default: 1): "
    if "!CHOICE!"=="" set CHOICE=1
    if "!CHOICE!"=="1" goto DEPLOY_SERVER
    if "!CHOICE!"=="2" goto DEPLOY_CLIENT
    if "!CHOICE!"=="3" goto DEPLOY_ALL
    if "!CHOICE!"=="4" goto END
    goto DEPLOY_SERVER
)

if /i "%ACTION%"=="server" goto DEPLOY_SERVER
if /i "%ACTION%"=="client" goto DEPLOY_CLIENT
if /i "%ACTION%"=="all" goto DEPLOY_ALL

:DEPLOY_SERVER
echo.
echo [1/3] Compressing backend code (skipping .env, uploads, node_modules)...
tar -czf update_server.tar.gz -C server config controllers helper middleware models routes services webhooks server.js package.json
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to archive server files.
    goto END
)

echo [2/3] Uploading update_server.tar.gz to %SERVER_IP%...
scp update_server.tar.gz %SERVER_USER%@%SERVER_IP%:%REMOTE_SERVER_DIR%/
if %ERRORLEVEL% neq 0 (
    echo [ERROR] SCP upload failed.
    del update_server.tar.gz >nul 2>&1
    goto END
)

echo [3/3] Extracting on server, installing dependencies and restarting %PM2_APP%...
ssh %SERVER_USER%@%SERVER_IP% "cd %REMOTE_SERVER_DIR% && tar -xzf update_server.tar.gz && rm -f update_server.tar.gz && npm install --omit=dev && pm2 restart %PM2_APP%"
del update_server.tar.gz >nul 2>&1

echo.
echo ======================================================
echo    SUCCESS: Backend updated and PM2 restarted!
echo ======================================================
goto END

:DEPLOY_CLIENT
echo.
echo [1/3] Building frontend client bundle...
cd client
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Client build failed!
    cd ..
    goto END
)
cd ..

echo [2/3] Compressing dist files...
tar -czf update_client.tar.gz -C client/dist .
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to archive dist files.
    goto END
)

echo [3/3] Uploading and extracting on server...
scp update_client.tar.gz %SERVER_USER%@%SERVER_IP%:%REMOTE_CLIENT_DIR%/
if %ERRORLEVEL% neq 0 (
    echo [ERROR] SCP upload failed.
    del update_client.tar.gz >nul 2>&1
    goto END
)

ssh %SERVER_USER%@%SERVER_IP% "cd %REMOTE_CLIENT_DIR% && tar -xzf update_client.tar.gz && rm -f update_client.tar.gz"
del update_client.tar.gz >nul 2>&1

echo.
echo ======================================================
echo    SUCCESS: Frontend updated and deployed live!
echo ======================================================
goto END

:DEPLOY_ALL
call :DEPLOY_SERVER
call :DEPLOY_CLIENT
goto END

:END
echo.
