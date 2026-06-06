param(
    [Parameter(Mandatory = $true)]
    [string]$Message,

    [string]$ContainerName = "freya-go2rtc",
    [int]$ApiPort = 1984,
    [ValidateSet("pcma", "pcmu", "aac")]
    [string]$Codec = "pcma"
)

$ErrorActionPreference = "Stop"

$mediaDir = Join-Path (Join-Path $env:TEMP "freya-go2rtc") "media"
New-Item -ItemType Directory -Force -Path $mediaDir | Out-Null

$fileName = "freya_reolink_tts_{0}.wav" -f ([guid]::NewGuid().ToString("N"))
$wavPath = Join-Path $mediaDir $fileName
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile($wavPath)
$synth.Speak($Message)
$synth.Dispose()

$containerRunning = docker inspect -f "{{.State.Running}}" $ContainerName 2>$null
if ($containerRunning -ne "true") {
    throw "go2rtc container '$ContainerName' is not running. Start it with .\scripts\start_reolink_go2rtc.ps1"
}

$src = [uri]::EscapeDataString("ffmpeg:/media/$fileName#audio=$Codec#input=file")
$url = "http://localhost:$ApiPort/api/streams?dst=reolink&src=$src"

try {
    Invoke-WebRequest -Method Post -Uri $url -TimeoutSec 30 -ErrorAction Stop | Out-Null
    Write-Host "Sent Reolink talkback audio using codec $Codec."
} catch {
    $response = $_.Exception.Response
    $body = ""
    if ($response) {
        $reader = New-Object IO.StreamReader($response.GetResponseStream())
        $body = $reader.ReadToEnd()
    }
    Write-Host "Talkback request failed for codec $Codec."
    if ($body) {
        Write-Host $body
    } else {
        Write-Host $_.Exception.Message
    }
    Write-Host "Try another codec, for example: -Codec pcmu or -Codec aac"
    exit 1
}
