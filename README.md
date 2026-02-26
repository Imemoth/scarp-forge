# ⚒ SCRAP FORGE

**Posztapokaliptikus Kovácsműhely Idle Szimulátor**

> *"A romváros szélén te vagy az egyetlen mesterkovács. Mindenki fegyvert akar – te meg csinálod."*

![Version](https://img.shields.io/badge/verzió-v0.1_MVP-orange) ![Platform](https://img.shields.io/badge/platform-HTML5_%2F_PWA-blue) ![Status](https://img.shields.io/badge/státusz-aktív_fejlesztés-green)

---

## 🎮 Mi ez?

A Scrap Forge egy böngészőalapú idle/incremental játék, ahol egy posztapokaliptikus kovácsműhelyt vezetsz. Nyersanyagot gyűjtesz, fémtömböt olvasztasz, fegyvert kovácsolsz – és teljesíted a három rivális frakció megrendeléseit, mielőtt lejár az idő.

A játék ötvözi a klasszikus idle mechanikákat (automatikus termelés, offline progress) valódi menedzsment döntésekkel: bottleneck kezelés, frakció priorizálás, upgrade stratégia.

---

## 🚀 Gyors Start

Nincs telepítés, nincs build step – nyisd meg a fájlt:

```bash
# Klónozd a repót
git clone https://github.com/te/scrap-forge.git
cd scrap-forge

# Nyisd meg közvetlenül böngészőben
open scrap_forge_mvp.html

# Vagy indíts egy lokális szervert (ajánlott PWA-hoz)
npx serve .
```

> Bármely modern böngészőben fut – Chrome, Firefox, Safari, mobilon is.

---

## 🔧 Gameplay

### A Pipeline

```
🔩 Nyersanyag gyűjtés
        ↓
🔥 OLVASZTÓ        →  Fémtömb         (3s alap)
        ↓
⚒  KOVÁCSÁLLVÁNY   →  Alkatrész       (8s alap)
        ↓
⚡ CSISZOLÓ / EDZŐ →  Edzett rész     (14s alap)
        ↓
🔧 ÖSSZESZERELÓ    →  Kész fegyver    (22s alap)
        ↓
🔍 QC ÁLLOMÁS      →  Ellenőrzött     (10s alap)
        ↓
💰 Megrendelés teljesítés → Arany + Reputáció
```

### Frakciók

| Frakció | Profil | Specialitás |
|---|---|---|
| ⚔️ Acélkarmok | Katonai zsoldosok | Ritka fém, fegyver skin |
| 🔑 Kéregmanók | Vándorkereskedők | Extra megrendelés slot |
| 🪓 Vasbosszú | Bosszúszomjas törzs | Reputáció multiplikátor |

Korai játékban csak alap megrendelések (fémtömb, alkatrész) érkeznek. Ahogy nő a reputációd, egyre jobb – és sürgősebb – rendelések jönnek.

### Megrendelés rendszer

- **2 slot** alap, upgrade-del bővíthető 6-ra
- Frakciók **reputáció alapján** adnak ki VIP megrendeléseket
- Teljesítés után az adott frakció **hamarabb** küld újat
- Megrendelések **részlegesen teljesíthetők** – leadhatsz 2-t a szükséges 4-ből

---

## ⭐ Főbb Feature-ök

- **5 állomásos gyártási lánc** valódi bottleneck mechanikával
- **Minőségi rendszer** – Selejt / Standard / Jó / Mestermű, minden craftolt darabra
- **Reputáció alapú megrendelés pool** – a játék fokozatosan bonyolódik
- **Mennyiséges megrendelések** – 1–5 darabos kérések, vizuális progress dots
- **22 fejlesztés** állomásonként csoportosítva (sebesség, feloldás, globális)
- **Canvas animációk** minden állomáshoz – olvadó fém, kalapácsütés, szikrák, fogaskerekek, QC scan
- **Mobile-first UI** – tab navigáció, touch-optimalizált gombok, event delegation

---

## 📁 Projektstruktúra

```
scrap-forge/
├── scrap_forge_mvp.html    # A teljes játék (single-file, no dependencies)
├── scrap_forge_gdd.md      # Game Design Document
├── scrap_forge_roadmap.md  # Fejlesztési ütemterv
├── scrap_forge_todo.md     # Aktuális feladatlista
└── README.md               # Ez a fájl
```

> A jelenlegi MVP egyetlen HTML fájlban él – szándékosan, a gyors iteráció miatt.

---

## 🗺️ Roadmap

| Fázis | Tartalom | Státusz |
|---|---|---|
| **MVP** | Core pipeline, 3 frakció, upgrade rendszer | 🟠 Aktív |
| **Beta v1** | Staff, offline progress, prestige alap, 5 frakció | ⬜ Tervezett |
| **Launch v1.0** | Leaderboard, backend, monetizáció, skin shop | ⬜ Tervezett |
| **v1.1** | Heti eventek, új receptek, 2 extra frakció | ⬜ Tervezett |
| **v2.0** | Kikötő expanzió, guild rendszer, cloud save | ⬜ Tervezett |

Részletes ütemterv: [`scrap_forge_roadmap.md`](scrap_forge_roadmap.md)

---

## 🛠️ Technikai Stack

**Frontend (jelenlegi MVP)**
- Vanilla JS (ES5 kompatibilis, iOS Safari miatt)
- HTML5 Canvas (station animációk)
- CSS3 + CSS Variables (posztapokaliptikus téma, skin rendszer alapja)

**Tervezett Backend (Launch)**
- Node.js + Express
- PostgreSQL (leaderboard, user data)
- Redis (cache)
- JWT auth

**Platform**
- PWA (Service Worker + manifest – Beta v1-ben)
- Google AdMob / AdSense (Launch-ban)

---

## 📄 Dokumentáció

| Fájl | Leírás |
|---|---|
| [`scrap_forge_gdd.md`](scrap_forge_gdd.md) | Teljes Game Design Document (14 szekció) |
| [`scrap_forge_roadmap.md`](scrap_forge_roadmap.md) | Fázisonkénti fejlesztési terv |
| [`scrap_forge_todo.md`](scrap_forge_todo.md) | Aktuális feladatok, backlog, elvégzett dolgok |

---

## 📜 Licenc

Privát projekt – minden jog fenntartva.

---

*Scrap Forge · v0.1 MVP · 2026*
