#!/usr/bin/env bash
# Set all GitHub Actions secrets required by the Learnova CI/CD workflow.
#
# Usage:
#   ./script/set-github-secrets.sh [repo] [server/.env.production] [ci/github-secrets.input.env]
#
# Examples:
#   ./script/set-github-secrets.sh
#   ./script/set-github-secrets.sh Tanvir-Bhuiyan00/Learnova server/.env.production ci/github-secrets.input.env
#
# Secrets set:
#   DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, VPS_HOST, VPS_USER, VPS_APP_DIR,
#   CLIENT_PUBLIC_API_BASE_URL, ACCESS_TOKEN_SECRET, JWT_ACCESS_SECRET,
#   POSTGRES_PASSWORD (derived from server DATABASE_URL), SERVER_ENV_PRODUCTION (full server/.env.production)
set -euo pipefail

REPO="${1:-}"
SERVER_ENV_PATH="${2:-server/.env.production}"
INPUT_SECRETS_PATH="${3:-ci/github-secrets.input.env}"

if ! command -v gh &>/dev/null; then
  echo "Error: GitHub CLI (gh) is required. Install it, then run 'gh auth login'." >&2
  exit 1
fi

read_env() {
  local path="$1" key value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    [[ -z "$line" || "$line" == \#* ]] && continue
    key="${line%%=*}"
    value="${line#*=}"
    value="${value%\"}"; value="${value#\"}"
    printf '%s %s\n' "$key" "$value"
  done <"$path"
}

get_value() {
  local path="$1" name="$2"
  read_env "$path" | awk -v n="$name" '$1==n {$1=""; sub(/^ /,""); print}'
}

url_decode() {
  if command -v python3 &>/dev/null; then
    python3 -c "import urllib.parse,sys; print(urllib.parse.unquote(sys.argv[1]))" "$1"
  else
    printf '%b' "${1//%/\\x}"
  fi
}

set_secret() {
  local name="$1" value="$2"
  if [[ -z "$value" ]]; then
    echo "Skipping empty secret: $name"
    return
  fi
  if [[ -n "$REPO" ]]; then
    gh secret set "$name" --repo "$REPO" --body "$value"
  else
    gh secret set "$name" --body "$value"
  fi
  echo "Set secret: $name"
}

if [[ ! -f "$SERVER_ENV_PATH" ]]; then
  echo "Error: server env file not found: $SERVER_ENV_PATH" >&2
  exit 1
fi
if [[ ! -f "$INPUT_SECRETS_PATH" ]]; then
  echo "Error: input secrets file not found: $INPUT_SECRETS_PATH" >&2
  exit 1
fi

DATABASE_URL="$(get_value "$SERVER_ENV_PATH" DATABASE_URL)"
if [[ -z "$DATABASE_URL" ]]; then
  echo "Error: DATABASE_URL not found in $SERVER_ENV_PATH" >&2
  exit 1
fi

# Extract the password between username and @, URL-decoded.
PASSWORD_RAW="$(printf '%s' "$DATABASE_URL" | sed -E 's#^postgres(ql)?://[^:]+:([^@]+)@.*#\2#')"
POSTGRES_PASSWORD="$(url_decode "$PASSWORD_RAW")"
if [[ "$POSTGRES_PASSWORD" == "$DATABASE_URL" ]]; then
  echo "Error: could not extract Postgres password from DATABASE_URL" >&2
  exit 1
fi

SERVER_ENV_PRODUCTION="$(cat "$SERVER_ENV_PATH")"
INPUT_ACCESS_TOKEN_SECRET="$(get_value "$INPUT_SECRETS_PATH" ACCESS_TOKEN_SECRET)"
INPUT_JWT_ACCESS_SECRET="$(get_value "$INPUT_SECRETS_PATH" JWT_ACCESS_SECRET)"
SERVER_ACCESS_TOKEN_SECRET="$(get_value "$SERVER_ENV_PATH" ACCESS_TOKEN_SECRET)"

set_secret DOCKERHUB_USERNAME "$(get_value "$INPUT_SECRETS_PATH" DOCKERHUB_USERNAME)"
set_secret DOCKERHUB_TOKEN "$(get_value "$INPUT_SECRETS_PATH" DOCKERHUB_TOKEN)"
set_secret VPS_HOST "$(get_value "$INPUT_SECRETS_PATH" VPS_HOST)"
set_secret VPS_USER "$(get_value "$INPUT_SECRETS_PATH" VPS_USER)"
set_secret VPS_APP_DIR "$(get_value "$INPUT_SECRETS_PATH" VPS_APP_DIR)"
set_secret CLIENT_PUBLIC_API_BASE_URL "$(get_value "$INPUT_SECRETS_PATH" CLIENT_PUBLIC_API_BASE_URL)"
set_secret ACCESS_TOKEN_SECRET "${INPUT_ACCESS_TOKEN_SECRET:-$SERVER_ACCESS_TOKEN_SECRET}"
set_secret JWT_ACCESS_SECRET "${INPUT_JWT_ACCESS_SECRET:-$SERVER_ACCESS_TOKEN_SECRET}"
set_secret POSTGRES_PASSWORD "$POSTGRES_PASSWORD"
set_secret SERVER_ENV_PRODUCTION "$SERVER_ENV_PRODUCTION"

echo "Done."