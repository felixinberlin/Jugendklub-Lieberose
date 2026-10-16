// 😈 Grusel-Skins: Dunkle, leuchtende Monster-Versionen statt Kinder-Emojis!
// Jede Figur wird einmal in ein Mini-Bild (getSprite) gezeichnet → 60 FPS!

function drawScaryEyes(g, y, spread, color, glow) {
    g.save();
    g.shadowColor = glow || color;
    g.shadowBlur = 10;
    g.fillStyle = color;
    // Linkes böses Auge (schräg)
    g.beginPath();
    g.moveTo(-spread - 7, y - 4);
    g.lineTo(-spread + 5, y - 1);
    g.lineTo(-spread - 4, y + 4);
    g.closePath();
    g.fill();
    // Rechtes böses Auge (schräg)
    g.beginPath();
    g.moveTo(spread + 7, y - 4);
    g.lineTo(spread - 5, y - 1);
    g.lineTo(spread + 4, y + 4);
    g.closePath();
    g.fill();
    // Helle Pupille
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(-spread - 1, y, 1.7, 0, Math.PI * 2);
    g.arc(spread + 1, y, 1.7, 0, Math.PI * 2);
    g.fill();
    g.restore();
}

function drawScaryFangs(g, y, width, color) {
    g.save();
    g.strokeStyle = '#090d16';
    g.lineWidth = 2.5;
    g.fillStyle = '#090d16';
    g.beginPath();
    g.arc(0, y - 2, width, 0.15 * Math.PI, 0.85 * Math.PI);
    g.fill();
    // Reißzähne
    g.fillStyle = color || '#f8fafc';
    const teeth = [-width * 0.65, -width * 0.25, width * 0.25, width * 0.65];
    for (let i = 0; i < teeth.length; i++) {
        const tx = teeth[i];
        const tall = (i === 0 || i === teeth.length - 1) ? 9 : 6;
        g.beginPath();
        g.moveTo(tx - 3.5, y + 1);
        g.lineTo(tx, y + tall);
        g.lineTo(tx + 3.5, y + 1);
        g.closePath();
        g.fill();
    }
    g.restore();
}

function drawHorns(g, topY, spread, height, color, rimColor) {
    g.save();
    g.fillStyle = color;
    g.strokeStyle = rimColor || '#000';
    g.lineWidth = 2;
    for (const dir of [-1, 1]) {
        g.beginPath();
        g.moveTo(dir * spread, topY + 6);
        g.quadraticCurveTo(dir * (spread + 14), topY - height * 0.4, dir * (spread + 6), topY - height);
        g.quadraticCurveTo(dir * (spread - 2), topY - height * 0.35, dir * (spread - 7), topY + 8);
        g.closePath();
        g.fill();
        g.stroke();
    }
    g.restore();
}

function paintScaryMonster(g, kind) {
    // Dunkle Schatten-Aura hinter jeder Figur
    const auraColors = {
        kobold: 'rgba(16, 185, 129, 0.38)',
        corn: 'rgba(234, 179, 8, 0.38)',
        katze: 'rgba(168, 85, 247, 0.42)',
        maus: 'rgba(239, 68, 68, 0.38)',
        goblin: 'rgba(220, 38, 38, 0.45)',
        drache: 'rgba(249, 115, 22, 0.45)',
        zeus: 'rgba(56, 189, 248, 0.52)'
    };
    const grad = g.createRadialGradient(0, 0, 8, 0, 0, 44);
    grad.addColorStop(0, auraColors[kind] || 'rgba(255,0,0,0.35)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(0, 0, 44, 0, Math.PI * 2);
    g.fill();

    if (kind === 'kobold') {
        // Dunkler Schatten-Kobold mit gezackten Ohren, Narbe & Gift-Augen
        drawHorns(g, -22, 14, 15, '#064e3b', '#10b981');
        // Spitze Ohren
        g.fillStyle = '#065f46';
        g.strokeStyle = '#022c22';
        g.lineWidth = 2.5;
        for (const dir of [-1, 1]) {
            g.beginPath();
            g.moveTo(dir * 20, -6);
            g.lineTo(dir * 38, -16);
            g.lineTo(dir * 24, 8);
            g.closePath();
            g.fill();
            g.stroke();
        }
        // Kopf
        g.fillStyle = '#047857';
        g.beginPath();
        g.arc(0, 0, 24, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        // Kapuze
        g.fillStyle = '#111827';
        g.beginPath();
        g.arc(0, -4, 25, Math.PI * 1.08, Math.PI * 1.92);
        g.lineTo(0, -14);
        g.closePath();
        g.fill();
        drawScaryEyes(g, -3, 9, '#a3e635', '#4ade80');
        drawScaryFangs(g, 9, 13, '#d9f99d');
    } else if (kind === 'corn') {
        // Verfluchter Horror-Maiskolben mit dunklen Blättern & glühenden Augen
        g.fillStyle = '#14532d';
        g.strokeStyle = '#052e16';
        g.lineWidth = 2.5;
        for (const dir of [-1, 1]) {
            g.beginPath();
            g.moveTo(dir * 8, 26);
            g.quadraticCurveTo(dir * 34, 4, dir * 24, -22);
            g.quadraticCurveTo(dir * 14, 6, dir * 4, 24);
            g.closePath();
            g.fill();
            g.stroke();
        }
        // Dunkelgoldener Kolben mit Rissen
        g.fillStyle = '#854d0e';
        g.strokeStyle = '#422006';
        g.beginPath();
        g.ellipse(0, -2, 18, 27, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        // Glühende Maiskörner-Punkte
        g.fillStyle = '#eab308';
        for (let py = -18; py <= 14; py += 8) {
            for (let px = -10; px <= 10; px += 10) {
                g.beginPath();
                g.arc(px, py, 2.5, 0, Math.PI * 2);
                g.fill();
            }
        }
        drawScaryEyes(g, -6, 7, '#ef4444', '#f97316');
        drawScaryFangs(g, 8, 11, '#fef08a');
    } else if (kind === 'katze') {
        // Schatten-Panther mit lila/roten Schlitzaugen & scharfen Krallen-Ohren
        g.fillStyle = '#090d16';
        g.strokeStyle = '#7e22ce';
        g.lineWidth = 2.5;
        // Spitze Katzenohren
        for (const dir of [-1, 1]) {
            g.beginPath();
            g.moveTo(dir * 18, -12);
            g.lineTo(dir * 24, -32);
            g.lineTo(dir * 5, -20);
            g.closePath();
            g.fill();
            g.stroke();
        }
        // Kopf
        g.beginPath();
        g.arc(0, 0, 23, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        // Schnurrhaare wie Klingen
        g.strokeStyle = '#c084fc';
        g.lineWidth = 1.6;
        for (const dir of [-1, 1]) {
            for (const dy of [-2, 3]) {
                g.beginPath();
                g.moveTo(dir * 14, dy);
                g.lineTo(dir * 32, dy - 2);
                g.stroke();
            }
        }
        drawScaryEyes(g, -4, 8, '#f43f5e', '#e11d48');
        drawScaryFangs(g, 8, 11, '#ffffff');
    } else if (kind === 'maus') {
        // Seuchen-Ratte mit Narbe, zerfetzten Ohren & giftroten Augen
        g.fillStyle = '#1f2937';
        g.strokeStyle = '#111827';
        g.lineWidth = 2.5;
        for (const dir of [-1, 1]) {
            g.beginPath();
            g.arc(dir * 19, -17, 10, 0, Math.PI * 2);
            g.fill();
            g.stroke();
            g.fillStyle = '#7f1d1d';
            g.beginPath();
            g.arc(dir * 19, -17, 5.5, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#1f2937';
        }
        // Kopf
        g.beginPath();
        g.arc(0, 1, 21, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        // Rote Narbe quer übers Gesicht
        g.strokeStyle = '#ef4444';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(-10, -14);
        g.lineTo(6, 4);
        g.stroke();
        drawScaryEyes(g, -3, 8, '#ef4444', '#dc2626');
        drawScaryFangs(g, 9, 10, '#fef08a');
    } else if (kind === 'goblin') {
        // Dämonen-Goblin mit schwarzen Riesenhörnern, Kriegsbemalung & Feueraugen
        drawHorns(g, -18, 15, 20, '#18181b', '#ef4444');
        g.fillStyle = '#7f1d1d';
        g.strokeStyle = '#450a0a';
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(0, 0, 24, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        // Schwarze Kriegsbemalung
        g.strokeStyle = '#090d16';
        g.lineWidth = 3.5;
        g.beginPath();
        g.moveTo(-16, -10);
        g.lineTo(-4, 2);
        g.moveTo(16, -10);
        g.lineTo(4, 2);
        g.stroke();
        drawScaryEyes(g, -3, 9, '#facc15', '#ef4444');
        drawScaryFangs(g, 9, 13, '#ffffff');
    } else if (kind === 'drache') {
        // Schatten-Drache mit Panzer-Schuppen, Fledermausflügeln & glühendem Maul
        g.fillStyle = '#431407';
        g.strokeStyle = '#ea580c';
        g.lineWidth = 2;
        // Gezackte Drachenflügel links/rechts
        for (const dir of [-1, 1]) {
            g.beginPath();
            g.moveTo(dir * 16, -4);
            g.lineTo(dir * 40, -20);
            g.lineTo(dir * 34, 4);
            g.lineTo(dir * 42, 14);
            g.lineTo(dir * 18, 12);
            g.closePath();
            g.fill();
            g.stroke();
        }
        drawHorns(g, -20, 13, 18, '#f97316', '#7c2d12');
        // Gepanzerter Drachenkopf
        g.fillStyle = '#1c1917';
        g.strokeStyle = '#f97316';
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(0, 0, 23, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        drawScaryEyes(g, -4, 9, '#fb923c', '#ea580c');
        drawScaryFangs(g, 9, 13, '#fed7aa');
    } else if (kind === 'zeus') {
        // Donnergott ZEUS: Dunkle Gewitterwolken-Rüstung, Blitz-Krone & weiß-blaue Blitzaugen
        // Gezackte Blitz-Krone
        g.fillStyle = '#facc15';
        g.strokeStyle = '#ca8a04';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(-18, -14);
        g.lineTo(-22, -32);
        g.lineTo(-9, -20);
        g.lineTo(0, -36);
        g.lineTo(9, -20);
        g.lineTo(22, -32);
        g.lineTo(18, -14);
        g.closePath();
        g.fill();
        g.stroke();
        // Dunkler Sturmkopf
        g.fillStyle = '#0f172a';
        g.strokeStyle = '#38bdf8';
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(0, 0, 24, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        // Zackiger Gewitter-Bart
        g.fillStyle = '#e2e8f0';
        g.strokeStyle = '#38bdf8';
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(-20, 4);
        g.lineTo(-14, 24);
        g.lineTo(-6, 17);
        g.lineTo(0, 29);
        g.lineTo(6, 17);
        g.lineTo(14, 24);
        g.lineTo(20, 4);
        g.closePath();
        g.fill();
        g.stroke();
        drawScaryEyes(g, -4, 9, '#38bdf8', '#e0f2fe');
    }
}

function drawScarySkin(kind, size, now) {
    const box = 96;
    const sprite = getSprite(`scary:${kind}`, box, box, (g) => {
        g.translate(box / 2, box / 2);
        paintScaryMonster(g, kind);
    });
    const pulse = 1 + Math.sin((now || 0) * 0.008) * 0.03;
    const drawSize = size * 1.32 * pulse;
    ctx.drawImage(sprite.canvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
}
