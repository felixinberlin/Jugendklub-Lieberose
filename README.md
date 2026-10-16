# 🏰 Jugendklub Lieberose – Das Spiel

**🌐 Live im Web:** [https://jugendklub.vercel.app/](https://jugendklub.vercel.app/)

![QR Code](qr-code.png)

Ein mobiles HTML5-Webspiel (**Kobold, Mais, Katze, Maus, Goblin & Musiala**), das gemeinsam mit den Kindern im **Jugendklub Lieberose** live auf der Bühne per „Vibecoding“ entwickelt wird – ohne Login, ohne Installation, ohne Datensammeln!

## 📱 Auf dem Smartphone oder Laptop spielen
1. [jugendklub.vercel.app](https://jugendklub.vercel.app/) öffnen oder den QR-Code scannen (läuft direkt in jedem Browser).
2. Figur für die **5 Solo-Level** wählen, im **⚔️ Team-Modus** (8 Level) antreten oder **👥 Alle zusammen** an einem Bildschirm spielen.
3. **👆 Antippen** = werfen · **↔️ Ziehen** = ausweichen · **⚡ Spezialkraft** nach 20 Treffern auslösen · **☁️ Wolke / ☀️ Sonne** antippen = Regen & Tag/Nacht wechseln!

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
