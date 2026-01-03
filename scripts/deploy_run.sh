#!/bin/bash
set -Eeuo pipefail

DEPLOY_RUN_PORT=8888

 pnpm run start --port ${DEPLOY_RUN_PORT}