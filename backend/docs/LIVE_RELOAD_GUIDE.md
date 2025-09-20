# Live Reload Setup for CUET Sphere Backend

This document explains how to use the live reload functionality for the CUET Sphere backend server.

## What is Live Reload?

Live reload allows the Spring Boot application to automatically restart whenever changes are detected in the classpath (like Java files). This significantly speeds up development by eliminating the need to manually restart the server after every code change.

## How to Use

### Option 1: Using the PowerShell Script

1. Simply run the `start-dev-backend.ps1` script from the root folder:

```powershell
.\start-dev-backend.ps1
```

This script will start the Spring Boot application with DevTools and the dev profile enabled.

### Option 2: Manual Start

1. Navigate to the backend directory
2. Run the following command:

```powershell
cd backend
$mvnwPath = Join-Path -Path (Get-Location) -ChildPath "mvnw.cmd"
& $mvnwPath spring-boot:run "-Dspring-boot.run.profiles=dev"
```

## How It Works

1. Spring Boot DevTools is included as a dependency in the project
2. When you make changes to Java files, the application context will be reloaded
3. The `application-dev.properties` file configures DevTools to monitor for changes
4. Changes to static resources (like HTML, CSS, JS) don't require a restart

## Important Settings

- `spring.devtools.restart.enabled=true` - Enables automatic restart
- `spring.devtools.livereload.enabled=true` - Enables live reload for web resources
- `spring.devtools.restart.poll-interval=2s` - How frequently DevTools checks for changes
- `spring.devtools.restart.quiet-period=1s` - Waiting period to ensure all changes are complete

## Limitations

1. Some changes will still require a full restart:
   - Changes to dependency configuration in pom.xml
   - Changes to application.properties that aren't picked up by DevTools
   - Adding new dependencies

2. Database schema changes might require manual intervention

## Troubleshooting

If the automatic reload stops working:

1. Ensure you're running with the dev profile (`-Dspring-boot.run.profiles=dev`)
2. Check that DevTools is properly included as a dependency in pom.xml
3. Verify that application-dev.properties has the correct DevTools settings
4. Try a manual restart of the application