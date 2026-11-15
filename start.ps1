# ============================================================
# 🚀 LangGraph Development Launcher (v4 — localhost, no docker)
# ============================================================
# Backend:  langgraph dev  →  http://localhost:8123  (in-process, no Docker)
# Frontend: yarn/npm dev   →  http://localhost:3000
# Menu:     all | backend | frontend | exit  (Enter = all)

$Host.UI.RawUI.WindowTitle = "LangGraph Dev Launcher v4"

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
Write-Section "🚀 LANGGRAPH DEVELOPMENT LAUNCHER v4" Magenta
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
# Menu: what to launch
#   a / 1 / Enter → all      b / 2 → backend only
#   f / 3 → frontend only    x / 4 → exit
# ------------------------------------------------------------
function Show-Menu {
    Write-Host ("=" * 60) -ForegroundColor Yellow
    Write-Host "  WHAT DO YOU WANT TO START?" -ForegroundColor Yellow
    Write-Host ("=" * 60) -ForegroundColor Yellow
    Write-Host "  [A] All          backend + frontend  (Enter)" -ForegroundColor Green
    Write-Host "  [B] Backend only langgraph dev :8123" -ForegroundColor Cyan
    Write-Host "  [F] Frontend only yarn/npm dev :3000" -ForegroundColor Green
    Write-Host "  [X] Exit" -ForegroundColor Red
    Write-Host ""
}

function Get-LaunchChoice {
    while ($true) {
        Show-Menu
        $key = (Read-Host "Choose (a/b/f/x) [default: a]").Trim().ToLower()
        if ($key -eq "" -or $key -eq "a" -or $key -eq "1" -or $key -eq "all") { return "all" }
        if ($key -eq "b" -or $key -eq "2" -or $key -eq "backend") { return "backend" }
        if ($key -eq "f" -or $key -eq "3" -or $key -eq "frontend") { return "frontend" }
        if ($key -eq "x" -or $key -eq "4" -or $key -eq "exit" -or $key -eq "q") { return "exit" }
        Write-Color "✖ Unrecognized choice '$key' — try again." Red
        Write-Host ""
    }
}

$Choice = Get-LaunchChoice

if ($Choice -eq "exit") {
    Write-Color "✖ Exiting. Nothing was started." Red
    exit 0
}

Write-Host ""
Write-Color "→ Launching: $Choice" Yellow
Write-Host ""

# ------------------------------------------------------------
# Dependency check (yarn or npm — no docker needed)
# Only needed when the frontend will start.
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

# Prefer yarn (the project ships a yarn.lock), fall back to npm.
$PackageManager = $null
if ($Choice -in @("all", "frontend")) {
    $haveYarn = Test-Tool "yarn"
    if ($haveYarn) {
        $PackageManager = "yarn"
    } else {
        $haveNpm = Test-Tool "npm"
        if (-not $haveNpm) {
            Write-Host ""
            Write-Color "✖ Neither yarn nor npm was found. Install Node.js" Red
            Write-Color "(https://nodejs.org) or yarn (https://yarnpkg.com), then run:" Yellow
            Write-Color "  powershell -ExecutionPolicy Bypass -File .\start.ps1" Yellow
            Write-Host ""
            Read-Host "Press Enter to exit"
            exit 1
        }
        $PackageManager = "npm"
        Write-Color "→ yarn not found; using npm as the package manager" Yellow
    }
} else {
    Write-Color "→ Frontend not requested; skipping yarn/npm check" DarkGray
}

Write-Host ""

# ------------------------------------------------------------
# Launch Backend (localhost, no docker)
# ------------------------------------------------------------
function Start-Backend {
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
Write-Host '  langgraph dev — in-process, no docker.' -ForegroundColor DarkGray
Write-Host ''

`$VenvLanggraph = Join-Path (Get-Location) '.venv\Scripts\langgraph.exe'
if (Test-Path `$VenvLanggraph) {
    Write-Host 'Using backend venv langgraph...' -ForegroundColor Yellow
    & `$VenvLanggraph dev --port 8123 --no-browser
} else {
    Write-Host "Venv langgraph not found at `$VenvLanggraph — trying uv run..." -ForegroundColor Yellow
    uv run langgraph dev --port 8123 --no-browser
}
"@
        )

    Write-Color "✔ Backend launched → http://localhost:8123" Green
}

# ------------------------------------------------------------
# Launch Frontend
# ------------------------------------------------------------
function Start-Frontend {
    Write-Section "Starting Frontend (localhost:3000)" Cyan

    $PkgCmd = (Get-Command $PackageManager).Source

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

if (!(Test-Path (Join-Path (Get-Location) 'node_modules'))) {
    Write-Host 'node_modules missing — installing dependencies...' -ForegroundColor Yellow
    & '$PkgCmd' install
}
if ('$PackageManager' -eq 'yarn') {
    Write-Host 'Running: yarn dev' -ForegroundColor Yellow
    & '$PkgCmd' dev
} else {
    Write-Host 'Running: npm run dev' -ForegroundColor Yellow
    & '$PkgCmd' run dev
}
"@
        )

    Write-Color "✔ Frontend launched → http://localhost:3000" Green
}

# ------------------------------------------------------------
# Open the workshop (fresh session — no hardcoded threadId)
# ------------------------------------------------------------
$WorkshopUrl = "http://localhost:3000/workshop?assistantId=blogwriter&sidebar=0"

function Open-Workshop {
    Write-Color "🌐 Opening workshop URL..." Cyan
    try {
        Start-Process $WorkshopUrl
        Write-Color "✔ Opened: $WorkshopUrl" Green
    } catch {
        Write-Color "✖ Could not open browser automatically." Red
        Write-Color "  Open this manually: $WorkshopUrl" Red
    }
}

# ------------------------------------------------------------
# Run the chosen launch
# ------------------------------------------------------------
switch ($Choice) {
    "all"      { Start-Backend; Start-Frontend; Open-Workshop }
    "backend"  { Start-Backend }
    "frontend" { Start-Frontend; Open-Workshop }
}

Write-Host ""
Write-Color "  Full trace saved to: $LogFile" DarkGray
Write-Color "  To stop: close the PowerShell window(s) above." DarkGray
Write-Host ""

# Keep this window open so you can read the output
Read-Host "Press Enter to close this launcher window"
