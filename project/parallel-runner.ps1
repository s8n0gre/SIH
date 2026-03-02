# PowerShell script for parallel server execution
param(
    [string[]]$Servers = @(),
    [string]$ScriptPath = "",
    [string]$Username = "",
    [switch]$Local = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    PARALLEL SERVER RUNNER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($Local) {
    Write-Host "Running local servers in parallel..." -ForegroundColor Green
    
    $jobs = @()
    
    # Start MongoDB
    $jobs += Start-Job -ScriptBlock { Start-Process "mongod" -ArgumentList "--dbpath C:\data\db" -WindowStyle Normal }
    Start-Sleep 2
    
    # Start Backend
    $jobs += Start-Job -ScriptBlock { 
        Set-Location "$using:PSScriptRoot\backend"
        npm start 
    }
    Start-Sleep 2
    
    # Start AI Server
    $jobs += Start-Job -ScriptBlock { 
        Set-Location "$using:PSScriptRoot\local-ai-server"
        & "venv\Scripts\activate.ps1"
        python server.py 
    }
    Start-Sleep 2
    
    # Start ViT Server
    $jobs += Start-Job -ScriptBlock { 
        Set-Location "$using:PSScriptRoot\local-ai-server"
        python vit_server.py 
    }
    Start-Sleep 2
    
    # Start Frontend
    $jobs += Start-Job -ScriptBlock { 
        Set-Location $using:PSScriptRoot
        npm start 
    }
    
    Write-Host "All local servers started!" -ForegroundColor Green
    return
}

if ($Servers.Count -eq 0) {
    $serverInput = Read-Host "Enter server IPs (comma-separated)"
    $Servers = $serverInput -split ","
}

if ([string]::IsNullOrEmpty($ScriptPath)) {
    $ScriptPath = Read-Host "Enter script path to execute"
}

if ([string]::IsNullOrEmpty($Username)) {
    $Username = Read-Host "Enter username"
}

$jobs = @()

foreach ($server in $Servers) {
    $server = $server.Trim()
    Write-Host "Starting job for server: $server" -ForegroundColor Yellow
    
    $job = Start-Job -ScriptBlock {
        param($srv, $path, $user)
        try {
            Invoke-Command -ComputerName $srv -Credential (Get-Credential $user) -ScriptBlock {
                param($scriptPath)
                & $scriptPath
            } -ArgumentList $path
        } catch {
            Write-Error "Failed to connect to $srv : $_"
        }
    } -ArgumentList $server, $ScriptPath, $Username
    
    $jobs += $job
}

Write-Host "`nWaiting for all jobs to complete..." -ForegroundColor Green
$jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

Write-Host "`n✅ All servers processed!" -ForegroundColor Green