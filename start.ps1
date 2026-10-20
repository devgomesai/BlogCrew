# ============================================================
# 🚀 LangGraph Development Launcher (v2 — localhost, no docker)
# ============================================================
# Backend:  langgraph up  →  http://localhost:8123
# Frontend: yarn dev      →  http://localhost:3000
# Browser:  opens your workshop thread automatically

$Host.UI.RawUI.WindowTitle = "LangGraph Dev Launcher v2"

# ------------------------------------------------------------
# Logging (console + file)
# ------------------------------------------------------------
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root "logs"
if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = Join-Path $LogDir "start.log"
$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Write-Color {
    param([string]$Text, [ConsoleColor]$Color = "White")
    $line = "[$ts] $Text"
    Write-Host $Text -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $line
}

function Write-Section {
    param([string]$Text, [ConsoleColor]$Color = "Cyan")
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor $Color
    Write-Host $Text -ForegroundColor $Color
    Write-Host ("=" * 60) -ForegroundColor $Color
    Add-Content -Path $LogFile -Value "[$ts] $Text"
}

# ------------------------------------------------------------
# Banner
# ------------------------------------------------------------
Write-Host ""
Write-Section "🚀 LANGGRAPH DEVELOPMENT LAUNCHER v2" Magenta
Write-Color "Backend on localhost (NO docker)" Magenta
Write-Color "Log file: $LogFile" DarkGray
Write-Host ""

# ------------------------------------------------------------
# Project paths
# ------------------------------------------------------------
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"

Write-Color "Root   : $Root" DarkGray
Write-Color "Backend: $Backend" DarkGray
Write-Color "Frontend: $Frontend" DarkGray
Write-Host ""

# ------------------------------------------------------------
# Dependency check (yarn only — no docker needed)
# ------------------------------------------------------------
Write-Color "Checking dependencies..." Yellow

function Test-Tool {
    param([string]$Name)
    $tool = Get-Command $Name -ErrorAction SilentlyContinue
    if ($tool) {
        Write-Color "✔ $Name found" Green
        return $true
    }
    Write-Color "✖ $Name NOT found" Red
    return $false
}

$haveYarn = Test-Tool "yarn"

if (-not $haveYarn) {
    Write-Host ""
    Write-Color "✖ Missing required tool: yarn" Red
    Write-Color "Install yarn (https://yarnpkg.com), then run:" Yellow
    Write-Color "  powershell -ExecutionPolicy Bypass -File .\start.ps1" Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# ------------------------------------------------------------
# Launch Backend (localhost, no docker)
# ------------------------------------------------------------
Write-Section "Starting Backend (localhost:8123)" Cyan

Start-Process powershell `
    -WorkingDirectory $Backend `
    -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command",
@"
`$Host.UI.RawUI.WindowTitle = '🖥️ Backend (localhost:8123)'
Clear-Host
Write-Host ''
Write-Host '=========================================' -ForegroundColor Cyan
Write-Host '   🖥️  LANGGRAPH BACKEND (localhost:8123)' -ForegroundColor Green
Write-Host '=========================================' -ForegroundColor Cyan
Write-Host '  Running locally — no docker container.' -ForegroundColor DarkGray
Write-Host ''

`$Venv = Join-Path (Get-Location) '.venv\Scripts\Activate.ps1'
if (Test-Path `$Venv) {
    Write-Host 'Activating venv...' -ForegroundColor Yellow
    & `$Venv
} else {
    Write-Host "Warning: venv not found at `$Venv" -ForegroundColor Red
}

Write-Host 'Running: langgraph up' -ForegroundColor Yellow
langgraph up
"@
    )

# ------------------------------------------------------------
# Launch Frontend
# ------------------------------------------------------------
Write-Section "Starting Frontend (localhost:3000)" Cyan

$YarnPath = (Get-Command yarn).Source

Start-Process powershell `
    -WorkingDirectory $Frontend `
    -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command",
@"
`$Host.UI.RawUI.WindowTitle = '🌐 Frontend (localhost:3000)'
Clear-Host
Write-Host ''
Write-Host '=========================================' -ForegroundColor Green
Write-Host '           🌐 FRONTEND' -ForegroundColor Cyan
Write-Host '=========================================' -ForegroundColor Green
Write-Host ''

& '$YarnPath' dev
"@
    )

# ------------------------------------------------------------
# Open workshop URL
# ------------------------------------------------------------
$WorkshopUrl = "http://localhost:3000/workshop?assistantId=blogwriter&sidebar=0&threadId=01a14f20-ab1f-7751-8979-c7e99663ecfb"

Write-Host ""
Write-Color "✔ Backend launched → http://localhost:8123" Green
Write-Color "✔ Frontend launched → http://localhost:3000" Green
Write-Color "🌐 Opening workshop URL..." Cyan

try {
    Start-Process $WorkshopUrl
    Write-Color "✔ Opened: $WorkshopUrl" Green
} catch {
    Write-Color "✖ Could not open browser automatically." Red
    Write-Color "  Open this manually: $WorkshopUrl" Red
}

Write-Host ""
Write-Color "  Full trace saved to: $LogFile" DarkGray
Write-Color "  To stop: close the two PowerShell windows above." DarkGray
Write-Host ""

# Keep this window open so you can read the output
Read-Host "Press Enter to close this launcher window"
