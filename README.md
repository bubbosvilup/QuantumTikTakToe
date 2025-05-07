# Quantum Tic Tac Toe

🎮 Una reinterpretazione futuristica del classico gioco del tris, con AI, effetti visivi, suoni dinamici e supporto per PvP o sfida contro l'IA. Progettato per essere pubblicato come app Android tramite Capacitor.

---

## 🚀 Funzionalità

- Modalità **Player vs Player** e **Player vs AI** (con 3 livelli di difficoltà)
- Effetti sonori e musica di sottofondo
- Effetti visivi animati (confetti, particelle, elementi fluttuanti)
- Undo, Reset e Modalità Scura
- Scoreboard e indicatori di turno
- 🎯 Compatibile con dispositivi mobili (via Capacitor)
- 🎮 Pubblicabile su **Play Store**

---

## 🛠️ Tecnologie usate

- HTML5 + CSS3 + JavaScript
- Capacitor.js per Android
- Canvas API per effetti speciali
- LocalStorage per impostazioni audio

---

## 📲 Pubblicazione su Android (Capacitor)

1. Installa dipendenze:
   ```bash
   npm install
   Inizializza Capacitor:
   ```

```bash

npx cap init quantum-tic-tac-toe com.example.quantumtic
Sposta i file in www/ e sincronizza:
```

```bash

npx cap copy
npx cap add android
npx cap open android
Esegui su emulatore/dispositivo:
Premi ▶️ in Android Studio.
```

Per generare .aab:
Vai su Build > Build Bundle(s) > Build Bundle

📦 Struttura del progetto

```pgsql

tiktaktoe/
├─ www/
│ ├─ index.html
│ ├─ style.css
│ ├─ script.js
│ └─ sounds/
├─ package.json
├─ capacitor.config.json
├─ android/ (dopo cap add)
└─ README.md

```

# 📌 TODO / Fix futuri

[] Spostare Master Volume, Music Volume e Effects Volume in un menù separato (attualmente sforano il container).

[] Aggiungere una vera Modalità Low Performance per dispositivi lenti:

[] Disattivare animazioni, confetti e floating shapes

[] Possibilità di toggle da UI

[] Aggiungere selettore lingua per en / it nel nuovo menu impostazioni

[] Rendere la UI adattiva per tutti i formati schermo (overflow visivo su dispositivi piccoli)

[] Possibilità di salvare i punteggi anche tra sessioni

# # 🧠 Crediti

Sviluppato con 💻 da Nicco
Effetti sonori e musica: royalty-free, local audio

# 🧪 Note Dev

Durante lo sviluppo:

Usa npx cap copy dopo ogni modifica

Testa su telefono reale per performance reali

Usa console.log() per il debugging base su Android Studio Logcat

### 📬 Licenza

```bash
MIT — Sentiti libero di forkare, migliorare e usare dove vuoi.
```

---
