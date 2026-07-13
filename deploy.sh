#!/usr/bin/env bash
# One-shot: create a GitHub repo, push, and let Netlify auto-build.
# Requires the GitHub CLI: https://cli.github.com  (macOS: brew install gh)
# Usage:  ./deploy.sh suv-rental-tracker
set -euo pipefail
REPO="${1:-suv-rental-tracker}"

if ! gh auth status >/dev/null 2>&1; then gh auth login; fi
USER="$(gh api user --jq .login)"

git init -q
git add .
git commit -qm "tracker (PWA)" || echo "Nothing new to commit."
git branch -M main

if gh repo view "$USER/$REPO" >/dev/null 2>&1; then
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/$USER/$REPO.git"
  git push -u origin main
else
  gh repo create "$REPO" --public --source=. --remote=origin --push
fi

echo ""
echo "Repo:  https://github.com/$USER/$REPO"
echo "Now connect it in Netlify (or it's already deployed via the MCP)."
