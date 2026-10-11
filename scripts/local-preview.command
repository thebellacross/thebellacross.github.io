#!/bin/zsh
set -eu

PROJECT_DIR="$(cd -- "$(dirname -- "$0")/.." && pwd)"
RUNTIME_DIR="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"

if ! command -v node >/dev/null 2>&1 || ! command -v pnpm >/dev/null 2>&1; then
  if [[ -x "$RUNTIME_DIR/node/bin/node" && -x "$RUNTIME_DIR/bin/fallback/pnpm" ]]; then
    export PATH="$RUNTIME_DIR/node/bin:$RUNTIME_DIR/bin/fallback:$PATH"
  else
    print 'Install Node.js 22.12+ and pnpm 11, then run pnpm install and pnpm dev.'
    exit 1
  fi
fi

cd "$PROJECT_DIR"
exec pnpm dev
