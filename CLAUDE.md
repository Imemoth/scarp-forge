# Project: Scrap Forge
_Last updated: 2026-02-26_

> Posztapokaliptikus Kovácsműhely Idle Szimulátor – böngészőalapú, single-file HTML5/JS játék.

---

## Meta: Self-Maintenance

Ez a fájl **automatikusan frissítendő** minden jelentős munka után. Claude köteles frissíteni amikor:
- Új fájl / modul jön létre
- Architekturális döntés születik
- Bug pattern kerül felderítésre és javításra
- Új dependency kerül hozzáadásra
- Feature elkészül

Session végén explicit prompt: _"Update CLAUDE.md with everything we did today."_

---

## Current State

**Fázis:** MVP aktív fejlesztés (Fázis 0)
**Státusz:** Core pipeline kész, balance + edge case-ek folyamatban
**Következő:** Megrendelés slot upgrade tesztelés, iOS Safari stabilitás, balance finomhangolás

### Ami működik
- Teljes 5-állomásos gyártási lánc (Olvasztó → Kovácsállvány → Csiszoló → Összeszereló → QC)
- Nyersanyag automatikus gyűjtés (4 típus: scrap, coal, wood, binder)
- Minőségi rendszer (Selejt / Standard / Jó / Mestermű)
- 3 frakció megrendelés rendszer rep-gating-gel (0 / 10 / 25 / 50 rep threshold)
- 22 upgrade, állomásonként csoportosítva
- Részleges megrendelés teljesítés (qty dots vizuális feedback)
- Mobile-first UI, event delegation, tab navigáció
- Canvas animációk mind az 5 állomáshoz

### Ami folyamatban van
- Megrendelés slot upgrade rendszer tesztelése (u_os1–u_os4, 2→6 slot)
- Balance finomhangolás (nyersanyag rátak, station időzítések)
- iOS Safari edge case-ek

### Következő fázis (Beta v1) – még nem kezdett
- Staff rendszer, offline progress, prestige, IndexedDB perzisztencia, PWA

---

## Architecture

### Fájlstruktúra
```
scrap-forge/
├── scrap_forge_mvp.html    # A TELJES JÁTÉK – single-file, zero dependencies
├── scrap_forge_gdd.md      # Game Design Document (14 szekció, teljes spec)
├── scrap_forge_roadmap.md  # Fázisonkénti fejlesztési terv (0–4. fázis)
├── scrap_forge_todo.md     # Aktuális sprint feladatok + backlog
├── README.md               # Projekt összefoglaló, quick start
└── CLAUDE.md               # Ez a fájl
```

### scrap_forge_mvp.html belső struktúra

A fájl egyetlen HTML dokumentum, sorrendben:
1. **CSS** (~440 sor) – CSS Variables-alapú theming, posztapokaliptikus téma, mobile-first
2. **HTML layout** – 3 panel: bal (Resources + Upgrades), közép (Pipeline), jobb (Order Queue)
3. **Global State `G` objektum** (sor ~444) – egyetlen forrás az összes játékállapothoz
4. **ORDER_TEMPLATES tömb** (sor ~506) – megrendelés sablonok, rep-gated pool
5. **Helper függvények** (sor ~532) – `getQuality`, `qualityLabel`, `qualityMult`, `getInvCount`, `consumeInv`, `toast`, `sparks`, `showTab`
6. **Core game logic** – `spawnOrder`, `craftStation`, `fulfillOrder`, `buyUpgrade`
7. **Render függvények** – `renderHeader`, `renderResources`, `renderUpgrades`, `renderPipeline`, `renderOrders`
8. **Update (diff) függvények** – `updateResourceNumbers`, `updateStationProgress`, `updateOrderTimers`, `updateUpgradeButtons` _(ezek futnak tickenként, nem rebuild-elnek DOM-ot)_
9. **Event delegation** – `setupEventDelegation` (sor ~981) – egyetlen listener a `document`-en
10. **Game loop** – `gameTick` (sor ~1003) – 200ms interval, resource növelés + station progress + order timer
11. **Canvas animációk** – `drawSmelter`, `drawAnvil`, `drawGrinder`, `drawAssembly`, `drawQC`, `tickAnims`
12. **`init()`** (sor ~1419) – játék inicializálás, event delegation setup, első render

### Adatfolyam

```
gameTick() [200ms]
  → resources növelés (baseRate × multipliers)
  → station progress update (progressMax csökkentés)
  → station completion → inventory update → needFullRender flag
  → order timer countdown → lejárat → reputation penalty
  → needFullRender ? renderAll() : updateAll()
```

### Global State `G` kulcs mezők
| Mező | Típus | Leírás |
|---|---|---|
| `G.gold` | number | Játékos aranykészlete |
| `G.reputation` | number | Globális hírnév (megrendelés pool gating) |
| `G.resources` | object | 4 nyersanyag, mindegyiknek `val`, `max`, `quality`, `baseRate` |
| `G.stations[]` | array | 5 station objektum, `active`, `progress`, `progressMax`, `inputReq`, `outputItem` |
| `G.inventory` | object | `{ingot, part, hardened, product}` – közbülső termékek |
| `G.orders[]` | array | Aktív megrendelések, max `G.maxOrderSlots` db |
| `G.upgrades[]` | array | 22 upgrade, `bought` flag-gel |
| `G.multipliers` | object | Speed és quality szorzók, upgrade-ek módosítják |

---

## Conventions & Patterns

### Kódstílus
- **ES5 kompatibilis Vanilla JS** – `var` használat (iOS Safari miatt, bár migráció tervezett `const/let`-re)
- Egyetlen `G` globális state objektum – nincs külső state management
- `needFullRender` boolean flag – teljes DOM rebuild csak akkor, ha feltétlenül szükséges
- Különválasztott **render** (teljes rebuild) és **update** (diff frissítés) függvények – performance optimalizáció

### Render stratégia
- **Full render** (`renderPipeline()`, `renderOrders()`, `renderUpgrades()`): crafting completion, upgrade vásárlás, order spawn/fulfill után
- **Diff update** (`updateResourceNumbers()`, `updateStationProgress()`, `updateOrderTimers()`): minden tick (200ms) – csak számokat frissít, nem rebuild-el DOM-ot
- Event delegation: egyetlen `document.addEventListener('click')` – nincs per-element listener

### Megrendelés rendszer
- `ORDER_TEMPLATES` tömb → `spawnOrder()` szűri `minRep` alapján
- Frakció respawn prioritás: teljesítés után az adott frakció hamarabb küld újat (delay: VIP 0s, sürgős 5s, normál 15s)
- Részleges teljesítés: `qtyDelivered` tracking, qty dots vizuális feedback

### Minőségi rendszer
- Minden craftolt item kap `quality` értéket (0–100)
- `getQuality(base)` = base + allQuality bónusz + random ±5–10
- Határok: 0–30 Selejt, 31–60 Standard, 61–85 Jó, 86–100 Mestermű
- Jutalom multiplikátor: Selejt −40%, Standard ±0%, Jó +25%, Mestermű +60%

### Canvas animációk
- Minden stationhoz dedikált `draw*()` függvény (ctx, w, h, active, t paraméterek)
- `tickAnims(t)` koordinálja az összes canvas rajzolást (requestAnimationFrame)
- `initAnimState(sid)` inicializálja az animáció state-et station ID alapján

### Naming conventions
- Station ID-k: `'smelter'`, `'anvil'`, `'grinder'`, `'assembly'`, `'qc'`
- Upgrade ID-k: `u_sm*` (smelter), `u_an*` (anvil), `u_gr*` (grinder), `u_as*` (assembly), `u_qc*` (QC), `u_g*` (globális), `u_os*` (order slot)
- Upgrade effect típusok: `'stationSpeed'`, `'unlockGrinder'`, `'unlockAssembly'`, `'unlockQC'`, `'scrapQuality'`, `'storageUp'`, `'coalRate'`, `'allQuality'`, `'orderSlot'`
- Inventory kulcsok: `ingot`, `part`, `hardened`, `product`

---

## Completed Features

- [x] **Core 5-állomásos pipeline** – Olvasztó → Kovácsállvány → Csiszoló → Összeszereló → QC, bottleneck rendszerrel
- [x] **Nyersanyag rendszer** – 4 típus (scrap, coal, wood, binder), rate-alapú automatikus gyűjtés, minőség tracking
- [x] **Minőségi rendszer** – Selejt / Standard / Jó / Mestermű, ár multiplikátor hatással
- [x] **22 upgrade** – csoportosított UI, station-specifikus és globális fejlesztések
- [x] **Megrendelés queue** – 3 frakció (Acélkarmok, Kéregmanók, Vasbosszú), rep-gated pool (0/10/25/50), 4 order típus
- [x] **Részleges megrendelés teljesítés** – qty dots vizuális feedback, `qtyDelivered` tracking
- [x] **Mobile-first UI** – 3 tab panel, CSS !important fix, touch-optimalizált gombok
- [x] **Event delegation** – egyetlen document listener, nincs DOM rebuild kattintáskor
- [x] **Canvas animációk** – mind az 5 stationhoz egyedi rajzoló (olvasztó láng, kalapácsütés, szikrák, fogaskerekek, QC scan)
- [x] **Bottleneck vizualizáció** – warning jelzés ha a pipeline torlódik
- [x] **Frakció respawn delay** – teljesítés után az adott frakció prioritást kap
- [x] **iOS Safari javítás** – duplikált függvények eltávolítva
- [x] **Nyersanyag ráta újraskálázás** – /s → közel /min érzet a jobb balance érdekében
- [x] **GDD + Roadmap + TODO dokumentáció** – teljes tervezési dokumentáció elkészítve

---

## Known Issues / Tech Debt

### Aktív bugok (sprint)
- `getInvCount` / `consumeInv` – negatív inventory guard hiányos (`Math.max(0)` check szükséges)
- Megrendelés lejáratkor reputation negatívba mehet (`Math.max(0, rep - penalty)` hiányzik)
- `needFullRender` race condition – pipeline render közben érkező új trigger esetén
- `sparks()` – null-safe check hiányzik ha a station DOM elem nem létezik
- `qtyDelivered` nem null-safe minden helyen

### UI/UX hibák
- Mobilon bottleneck warning szöveg túl hosszú (⚠ BN szöveg rövidíteni kell)
- Toast üzenetek fedik a fulfill gombot mobilon
- Canvas méretezés portrait vs. landscape módban nem konzisztens
- Upgrade lista scroll pozíció elveszik full render után

### Tech debt
- `var` → `const/let` migráció (kód olvashatóság) – tervezett, de nem kritikus
- Station `inputSlots` / `outputSlots` nem frissül vizuálisan kovácsoláskor
- iOS Safari Canvas animáció teljesítmény – FPS mérés, esetleg requestAnimationFrame throttle szükséges

---

## Session Log (last 5)

- **2026-02-26**: CLAUDE.md létrehozva – projekt teljes állapotának dokumentálása (pipeline, architecture, patterns, known issues)

---

## Roadmap Összefoglaló

| Fázis | Tartalom | Státusz |
|---|---|---|
| **MVP (Fázis 0)** | Core pipeline, 3 frakció, 22 upgrade, canvas animációk | 🟠 Aktív |
| **Beta v1 (Fázis 1)** | Staff, offline progress, prestige alap, 5 frakció, IndexedDB, PWA | ⬜ Tervezett |
| **Launch v1.0 (Fázis 2)** | Leaderboard, backend (Node+PG+Redis), monetizáció, skin shop | ⬜ Tervezett |
| **v1.1 (Fázis 3)** | Heti eventek, új receptek, volframit, 2 extra frakció | ⬜ Tervezett |
| **v2.0 (Fázis 4)** | Kikötő expanzió, guild rendszer, cloud save | ⬜ Tervezett |

## Tervezett Tech Stack (teljes)

**MVP (jelenlegi):** Vanilla JS (ES5), HTML5 Canvas, CSS3 + CSS Variables
**Beta v1:** + IndexedDB, Service Worker (PWA), Web Workers
**Launch:** + Node.js + Express, PostgreSQL, Redis, JWT, Google AdSense/AdMob
