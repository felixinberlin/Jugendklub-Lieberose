#!/usr/bin/env bash
# Jugendklub Lieberose – 1-Click Vibecoding Deployment Script
# Usage: ./deploy.sh "Kids suggested adding pizza speedboost"

set -e

MSG="${1:-Update game during workshop}"

echo "🚀 Staging changes..."
git add .

echo "📝 Committing: $MSG"
git commit -m "$MSG" || echo "No changes to commit"

echo "☁️ Pushing to GitHub (origin main)..."
# HEAD:main – klappt auch, wenn gerade ein anderer Branch ausgecheckt ist.
git push origin HEAD:main

echo "✅ Fertig! Vercel baut jetzt automatisch in ~15 Sekunden."
echo "👉 Sag den Kindern: '3... 2... 1... Handy aktualisieren!'"
