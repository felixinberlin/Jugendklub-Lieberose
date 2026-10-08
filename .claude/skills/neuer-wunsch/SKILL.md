---
name: neuer-wunsch
description: Setzt einen Kinder-Wunsch live im Spiel um (z. B. "Mais soll Bombe werfen", "neues Item", "anderer Sound"): Rezept wählen, game.js ändern, testen, deployen. Aufruf: /neuer-wunsch <Wunsch>
---

# /neuer-wunsch – Kinder-Wunsch live umsetzen

Wunsch: `$ARGUMENTS`

Ziel: **in ~2 Minuten** vom Satz des Kindes bis zum Deploy. Nicht lange überlegen, kleinste sinnvolle Änderung machen.

## 1. Verstehen (max. 10 Sekunden)
- Ist der Wunsch unklar, **selbst eine lustige Standard-Entscheidung treffen** und in einem Satz auf Deutsch ansagen („Die Bombe räumt Gefahren weg, okay?“). Nur bei Konflikt mit den harten Regeln (AGENTS.md §2: kein Build, kein Backend, keine Daten, nur Deutsch) nachfragen.
- Nur Werte ändern (Emoji, Schwerkraft, Tempo, Größe)? → Es reicht ein Edit in `GAME_CONFIG` (Zeile 7 in `game.js`). Weiter bei Schritt 3.

## 2. Rezept wählen
Lies in `AGENTS.md` die Abschnitte **8b (Code-Map)** und **8c (Rezepte)** – nicht die ganze Datei. Zeilennummern sind ungefähr: mit `grep -n "function name" game.js` prüfen.
- Neues Item / Gefahr → Eintrag in `goodItems` / `badItems`.
- Neuer Sound → `else if` in `playSound()`.
- Neue Geste → Eingabe-Block, `registerTap()` als Vorbild.
- Figur wirft/schießt etwas → `throwBomb()` / `explodeBomb()` kopieren.
- Neue Figur am Rand → wie `cornBody`, in `resizeCanvas()` mitführen.

Neue Werte, die Kinder live ändern sollen, immer in `GAME_CONFIG` ablegen.

## 3. Ändern
- Nur `game.js`, `index.html`, `style.css` bzw. den Toy-Ordner anfassen. Alle sichtbaren Texte **auf Deutsch**.
- Audio: kurz (< 300 ms), `gain ≤ 0.3`, nur synthetisch.
- Tap-Flächen ≥ 44×44 px. Kein Build, keine Frameworks, keine CDNs.
- Neue Bodies immer in `fallingBodies` aufnehmen, damit sie entfernt werden (`Composite.remove`).

## 4. Prüfen
1. `node -c game.js` – muss ohne Fehler durchlaufen.
2. Lokal testen: `./serve.sh 8123 &` und mit Playwright im Handy-Viewport (390×760) öffnen. Mit `browser_evaluate` die neue Funktion direkt auslösen (Globals wie `fallingBodies`, `isPlaying` sind erreichbar). Test **direkt nach dem Spielstart** machen – nach Game Over laufen keine Kollisionen. Konsole prüfen (nur das `favicon.ico`-404 ist bekannt/harmlos). Danach den Server wieder beenden.
3. Screenshot ansehen, wenn etwas Sichtbares dazukommt.

## 5. Deployen
- `./deploy.sh "<kurze Beschreibung, was das Kind wollte>"` (macht `git add .`, commit, push → Vercel in ~15 s).
- Vorher mit `git status` sicherstellen, dass keine Testdateien dabei sind (`.playwright-mcp/` ist in `.gitignore`).
- Der Commit soll mit der Co-Authored-By-Zeile aus der Session-Attribution enden; falls `deploy.sh` sie nicht setzt, stattdessen `git add -A && git commit` + `git push origin main` von Hand.

## 6. Ansagen
Dem Presenter in 2–3 Sätzen sagen, was jetzt passiert (auf Deutsch, kindgerecht), und:

> **„3... 2... 1... Handy aktualisieren!“** (nach ~10–15 Sekunden, solange Vercel baut)

Wenn etwas nicht klappt: nicht deployen, kurz sagen was los ist, nächstkleinere Variante anbieten.

## 7. Lernen (nur wenn es etwas Neues war)
Gab es einen nicht offensichtlichen Bug oder ein neues Muster? Dann **eine** Zeile in `AGENTS.md` unter „Lessons Learned“ ergänzen und bei neuen Funktionen die Code-Map (8b) / Rezepte (8c) anpassen. Beim nächsten Deploy mitcommitten.
