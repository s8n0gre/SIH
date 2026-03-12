#!/usr/bin/env pwsh

# CrowdSource - Start All Services
# This script starts MongoDB, Backend, Frontend, and AI Server

param(
    [switch]$NoWait = $false
)

$ErrorActionPreference = "Continue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Colors
$colors = @{
    Info    = "Cyan"
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )
    $color = $colors[$Level]
    Write-Host "[$Level] $Message" -ForegroundColor $color
}

function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

function Start-Service {
    param(
        [string]$ServiceName,
        [int]$Port,
        [scriptblock]$StartScript
    )

    Write-Log "Checking $ServiceName..." "Info"
    
    if (Test-Port $Port) {
        Write-Log "$ServiceName is already running on port $Port" "Warning"
        return $true
    }

    Write-Log "Starting $ServiceName..." "Info"
    
    try {
        & $StartScript
        Start-Sleep -Seconds 2
        
        if (Test-Port $Port) {
            Write-Log "$ServiceName started successfully on port $Port" "Success"
            return $true
        }
        else {
            Write-Log "Failed to start $ServiceName" "Error"
            return $false
        }
    }
    catch {
        Write-Log "Error starting $ServiceName: $_" "Error"
        return $false
    }
}

# Main execution
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CrowdSource - Starting All Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Create data directory
$mongoDataPath = Join-Path $projectRoot "data\mongodb"
if (-not (Test-Path $mongoDataPath)) {
    New-Item -ItemType Directory -Path $mongoDataPath -Force | Out-Null
}

# Start MongoDB
$mongoScript = {
    $mongoExe = "mongod"
    if (-not (Get-Command $mongoExe -ErrorAction SilentlyContinue)) {
        $commonPaths = @(
            "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe",
            "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
            "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe",
            "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe",
            "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe"
        )
        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                $mongoExe = $path
                break
            }
        }
    }
    
    if ($mongoExe -eq "mongod" -and -not (Get-Command "mongod" -ErrorAction SilentlyContinue)) {
        Write-Log "MongoDB executable (mongod) not found in PATH or common locations." "Error"
        return
    }

    Write-Log "Using MongoDB executable: $mongoExe" "Info"
    Start-Process -NoNewWindow -FilePath $mongoExe -ArgumentList "--dbpath `"$mongoDataPath`""
}
Start-Service -ServiceName "MongoDB" -Port 27017 -StartScript $mongoScript | Out-Null

# Start Backend
$backendScript = {
    Push-Location "$projectRoot\backend"
    npm install 2>&1 | Out-Null
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"
    Pop-Location
}
Start-Service -ServiceName "Backend" -Port 5000 -StartScript $backendScript | Out-Null

# Start Frontend
$frontendScript = {
    Push-Location $projectRoot
    npm install 2>&1 | Out-Null
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev"
    Pop-Location
}
Start-Service -ServiceName "Frontend" -Port 5173 -StartScript $frontendScript | Out-Null

# Start AI Server
$aiScript = {
    Push-Location "$projectRoot\ai_server"
    Start-Process -NoNewWindow -FilePath "python" -ArgumentList "direct_minicpm_server.py"
    Pop-Location
}
Start-Service -ServiceName "AI Server" -Port 3001 -StartScript $aiScript | Out-Null

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "All services started!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Log "Services running on:" "Info"
Write-Log "  MongoDB:    mongodb://localhost:27017" "Info"
Write-Log "  Backend:    http://localhost:5000" "Info"
Write-Log "  Frontend:   http://localhost:5173" "Info"
Write-Log "  AI Server:  http://localhost:3001" "Info"
Write-Host ""

if (-not $NoWait) {
    Write-Log "Press Ctrl+C to stop services" "Warning"
    Write-Host ""
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
