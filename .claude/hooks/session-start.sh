#!/bin/bash
# Installa le dipendenze all'avvio delle sessioni Claude Code sul web,
# così lint e build sono subito eseguibili.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm ci --no-audit --no-fund
