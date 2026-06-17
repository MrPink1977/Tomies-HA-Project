param(
    [string]$ContainerName = "freya-go2rtc"
)

docker rm -f $ContainerName 2>$null | Out-Null
Write-Host "Stopped $ContainerName."
