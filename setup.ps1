# CUET Sphere Setup Script
# Run this script to set up the development environment

Write-Host "=== CUET Sphere Setup Script ===" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Java is installed
Write-Host "Checking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "Java version: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "Java not found. Please install Java 17 or later." -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "Frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend dependencies installed successfully" -ForegroundColor Green

# Go back to root directory
Set-Location ".."

# Compile backend
Write-Host "Compiling backend..." -ForegroundColor Yellow
Set-Location "backend"
.\mvnw.cmd clean compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to compile backend" -ForegroundColor Red
    exit 1
}
Write-Host "Backend compiled successfully" -ForegroundColor Green

# Go back to root directory
Set-Location ".."

Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Install MySQL and create database 'sphere'" -ForegroundColor White
Write-Host "2. Start backend: cd backend && .\mvnw.cmd spring-boot:run" -ForegroundColor White
Write-Host "3. Start frontend: cd Frontend && npm run dev" -ForegroundColor White
Write-Host "4. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see SETUP_AND_TESTING_GUIDE.md" -ForegroundColor Cyan
