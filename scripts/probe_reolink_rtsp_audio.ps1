param(
    [ValidateSet("sub", "main")]
    [string]$Stream = "sub",

    [int]$CaptureSeconds = 0,

    [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"

$configPath = Join-Path $PSScriptRoot "..\config\.storage\core.config_entries"
if (-not (Test-Path $configPath)) {
    throw "Home Assistant config entries file not found: $configPath"
}

$entries = (Get-Content $configPath -Raw | ConvertFrom-Json).data.entries
$entry = $entries | Where-Object { $_.domain -eq "reolink" } | Select-Object -First 1
if (-not $entry) {
    throw "No Reolink config entry found in Home Assistant storage."
}

$username = [uri]::EscapeDataString($entry.data.username)
$password = [uri]::EscapeDataString($entry.data.password)
$hostName = $entry.data.host
$path = if ($Stream -eq "main") { "h264Preview_01_main" } else { "h264Preview_01_sub" }
$url = "rtsp://${username}:${password}@${hostName}:554/${path}"

Write-Host "Probing Reolink RTSP $Stream stream on $hostName..."
ffprobe -hide_banner -v error -rtsp_transport tcp `
    -show_entries stream=index,codec_type,codec_name,sample_rate,channels,width,height `
    -of json $url

if ($CaptureSeconds -le 0) {
    exit 0
}

if (-not $OutputPath) {
    $OutputPath = Join-Path $env:TEMP "reolink_voice_probe.wav"
}

Write-Host "Capturing $CaptureSeconds seconds of audio to $OutputPath..."
ffmpeg -hide_banner -loglevel error -y -rtsp_transport tcp -i $url `
    -map 0:a:0 -t $CaptureSeconds -ac 1 -ar 16000 -c:a pcm_s16le $OutputPath

Write-Host "Captured audio file details:"
ffprobe -hide_banner -v error `
    -show_entries format=duration,size:stream=codec_name,codec_type,sample_rate,channels `
    -of json $OutputPath
