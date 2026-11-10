# 🏰 Jugendklub Lieberose – Das Spiel

**🌐 Live im Web:** [https://jugendklub.vercel.app/](https://jugendklub.vercel.app/)

![QR Code](qr-code.png)

**The Fightzone** – ein mobiles HTML5-Webspiel, das gemeinsam mit den Kindern im **Jugendklub Lieberose** live auf der Bühne per „Vibecoding“ entwickelt wird – ohne Login, ohne Installation, ohne Datensammeln!

## 📱 Auf dem Smartphone oder Laptop spielen

**[📖 Spielanleitung: Zielen, Techniken und Tipps](spielanleitung.html)** · **[🖨️ Druckansicht & Werte-Tabelle (A4)](druckansicht.html)** · **[⚖️ Balancing-Matrix & DPS-Analyse](BALANCING.md)** – auch direkt im Spiel erreichbar.

1. [jugendklub.vercel.app](https://jugendklub.vercel.app/) öffnen oder den QR-Code scannen (läuft direkt in jedem Browser).
2. Figur für ein Solo-Match wählen oder im **⚔️ Team-Modus** antreten.
3. **🎯 Zielbindung** zum Einstieg nutzen. Gegner auswählen, Schießknopf halten, loslassen! **Q** oder der Zielmodus-Knopf wechselt zum freien Zielen auf einen Landungsort.

## 📖 Für Kinder & Eltern: So ist das Spiel gebaut
Eine kindgerechte Erklärung aller Dateien mit Schaubildern und Experimenten zum Ausprobieren steht in **[`js/README.md`](js/README.md)**.

Alle Spielwerte lassen sich live während des Workshops in [`js/config.js`](js/config.js) anpassen:

```javascript
const GAME_CONFIG = {
  koboldEmoji: '🧌',      // Figuren & Größen (Kobold, Mais, Katze, Maus, Goblin, Musiala)
  koboldBomb: '💰',       // Eigene Würfe (Goldsack, Maiskörner, Fische, Käse, Feuer, Fußball)
  gravityY: 0.9,          // 0.2 = Mond-Schwerkraft, 2.5 = Riesen-Schwerkraft
  maxHits: 20,            // Wie viele Treffer hält eine Figur aus?
};
```

### ⚡ Live-Deployment während der Show
Sobald eine Idee der Kinder eingebaut ist:
```bash
./deploy.sh "Neuer Kinder-Wunsch eingebaut"
```
Vercel aktualisiert das Spiel automatisch innerhalb von ~15 Sekunden. Anschließend einfach auf den Handys die Seite neu laden!

---
Entwickelt mit ❤️ im Jugendklub Lieberose.
