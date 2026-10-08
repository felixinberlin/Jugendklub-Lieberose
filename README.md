# 🚀 Jugendklub Lieberose – Das Spiel

**🌐 Live im Web:** [https://jugendklub.vercel.app/](https://jugendklub.vercel.app/)

![QR Code](qr-code.png)

Ein mobiles HTML5-Webspiel, das gemeinsam mit den Kindern im **Jugendklub Lieberose** live per "Vibecoding" entwickelt wird!

## 📱 Auf dem Smartphone spielen
1. Projekt in **Vercel** importieren (oder den QR-Code scannen).
2. Auf dem Handy öffnen (keine Installation nötig, läuft direkt in Safari & Chrome).
3. Mit dem Finger nach links und rechts wischen oder tippen, um auszuweichen und Schätze einzusammeln!

## 🕹️ Live-Vibecoding für den Workshop
Alle Spielwerte können während des Workshops direkt in [`game.js`](game.js) angepasst werden:

```javascript
const GAME_CONFIG = {
  playerEmoji: '🚀',       // Ändere den Spieler live (z.B. 🐉, 🛹, 🐱, ⚽)
  goodItems: [ ... ],      // Sammelobjekte (Pizza, Sterne, Limo, etc.)
  badItems: [ ... ],       // Hindernisse & Gegner (Bomben, Monster, Hausaufgaben)
  baseSpeed: 1.0,          // Geschwindigkeit
};
```

### ⚡ Live-Deployment während der Show
Sobald eine Idee der Kinder eingebaut ist:
```bash
./deploy.sh "Pizza-Powerup hinzugefügt"
```
Vercel aktualisiert das Spiel automatisch innerhalb von ~15 Sekunden. Anschließend einfach auf den Handys die Seite neu laden!

---
Entwickelt mit ❤️ für den Jugendklub Lieberose.
