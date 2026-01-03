#!/bin/bash
set -Eeuo pipefail

DEPLOY_RUN_PORT=8888
echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
pnpm run start --port ${DEPLOY_RUN_PORT}