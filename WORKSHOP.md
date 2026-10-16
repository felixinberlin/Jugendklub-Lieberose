# 🎮 Spickzettel für die nächste Runde

## Schnell loslegen

1. `git status --short` prüfen, fremde Änderungen erhalten. Vor dem Workshop den aktuellen Stand von GitHub holen; nicht erst beim Live-Deploy merken, dass main weiter ist.
2. `./serve.sh 8123` starten. Die Vorschau unter `http://localhost:8123` und den QR-Code für die echte Spieladresse bereithalten.
3. Ein echtes Handy testen: Ton nach erstem Tippen, Antippen zum Werfen, Ziehen zum Ausweichen, Spezialknopf, Neustart. Auch quer halten.
4. Einen Wunsch nach dem anderen umsetzen. Kurze deutsche Kommentare zum Mitlesen geben, ungefähr alle 20–30 Sekunden.

## Wo kommt der Wunsch hin?

| Wunsch | Einstieg | Dabei beachten |
|---|---|---|
| Andere Wurfsache, Stärke, Tempo | `js/config.js` | Kleine Änderung zuerst; Werte hier bündeln. |
| Neue Spezialkraft | `SPECIALS` in `js/specials.js` | `name`, `icon`, `use(name)`, `desc()`; Knopf und Computer nutzen die Liste. Aktuell eine Kraft pro Figur. Mehrere auswählbare Kräfte brauchen eine Erweiterung. |
| Fliegende Spezialwaffe | `js/special-weapons.js`, normales Vorbild: `launchArc` in `js/bombs.js` | `targetOf`, `everyoneExcept` und `MINI_BIT` nutzen; Schaden über `applyHit`. `special: true` verhindert Aufladen durch die Spezialattacke selbst. |
| Schutz, Verwandlung, Bewegung | `js/special-moves.js` | Effekt aktualisieren; Zustand bei Neustart und K.o. aufräumen. |
| Neuer Knopf oder Erklärung | `js/special-ui.js` | Deutsch, mindestens 44×44 Pixel. Erklärungen lesen echte Werte aus config.js. |
| Einsammelbares Extra | Neue `js/powerups.js` vor `js/game.js` | Noch kein Sammelsystem vorhanden. Eigenes Erzeugen, Zeichnen, Einsammeln und Aufräumen bauen. Kollision vor dem Filter für Nicht-Bomben behandeln. |
| Mehr Runden oder Gegner | `levels` / `teamLevels` in config.js | Bestehende Schwierigkeit als Ausgangspunkt nehmen. |
| Figur steigt auf / neue Fähigkeit freischalten | Neues Konzept, z. B. `js/upgrades.js` | Runden-Level und Figuren-Stufe unterscheiden. Festlegen, was nach Sieg, Niederlage und Neustart bleibt; zunächst nur im Arbeitsspeicher. |

## Erkenntnisse aus der Durchsicht

- Klassische Skripte teilen globale Namen. Syntaxprüfung pro Datei findet doppelte Namen zwischen Dateien nicht: zusätzlich im Browser laden, auch per `file://`.
- Team-Gegner sind Kopien mit `kind`. Immer `kindOf`, `actorCfg`, `actorBtn` nutzen. Kopien haben keinen eigenen HTML-Knopf.
- `startGame(keepCharge)` entfernt Kopien, setzt Kräfte zurück und baut Teams neu. Nur beim Weitergehen bleibt die eigene Ladung erhalten. Neue Effekte müssen in diesen Ablauf passen.
- Spezialkräfte sind jetzt nach Waffen, Bewegung, Steuerung und Anzeige aufgeteilt. Neue Funktionen dort ergänzen, statt die Zentrale wieder wachsen zu lassen.
- Ein neuer Body in `fallingBodies` braucht passende `customData`: `updateBombs` erwartet diese. Ein Sammel-Extra ohne Bomben-Lebensdauer braucht eine eigene Ablaufzeit, damit es nicht ewig herumliegt.
- Die Physik läuft vor den Kraft-Updates. Nach dem K.o. endet die Runde; Prüfungen direkt nach Spielstart durchführen und Computerwürfe bei gezielten Eingabetests ausschalten.
- Prüfung des Codes ersetzt keinen echten Handytest. Safari, kleine Finger und das WLAN vor Ort bleiben ein eigener Check.
- Vorbereitung und interne Pflege bleiben aus den Credits. Nur tatsächlich umgesetzte Kinderwünsche bekommen eine Zeile und eine neue Version.

## Kurzer Prüfablauf pro Wunsch

`for f in js/*.js; do node -c "$f" || break; done` und `git diff --check`.

Dann im Browser: 390×760, 844×390 und 1440×900; Konsole prüfen, neue Funktion direkt auslösen, Team-Kopie mitprüfen, Neustart prüfen. Bei Kräften zusätzlich Aufladen und Weiter ins nächste Level prüfen.

Vor `./deploy.sh "Beschreibung"` den Git-Status ansehen: Das Skript nimmt alle Änderungen auf. Erst nach erfolgreichem Push und kurzer Wartezeit zum Aktualisieren auffordern.

## Ideen für einen entspannten Start

- Zwei Handys bereitlegen: eines bleibt im Spiel, eines lädt Änderungen neu.
- Drei kurze Ideenkarten anbieten, falls niemand anfangen mag: „Schutzschild 🛡️“, „Eiswurf ❄️“, „Turbo-Stern ⭐“. Die Kinder entscheiden, was daraus wird.
- Einen Wunsch bauen, gemeinsam ausprobieren, danach den nächsten nehmen.
- Einen bekannten funktionierenden Git-Stand vor dem Workshop notieren. Bei einem Problem zuerst lokal reparieren und testen.
