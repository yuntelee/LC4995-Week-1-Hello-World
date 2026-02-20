#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

set_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"

  if grep -q "^${key}=" "$file"; then
    sed -i '' "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

echo "[1/7] Installing dependencies"
npm install

if [[ ! -f .env.local ]]; then
  echo "[2/7] Creating .env.local from .env.local.example"
  cp .env.local.example .env.local
else
  echo "[2/7] .env.local already exists"
fi

echo "[3/7] Setting required Supabase URL"
set_env_var "NEXT_PUBLIC_SUPABASE_URL" "https://qihsgnfjqmkjmoowyfbn.supabase.co" ".env.local"

CURRENT_ANON_KEY="$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d '=' -f2- || true)"
if [[ -z "$CURRENT_ANON_KEY" ]]; then
  read -r -s -p "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: " INPUT_ANON_KEY
  echo
  if [[ -z "$INPUT_ANON_KEY" ]]; then
    echo "Anon key is required. Exiting."
    exit 1
  fi
  set_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$INPUT_ANON_KEY" ".env.local"
fi

echo "[4/7] Running production build"
npm run build

echo "[5/7] Staging changes"
git add .

if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  echo "[6/7] Creating commit"
  git commit -m "Assignment 1 and 2: Next.js Hello World + Supabase list"
fi

read -r -p "Push to origin/main now? (y/N): " PUSH_CHOICE
if [[ "$PUSH_CHOICE" =~ ^[Yy]$ ]]; then
  echo "[7/7] Pushing to GitHub"
  git push origin main
else
  echo "[7/7] Skipped push"
fi

CURRENT_SHA="$(git rev-parse --short HEAD)"

echo
echo "Done. Next manual Vercel steps:"
echo "1) Import/verify project in https://vercel.com/new"
echo "2) In Vercel Project Settings > Environment Variables, set:"
echo "   NEXT_PUBLIC_SUPABASE_URL=https://qihsgnfjqmkjmoowyfbn.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>"
echo "3) Redeploy from Deployments page if needed"
echo "4) Disable Deployment Protection in Settings > Deployment Protection"
echo "5) Commit-specific deployment lookup SHA: ${CURRENT_SHA}"
