#!/bin/sh
set -e

echo "Waiting for database schema…"
npx drizzle-kit push --force

echo "Starting Dasharr…"
exec npx tsx server/index.ts
