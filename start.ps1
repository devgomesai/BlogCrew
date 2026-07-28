# ============================================================
# 🚀 LangGraph Development Launcher
# ============================================================

$Host.UI.RawUI.WindowTitle = "Development Launcher"

function Write-Color {
    param(
        [string]$Text,
        [ConsoleColor]$Color = "White"
    )

    Write-Host $Text -ForegroundColor $Color
}

Clear-Host

Write-Color "====================================================" Cyan
Write-Color "          🚀 LANGGRAPH DEVELOPMENT LAUNCHER          " Magenta
Write-Color "====================================================" Cyan
Write-Host ""

# ------------------------------------------------------------
# Project Paths
# ------------------------------------------------------------

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"

Write-Color "Project Root :" DarkGray
Write-Color "  $Root" White

Write-Color "Backend :" DarkGray
Write-Color "  $Backend" White

Write-Color "Frontend :" DarkGray
Write-Color "  $Frontend" White
Write-Host ""

# ------------------------------------------------------------
# Dependency Check
# ------------------------------------------------------------

function Test-Tool {
    param([string]$Name)

    $tool = Get-Command $Name -ErrorAction SilentlyContinue

    if ($tool) {
        Write-Color "✔ $Name found" Green
        return $tool
    }

    Write-Color "✖ $Name not found" Red
    return $null
}

Write-Color "Checking dependencies..." Yellow

# yarn and docker must exist globally
$yarn = Test-Tool "yarn"
$docker = Test-Tool "docker"

# No .venv check — the backend runs in Docker, not in a local virtualenv.

if (-not $yarn -or -not $docker) {
    Write-Host ""
    Write-Color "Missing required tools." Red
    exit 1
}

Write-Host ""

# ------------------------------------------------------------
# Launch Backend
# ------------------------------------------------------------

Write-Color "Starting Backend..." Cyan

Start-Process powershell `
    -WorkingDirectory $Backend `
    -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command",
@"
`$Host.UI.RawUI.WindowTitle = '🐳 LangGraph Backend (Docker)'
Clear-Host

Write-Host ''
Write-Host '=========================================' -ForegroundColor Cyan
Write-Host '     🐳 LANGGRAPH BACKEND (blog-crew-backend)' -ForegroundColor Green
Write-Host '=========================================' -ForegroundColor Cyan
Write-Host ''

# Create-or-start: `docker start` alone silently no-ops when the container
# has never been built.
`$id = docker ps -aq --filter 'name=blog-crew-backend'
if (`$id) { docker start -a `$id } else {
    Write-Host 'No blog-crew-backend container yet — building with langgraph up...' -ForegroundColor Yellow
    langgraph up
}
"@
)

# ------------------------------------------------------------
# Launch Frontend
# ------------------------------------------------------------

Write-Color "Starting Frontend..." Cyan

$YarnPath = $yarn.Source

Start-Process powershell `
    -WorkingDirectory $Frontend `
    -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command",
@"
`$Host.UI.RawUI.WindowTitle = '🌐 Frontend'
Clear-Host

Write-Host ''
Write-Host '=========================================' -ForegroundColor Green
Write-Host '           🌐 FRONTEND' -ForegroundColor Cyan
Write-Host '=========================================' -ForegroundColor Green
Write-Host ''

& '$YarnPath' dev
"@
)

Write-Host ""
Write-Color "✔ Backend launched (Docker: blog-crew-backend, http://localhost:8123)." Green
Write-Color "✔ Frontend launched." Green
Write-Color "  Stop backend containers: docker compose -p blog-crew-backend down" DarkGray
Write-Host ""