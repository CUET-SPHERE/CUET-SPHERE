Write-Host "Starting CUET Sphere backend server in development mode with live reload..." -ForegroundColor Green
Write-Host "Changes to Java files will automatically trigger a restart" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot\backend
$mvnwPath = Join-Path -Path (Get-Location) -ChildPath "mvnw.cmd"
& $mvnwPath spring-boot:run "-Dspring-boot.run.profiles=dev"