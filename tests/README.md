# Waffen prüfen

`node tests/geschosse.cjs` benötigt nur Node und die vorhandene `matter.min.js`.
Prüft alle Figuren mit drei Ladestufen, Zielbindung und freiem Zielen bei wechselnden
Bildraten. Außerdem: Waffenfolge, Cooldown, Explosionen, Freundschutz, Zeit-Schaden,
Erneuern von Effekten, angehaltene interne Zeit-Schaden-Uhr und bisherige Spezial-Bögen.

`node tests/waffen-browser.cjs` prüft beide Zielmodi mit echten Maus- und Touch-
Ereignissen sowie echte Physiktreffer aller Figuren in drei Bildschirmgrößen.
Dafür wird ein vorhandenes Playwright benötigt. Bei externer Installation lassen
sich `PLAYWRIGHT_MODULE` (Modulpfad) und `CHROMIUM_PATH` (Browserpfad) angeben.
Auch `node tests/rewards-browser.cjs` nutzt diese beiden Umgebungsvariablen. Er prüft Siege/Niederlagen beider Modi, exakt 200 Münzen und nur normale Pokale, einmalige Auszahlung, Speicherung, feste Leben, entfernte Pause/Team-Auswahl und kreuzende Waffen.

Der Test öffnet `index.html` direkt; Bildschirmbilder landen im temporären Ordner.

`node tests/profile-stats-browser.cjs` prüft die getrennten Profil-/Einstellungsmenüs, sichere Namensänderung und Speicherung, echte Treffer, Wurfpausen, Lauftempo sowie Karten und Drucktabelle aller zehn Figuren. Nutzt ebenfalls `PLAYWRIGHT_MODULE` und `CHROMIUM_PATH`; blockiert alle Online-Anfragen.

Im Browser zusätzlich `index.html` direkt öffnen: Handy hoch/quer und Laptop.
Zielmodus per Knopf oder Q wechseln. Maus bewegen oder auf dem Handy den Schießknopf
ziehen; gedrückt halten lädt auf, Loslassen wirft. Tab wechselt gebundene Ziele.
Prüfen: Der zweite Finger übernimmt keinen laufenden Schuss; Neustart, feste Leben, fehlende Pause, Figuren im Flugweg,
Wände, Fledermaus-Waffenfolge, Spezialkräfte und Ton nach erstem Tippen.
