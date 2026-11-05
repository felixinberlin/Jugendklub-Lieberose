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
    # 🔒 Geheimes nie ausliefern: versteckte Dateien (.env, .git …), *.env und den Server-Code in api/
    def send_head(self):
        from urllib.parse import unquote
        parts = [p for p in unquote(self.path.split("?")[0].split("#")[0]).replace("\\", "/").split("/") if p]
        if any(p.startswith(".") or p.endswith(".env") for p in parts) or (parts and parts[0] == "api"):
            self.send_error(404)
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

ThreadingHTTPServer(("0.0.0.0", int(sys.argv[1])), NoCache).serve_forever()
EOF
