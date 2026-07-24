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
$Frontend = Join-Path $Root "frontend\deep-agents-ui"
$VenvActivate = Join-Path $Root ".venv\Scripts\Activate.ps1"

Write-Color "Project Root :" DarkGray
Write-Color "  $Root" White

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

# Only yarn must exist globally
$yarn = Test-Tool "yarn"

if (-not (Test-Path $VenvActivate)) {
    Write-Host ""
    Write-Color "✖ Virtual environment not found." Red
    Write-Color "Expected:" Yellow
    Write-Color "  $VenvActivate" White
    exit 1
}

Write-Color "✔ Virtual environment found" Green

if (-not $yarn) {
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
    -WorkingDirectory $Root `
    -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command",
@"
`$Host.UI.RawUI.WindowTitle = '🚀 LangGraph Backend'
Clear-Host

Write-Host ''
Write-Host '=========================================' -ForegroundColor Cyan
Write-Host '        🚀 LANGGRAPH BACKEND' -ForegroundColor Green
Write-Host '=========================================' -ForegroundColor Cyan
Write-Host ''

. '$VenvActivate'

Write-Host 'Python :' (Get-Command python).Source -ForegroundColor Yellow
Write-Host 'LangGraph:' (Get-Command langgraph).Source -ForegroundColor Yellow
Write-Host ''

langgraph dev
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
Write-Color "✔ Backend launched." Green
Write-Color "✔ Frontend launched." Green
Write-Host ""