#!/usr/bin/env bash
# Jugendklub Lieberose – lokale Vorschau (ohne Cache, kein Build-Schritt)
# Usage: ./serve.sh [port]     -> http://localhost:8000

PORT="${1:-8000}"
cd "$(dirname "$0")"

echo "🎮 Lokale Vorschau: http://localhost:$PORT"
echo "📱 Handy-Ansicht: F12 → Geräte-Symbol im Browser"
echo "⏹  Beenden mit Strg+C"

python3 - "$PORT" <<'EOF'
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

ThreadingHTTPServer(("0.0.0.0", int(sys.argv[1])), NoCache).serve_forever()
EOF
