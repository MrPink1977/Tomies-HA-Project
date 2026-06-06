param(
    [string]$ContainerName = "freya-go2rtc",
    [int]$ApiPort = 1984,
    [int]$RtspPort = 8554
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$entry = (Get-Content "config\.storage\core.config_entries" -Raw | ConvertFrom-Json).data.entries |
    Where-Object { $_.domain -eq "reolink" } |
    Select-Object -First 1

if (-not $entry) {
    throw "No Reolink config entry found in Home Assistant storage."
}

$username = [uri]::EscapeDataString($entry.data.username)
$password = [uri]::EscapeDataString($entry.data.password)
$hostName = $entry.data.host

$baseDir = Join-Path $env:TEMP "freya-go2rtc"
$configDir = Join-Path $baseDir "config"
$mediaDir = Join-Path $baseDir "media"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
New-Item -ItemType Directory -Force -Path $mediaDir | Out-Null

$config = @(
    "api:",
    "  listen: ':1984'",
    "rtsp:",
    "  listen: ':8554'",
    "streams:",
    "  reolink:",
    "    - onvif://${username}:${password}@${hostName}:8000?subtype=001"
) -join "`n"

$configPath = Join-Path $configDir "go2rtc.yaml"
Set-Content -Path $configPath -Value $config -Encoding UTF8

try {
    docker rm -f $ContainerName 2>$null | Out-Null
} catch {
    # Container not existing is fine; this script recreates it.
}
docker run -d `
    --name $ContainerName `
    -p "${ApiPort}:1984" `
    -p "${RtspPort}:8554" `
    -v "${configDir}:/config" `
    -v "${mediaDir}:/media" `
    --entrypoint go2rtc `
    alexxit/go2rtc:latest `
    -config /config/go2rtc.yaml | Out-Null

Start-Sleep -Seconds 3

Write-Host "go2rtc started: http://localhost:$ApiPort"
Write-Host "Stream name: reolink"
Write-Host "Media folder: $mediaDir"
$streams = Invoke-RestMethod -Uri "http://localhost:$ApiPort/api/streams" -TimeoutSec 8
if ($streams.PSObject.Properties.Name -contains "reolink") {
    Write-Host "Reolink stream registered."
} else {
    Write-Host "go2rtc started, but Reolink stream was not found in API response."
}
