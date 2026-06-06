param(
    [switch]$Execute,
    [switch]$PrintAll,
    [switch]$NoPersonGate,
    [switch]$PrintGate,
    [int]$ChunkSeconds = 8,
    [int]$MaxChunks = 0
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$mode = if ($Execute) { "EXECUTE" } else { "DRY-RUN" }
Write-Host "Starting Reolink Freya listener in $mode mode."
Write-Host "Press Ctrl+C to stop."

$listenerArgs = @(
    ".\scripts\listen_reolink_rtsp_wyoming.py",
    "--chunk-seconds", "$ChunkSeconds",
    "--require-wake", "hey freya"
)

if (-not $NoPersonGate) {
    $listenerArgs += @("--gate-entity", "binary_sensor.reolink_person")
}

if ($PrintGate) {
    $listenerArgs += "--print-gate"
}

if ($MaxChunks -gt 0) {
    $listenerArgs += @("--max-chunks", "$MaxChunks")
}

if ($PrintAll) {
    $listenerArgs += "--print-all"
}

if ($Execute) {
    $listenerArgs += "--execute"
}

python @listenerArgs
