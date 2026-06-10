#!/bin/bash
set -e

echo "========================================"
echo "  CMS REST API Setup Script (Linux/macOS)"
echo "========================================"
echo

echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js first."
    exit 1
fi
node --version

echo "[2/5] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi
docker --version

echo
echo "[3/5] Starting PostgreSQL via Docker Compose..."
docker compose up -d

echo "Waiting for PostgreSQL to be ready..."
until docker compose exec -T postgres pg_isready -U cms_user -d cms_db > /dev/null 2>&1; do
    sleep 2
done
echo "PostgreSQL is ready!"

echo
echo "[4/5] Copying .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env created from .env.example"
else
    echo ".env already exists, skipping"
fi

echo
echo "[5/5] Installing dependencies..."
if [ ! -d node_modules ]; then
    npm install
else
    echo "node_modules already exists, skipping npm install"
fi

echo
echo "Running database migrations..."
npm run migrate

echo
echo "========================================"
echo "  Setup complete!"
echo "========================================"
echo
echo "Starting development server..."
echo "Press Ctrl+C to stop."
echo
npm run dev
