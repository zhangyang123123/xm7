@echo off
echo ========================================
echo   CMS REST API Setup Script (Windows)
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo [2/5] Checking Docker...
docker --version
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

echo.
echo [3/5] Starting PostgreSQL via Docker Compose...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker Compose.
    exit /b 1
)

echo Waiting for PostgreSQL to be ready...
:waitloop
docker compose exec -T postgres pg_isready -U cms_user -d cms_db
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto waitloop
)
echo PostgreSQL is ready!

echo.
echo [4/5] Copying .env file...
if not exist .env (
    copy .env.example .env
    echo .env created from .env.example
) else (
    echo .env already exists, skipping
)

echo.
echo [5/5] Installing dependencies...
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: npm install failed.
        exit /b 1
    )
) else (
    echo node_modules already exists, skipping npm install
)

echo.
echo Running database migrations...
call npm run migrate
if %errorlevel% neq 0 (
    echo ERROR: Migrations failed.
    exit /b 1
)

echo.
echo ========================================
echo   Setup complete!
echo ========================================
echo.
echo Starting development server...
echo Press Ctrl+C to stop.
echo.
call npm run dev
