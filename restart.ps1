$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 5000
$log = Join-Path $root 'log'
$err = Join-Path $root 'err'

$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Write-Host "Stopping old server (PID $($conn.OwningProcess)) on port $port..."
    Stop-Process -Id $conn.OwningProcess -Force
    for ($i = 0; $i -lt 40; $i++) {
        if (-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) { break }
        Start-Sleep -Milliseconds 250
    }
}

Remove-Item -LiteralPath $log, $err -Force

Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $err
Write-Host "Starting server in $root ..."

for ($i = 0; $i -lt 40; $i++) {
    if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { break }
    Start-Sleep -Milliseconds 250
}

$listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listening) {
    Write-Host "OK - server running on port $port (PID $($listening.OwningProcess))"
} else {
    Write-Host "FAILED - nothing listening on port $port"
    Write-Host '--- stderr ---'
    Get-Content $err
    exit 1
}
