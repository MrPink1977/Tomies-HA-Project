param(
    [int]$Retries = 5
)

$ErrorActionPreference = "Stop"

$images = @(
    "exadel/compreface-postgres-db:1.2.0",
    "exadel/compreface-core:1.2.0",
    "exadel/compreface-api:1.2.0",
    "exadel/compreface-admin:1.2.0",
    "exadel/compreface-fe:1.2.0",
    "ghcr.io/blakeblackshear/frigate:stable",
    "jakowenko/double-take:latest"
)

foreach ($image in $images) {
    for ($attempt = 1; $attempt -le $Retries; $attempt++) {
        Write-Host "Pulling $image (attempt $attempt of $Retries)"
        docker pull $image
        if ($LASTEXITCODE -eq 0) {
            break
        }

        if ($attempt -eq $Retries) {
            throw "Failed to pull $image after $Retries attempts"
        }

        Start-Sleep -Seconds ([Math]::Min(30, 5 * $attempt))
    }
}

Write-Host "Face stack images are pulled."
