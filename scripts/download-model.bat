@echo off
cd /d "%~dp0.."
title Download MiniCPM Model

echo =================================================================
echo  MiniCPM Model Downloader
echo =================================================================
echo.
echo This will download the complete model file (~3.5GB)
echo Current file is incomplete (166MB)
echo.
echo Download URL:
echo https://huggingface.co/openbmb/MiniCPM-V-2_6-gguf/resolve/main/MiniCPM-V-2_6-Q3_K_S.gguf
echo.
echo Options:
echo 1. Download with Python (recommended)
echo 2. Download with PowerShell
echo 3. Manual download (open browser)
echo 4. Cancel
echo.

set /p choice="Choose option (1-4): "

if "%choice%"=="1" goto PYTHON
if "%choice%"=="2" goto POWERSHELL
if "%choice%"=="3" goto MANUAL
goto END

:PYTHON
echo.
echo Downloading with Python...
python -c "import urllib.request; urllib.request.urlretrieve('https://huggingface.co/openbmb/MiniCPM-V-2_6-gguf/resolve/main/MiniCPM-V-2_6-Q3_K_S.gguf', 'ai_server/MiniCPM-V-2_6-Q3_K_S.gguf')"
echo Download complete!
pause
goto END

:POWERSHELL
echo.
echo Downloading with PowerShell...
powershell -Command "Invoke-WebRequest -Uri 'https://huggingface.co/openbmb/MiniCPM-V-2_6-gguf/resolve/main/MiniCPM-V-2_6-Q3_K_S.gguf' -OutFile 'ai_server\MiniCPM-V-2_6-Q3_K_S.gguf'"
echo Download complete!
pause
goto END

:MANUAL
echo.
echo Opening browser...
start https://huggingface.co/openbmb/MiniCPM-V-2_6-gguf/tree/main
echo.
echo Download: MiniCPM-V-2_6-Q3_K_S.gguf
echo Save to: %CD%\ai_server
echo.
pause
goto END

:END

