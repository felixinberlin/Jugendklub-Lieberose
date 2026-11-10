# ⚖️ THE FIGHTZONE — Helden-Balancing & Werte-Matrix

> **Jugendklub Lieberose · Stand: Spielversion 2.65**  
> Diese Dokumentation analysiert alle **10 spielbaren Helden** mit mathematisch fundierten Werten:  
> **Schaden pro Sekunde (DPS)**, **Zeit bis zum K.o. (TTK)**, **Treff-Schwierigkeit & Hitbox-Größe**, **Defensiv-Nutzen** und **Game-Changer Spezialkräfte**.  
> Ziel ist kein langweiliger Einheitsbrei, sondern **asymmetrisches Balancing**: Jede Figur fühlt sich komplett anders an und hat klare Stärken, Schwächen und Konter!

---

## 📊 1. Die Große Helden-Vergleichstabelle

*Berechnungsgrundlage: 100 HP Basis-Leben (Pokal-Modus), Treffer mit Hauptwaffe ohne Miss.*

| Held | Symbol & Waffe | HP ❤️ | Tempo 🏃 | Hitbox 🎯 | Waffenschaden ⚔️ | Cooldown ⏱️ | Basis DPS 💥 | Zeit bis K.o. (TTK) ⏳ | Spezialkraft ⚡ (15 Treffer) | Defensiv-Wert 🛡️ | Spielstil / Rolle |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: | :--- |
| **Musiala** | ⚽ Fußball | 100 | 1.0 *(+2.2)* | 66 px | 3 | 1.2 s | **2.50** | 39.6 s | **Großer Ball** (10 Dmg, lenkbar) | 6.5 / 10 | Dribbler & Spielmacher |
| **Kobold** | 💣 Bombe | 120 | 1.0 | 70 px | 4 *(AoE)* | 1.0 s | **4.00** | 24.0 s | **Mini-Kobolde** (3 Schilde für 5s) | 9.5 / 10 | Belagerungs-Tank |
| **Mais** | 🍿 Popcorn | 100 | 1.2 | 74 px *(groß)* | 1.5 *(AoE)* | 0.5 s ⚡ | **3.00** | 33.0 s | **Popcorn-Salve** (5 × 4 = 20 Dmg) | 4.0 / 10 | Rapid-Fire Schütze |
| **Maus** | 🪓 Lanze | 105 | 1.5 ⚡ | 60 px *(winzig!)*| 2 | 0.9 s | **2.22** | 44.1 s | **Verstecken** (6s 100% unverwundbar) | 9.5 / 10 | Schatten-Ninja |
| **Katze** | 🏏 Keule | 110 | 1.2 | 70 px | 5 | 1.5 s | **3.33** | 28.5 s | **Wirbelsturm** (5 Dmg + 4s Stun) | 8.0 / 10 | Heavy Bruiser & Stunner |
| **Goblin** | 🔱 Dreizack | 100 | 1.4 | 68 px | 4 | 1.4 s | **2.86** | 33.6 s | **Feuer-Dreizack** (10 Dmg + 6 Brand) | 5.0 / 10 | Pyro-Skirmisher |
| **Zeus** | ⚡ Blitz | 130 | 1.5 | 74 px *(groß)* | 2.5 *(Laser)* | 2.3 s | **1.09** | 89.7 s | **Blitzregen** (bis zu 55 AoE Dmg) | 9.0 / 10 | Götter-Scharfschütze |
| **Yamal** | ⚽ Fußball | 105 | 1.3 *(+2.35)*| 65 px | 3 | 1.4 s | **2.14** | 46.2 s | **Stern-Explosion** (12 Dmg) | 6.5 / 10 | Turbo-Flankierer |
| **Fledermaus**| 🗡️ Speer / ⛓️ Morgenstern | 100 | 1.4 | 68 px | 1.7 *(Schnitt)* | 1.2 s | **1.42** | 69.6 s | **Blutsaugen** (15 Dmg + 15 Heal ❤️) | 8.5 / 10 | Vampir-Duellantin |
| **Drache** | 🔥 Feuerball | 130 | 0.85 | 74 px *(groß)* | 5 *(3+2 Brand)*| 1.6 s | **3.13** | 30.4 s | **Drachenbiss** (14 Dmg + 1.5s Stun) | 8.5 / 10 | Urzeit-Koloss / Boss |

---

## 🎯 2. Die Hitbox-Mathematik: Warum kleine Ziele viel zäher sind!

Die Treff-Fläche eines Charakters skaliert quadratisch mit dem Radius ($A = \pi \cdot r^2$):
- **Maus (Durchmesser 60 px)**: Fläche $\approx 2.827\text{ px}^2$
- **Yamal (Durchmesser 65 px)**: Fläche $\approx 3.318\text{ px}^2$ (+17 % größer)
- **Musiala (Durchmesser 66 px)**: Fläche $\approx 3.421\text{ px}^2$ (+21 % größer)
- **Kobold / Katze (Durchmesser 70 px)**: Fläche $\approx 3.848\text{ px}^2$ (+36 % größer)
- **Mais / Zeus / Drache (Durchmesser 74 px)**: Fläche $\approx 4.301\text{ px}^2$ (**+52 % größer!**)

> **💡 Erkenntnis für das Balancing**:  
> Ein Drache oder Mais bietet dem Gegner über **52 % mehr Zielfläche** als die Maus. Gepaart mit dem hohen Lauftempo der Maus (1.5) verfehlen langsame Geschosse wie Kobold-Bomben oder Katze-Keulen die Maus in der Praxis viel häufiger.  
> **Effektives Leben (EHP)**: Obwohl die Maus nur 105 HP hat, verhält sie sich durch Ausweichen und geringere Zielfläche wie ein Charakter mit über **150 EHP**!

---

## ⚡ 3. Spezialkräfte als Ausgleich: Wie Comebacks das Spiel drehen

Spezialkräfte sind nicht nur Beiwerk – sie sind der **große Gleichmacher** (Equalizer):

1. **Der Mais-Farm-Vorteil**:  
   Spezialkräfte laden nach **15 Treffern** auf. Mais hat einen Cooldown von nur **0.5 Sekunden** (2 Schüsse/s). Er lädt seine 20-Schaden-Popcorn-Salve in nur **7,5 Sekunden** Dauerfeuer auf – dreimal so schnell wie Zeus! Damit gleicht Mais seine niedrige Einzelwaffen-Stärke sofort aus.
2. **Die Maus-Immunität (6s Schutz)**:  
   Wenn mächtige Angriffe (wie Zeus-Gewitter oder Drachenbiss) drohen, taucht die Maus für 6 Sekunden ins Mauseloch ab. Schaden = 0. So kann sie selbst die stärksten Angriffe aussitzen.
3. **Der Fledermaus-Lebensraub (+15 HP)**:  
   15 Schaden austeilen und gleichzeitig 15 Leben heilen ergibt einen **30-HP-Schwung**. Selbst wenn die Fledermaus fast besiegt ist (z. B. auf 10 HP), springt sie mit einem Schlag wieder auf 25 HP hoch, während der Feind 15 HP verliert.
4. **Kobolds Mini-Kobolde (100 % Projektil-Schild)**:  
   3 umkreisende Kobolde fangen 5 Sekunden lang sämtliche ankommenden Geschosse physisch ab. Feindliche Angriffe verpuffen wirkungslos.
5. **Katzensprung mit 4 Sekunden Betäubung**:  
   Selbst ein übermächtiger Gegner mit vollem Leben wird für 4 Sekunden lahmgelegt – genug Zeit, um den Spieß umzudrehen.

---

## 🧮 4. Formeln & Kennzahlen

- **DPS (Damage per Second)**: $\text{DPS} = \text{Schaden pro Wurf} \times \frac{1}{\text{Cooldown (Sekunden)}}$
- **STK (Shots to Kill)** gegen 100 HP: $\text{STK} = \lceil 100 / \text{Schaden} \rceil$
- **TTK (Time to Kill)**: $\text{TTK} = (\text{STK} - 1) \times \text{Cooldown}$ (erster Treffer trifft sofort bei $t=0$)
- **Hitbox-Faktor**: $\frac{\text{Fläche Held}}{\text{Fläche Maus}} = \left(\frac{\text{Größe}}{60}\right)^2$

---

## 🔍 5. Charakter-Archetypen & Spielstile

1. **Belagerungs-Tanks (Kobold, Drache)**: Hohe HP (120–130), Flächenschaden, fangen viel ab, teilen hart aus.
2. **Rapid-Fire Gatling (Mais)**: 0.5s Cooldown, pausenloser Druck, farmt Spezialkräfte in Rekordzeit.
3. **Schatten-Flitzer (Maus, Yamal)**: Winzige Hitbox, rasendes Tempo (1.5 / 2.35 Dribbling), entzieht sich Kämpfen nach Belieben.
4. **Präzisions-Sniper (Zeus, Musiala)**: Geschosse mit Höchstgeschwindigkeit (Tempo 20 Laser bzw. lenkbarer Riesenball).
5. **Duellanten & Zermürber (Katze, Fledermaus, Goblin)**: Stun-Lock, Vampir-Heilung oder 16-Schaden-Brand-Burst drehen 1v1-Kämpfe um.
