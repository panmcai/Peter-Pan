#!/bin/bash
set -Eeuo pipefail

echo "Installing dependencies..."
pnpm install

echo "Building the project..."
pnpm run build

echo "Build completed successfully!"