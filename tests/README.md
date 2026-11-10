# Waffen prüfen

`node tests/geschosse.cjs` benötigt nur Node und die vorhandene `matter.min.js`.
Prüft alle Figuren mit drei Ladestufen, Zielbindung und freiem Zielen bei wechselnden
Bildraten. Außerdem: Waffenfolge, Cooldown, Explosionen, Freundschutz, Zeit-Schaden,
Erneuern von Effekten, Pause und bisherige Spezial-Bögen.

`node tests/waffen-browser.cjs` prüft beide Zielmodi mit echten Maus- und Touch-
Ereignissen sowie echte Physiktreffer aller Figuren in drei Bildschirmgrößen.
Dafür wird ein vorhandenes Playwright benötigt. Bei externer Installation lassen
sich `PLAYWRIGHT_MODULE` (Modulpfad) und `CHROMIUM_PATH` (Browserpfad) angeben.
Der Test öffnet `index.html` direkt; Bildschirmbilder landen im temporären Ordner.

Im Browser zusätzlich `index.html` direkt öffnen: Handy hoch/quer und Laptop.
Zielmodus per Knopf oder Q wechseln. Maus bewegen oder auf dem Handy den Schießknopf
ziehen; gedrückt halten lädt auf, Loslassen wirft. Tab wechselt gebundene Ziele.
Prüfen: Der zweite Finger übernimmt keinen laufenden Schuss; Pause, Neustart, Team-Wechsel, Figuren im Flugweg,
Wände, Fledermaus-Waffenfolge, Spezialkräfte und Ton nach erstem Tippen.
