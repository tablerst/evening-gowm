#!/usr/bin/env bash
set -Eeuo pipefail

# Ubuntu/Linux redeploy helper
# - Builds frontend (pnpm install + pnpm build-only by default)
# - Then runs backend (systemd, foreground, or legacy nohup daemon)
#
# Why this order?
#   "go run ." will start the backend and usually blocks (keeps running),
#   so if we run it first the frontend build step would never execute.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/src/backend"
FRONTEND_DIR="$ROOT_DIR/src/frontend"
BACKEND_BIN="$ROOT_DIR/bin/evening-gown"
SYSTEMD_SERVICE="${EVENING_GOWN_BACKEND_SERVICE:-evening-gown-backend.service}"

PID_FILE="$ROOT_DIR/.backend-go-run.pid"
LOG_FILE="$ROOT_DIR/.backend-go-run.log"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/redeploy.sh [--systemd|--daemon] [--frontend-build <build|build-only|skip>]

Options:
  --systemd  Build a stable backend binary, restart the systemd service, and
             wait for /healthz. Requires evening-gown-backend.service.
  --daemon   Run backend in background (nohup) and write pid/log in repo root.
  --frontend-build <build|build-only|skip>
             Which pnpm script to run for frontend build.
             - build      : runs type-check + build (your package.json runs them in parallel)
             - build-only : runs only vite build (lower peak memory; recommended on 2C2G)
             - skip       : do not build frontend

Default behavior:
  1) cd src/frontend  -> pnpm install --frozen-lockfile  -> pnpm build-only
  2) cd src/backend   -> start backend using the selected mode
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Missing command: $1" >&2
    return 1
  fi
}

stop_existing_backend_if_any() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE" || true)"
    if [[ -n "${pid}" ]] && kill -0 "$pid" >/dev/null 2>&1; then
      echo "[INFO] Stopping existing backend process (pid=$pid) ..."
      kill "$pid" >/dev/null 2>&1 || true
      # Give it a moment to exit gracefully
      for _ in {1..30}; do
        if ! kill -0 "$pid" >/dev/null 2>&1; then
          break
        fi
        sleep 0.2
      done
      if kill -0 "$pid" >/dev/null 2>&1; then
        echo "[WARN] Backend still running, sending SIGKILL (pid=$pid) ..." >&2
        kill -9 "$pid" >/dev/null 2>&1 || true
      fi
    fi
    rm -f "$PID_FILE" || true
  fi
}

DAEMON=0
SYSTEMD=0
FRONTEND_BUILD="build-only"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --daemon)
      DAEMON=1
      shift
      ;;
    --systemd)
      SYSTEMD=1
      shift
      ;;
    --frontend-build)
      if [[ $# -lt 2 ]]; then
        echo "[ERROR] --frontend-build requires a value." >&2
        exit 2
      fi
      FRONTEND_BUILD="${2:-}"
      shift 2
      ;;
    --frontend-build=*)
      FRONTEND_BUILD="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[ERROR] Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ "$DAEMON" -eq 1 && "$SYSTEMD" -eq 1 ]]; then
  echo "[ERROR] --systemd and --daemon are mutually exclusive." >&2
  exit 2
fi

require_cmd go

if [[ "$SYSTEMD" -eq 1 ]]; then
  require_cmd systemctl
  require_cmd curl
  if [[ ! -r "$BACKEND_DIR/.env" ]]; then
    echo "[ERROR] Missing or unreadable backend environment file: $BACKEND_DIR/.env" >&2
    exit 1
  fi
fi

case "$FRONTEND_BUILD" in
  skip)
    echo "[INFO] Skipping frontend build."
    ;;
  build|build-only)
    require_cmd pnpm
    echo "[INFO] Building frontend (pnpm ${FRONTEND_BUILD})..."
    cd "$FRONTEND_DIR"
    pnpm install --frozen-lockfile
    pnpm "$FRONTEND_BUILD"
    ;;
  *)
    echo "[ERROR] Invalid --frontend-build value: ${FRONTEND_BUILD}" >&2
    echo "[ERROR] Allowed values: build | build-only | skip" >&2
    exit 2
    ;;
esac

build_backend_binary() {
  local tmp_bin="${BACKEND_BIN}.tmp.$$"

  mkdir -p "$(dirname "$BACKEND_BIN")"
  echo "[INFO] Building backend binary: $BACKEND_BIN"
  cd "$BACKEND_DIR"
  if ! go build -trimpath -o "$tmp_bin" .; then
    rm -f "$tmp_bin"
    return 1
  fi
  chmod 0755 "$tmp_bin"
  mv -f "$tmp_bin" "$BACKEND_BIN"
}

wait_for_backend() {
  local health_url="${BACKEND_HEALTH_URL:-http://127.0.0.1:8080/healthz}"

  echo "[INFO] Waiting for backend health: $health_url"
  for _ in {1..30}; do
    if curl -fsS --max-time 3 "$health_url" >/dev/null; then
      echo "[INFO] Backend health check passed."
      return 0
    fi
    sleep 1
  done

  echo "[ERROR] Backend did not become healthy within 30 seconds." >&2
  return 1
}

if [[ "$SYSTEMD" -eq 1 ]]; then
  build_backend_binary

  echo "[INFO] Restarting systemd service: $SYSTEMD_SERVICE"
  systemctl restart "$SYSTEMD_SERVICE"
  if ! systemctl is-active --quiet "$SYSTEMD_SERVICE"; then
    systemctl status "$SYSTEMD_SERVICE" --no-pager --full || true
    exit 1
  fi
  if ! wait_for_backend || ! systemctl is-active --quiet "$SYSTEMD_SERVICE"; then
    systemctl status "$SYSTEMD_SERVICE" --no-pager --full || true
    exit 1
  fi
  exit 0
fi

echo "[INFO] Starting backend..."
cd "$BACKEND_DIR"

if [[ "$DAEMON" -eq 1 ]]; then
  stop_existing_backend_if_any

  : > "$LOG_FILE"
  echo "[INFO] Backend logs: $LOG_FILE"
  echo "[INFO] Starting backend in background (nohup)..."

  # shellcheck disable=SC2091
  nohup go run . >>"$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  echo "[INFO] Backend started. pid=$(cat "$PID_FILE")"
else
  echo "[INFO] Backend running in foreground (Ctrl+C to stop)."
  go run .
fi
