# Project: Scrap Forge
_Last updated: 2026-02-26 (IndexedDB persistence)_

> Posztapokaliptikus Kovácsműhely Idle Szimulátor – böngészőalapú, moduláris HTML5/JS játék.

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
**Státusz:** IndexedDB perzisztencia kész – játékállás megmarad újratöltés után
**Következő:** Balance finomhangolás, iOS Safari tesztelés, offline progress számítás

### Ami működik
- Teljes 5-állomásos gyártási lánc (Olvasztó → Kovácsállvány → Csiszoló → Összeszereló → QC)
- Nyersanyag automatikus gyűjtés (4 típus: scrap, coal, wood, binder)
- Minőségi rendszer (Selejt / Standard / Jó / Mestermű)
- **IndexedDB mentés/betöltés** – teljes G state perzisztál (gold, rep, inventory, stations, upgrades, orders, multipliers)
- Auto-save 30 másodpercenként + mentés upgrade vásárlásnál és megrendelés teljesítésnél
- `↺` Új játék gomb headerben (confirm dialóg + IndexedDB törlés + reload)
- Betöltéskor `💾 Játék betöltve!` toast; első indulásnál normál welcome toast
- 3 frakció megrendelés rendszer rep-gating-gel (0 / 10 / 25 / 50 rep threshold)
- 22 upgrade, állomásonként csoportosítva
- Részleges megrendelés teljesítés (qty dots vizuális feedback)
- Mobile-first UI, event delegation, tab navigáció
- Canvas animációk mind az 5 állomáshoz
- **ES Modules alapú moduláris fájlstruktúra** (refaktorálva)

### Ami folyamatban van
- Balance finomhangolás (nyersanyag rátak, station időzítések)
- iOS Safari edge case-ek

### Következő fázis (Beta v1) – még nem kezdett
- Staff rendszer, offline progress, prestige, IndexedDB perzisztencia, PWA

---

## Architecture

### Fájlstruktúra
```
scrap-forge/
├── index.html              # HTML shell – layout + CSS link + <script type="module">
├── css/
│   └── style.css           # Teljes CSS (CSS Variables, mobile-first, animációk)
├── src/
│   ├── state.js            # G objektum + ORDER_TEMPLATES + needFullRender
│   ├── helpers.js          # getQuality, qualityLabel, qualityMult, getInvCount,
│   │                       #   consumeInv, toast, sparks, showTab
│   ├── game.js             # spawnOrder, craftStation, fulfillOrder, buyUpgrade
│   ├── render.js           # renderHeader, renderResources, renderUpgrades,
│   │                       #   renderPipeline, renderOrders
│   ├── update.js           # updateResourceNumbers, updateStationProgress,
│   │                       #   updateOrderTimers, updateUpgradeButtons
│   ├── animations.js       # initAnimState (privát), drawSmelter/Anvil/Grinder/Assembly/QC,
│   │                       #   tickAnims (exportált)
│   ├── events.js           # setupEventDelegation (click + data-tab + reset gomb kezelés)
│   ├── storage.js          # IndexedDB wrapper: openDB, saveGame, loadGame, resetGame
│   └── main.js             # gameTick, async init, auto-save timer – belépési pont
├── scrap_forge_mvp.html    # Archív (single-file eredeti, ne töröljük)
├── scrap_forge_gdd.md      # Game Design Document (14 szekció, teljes spec)
├── scrap_forge_roadmap.md  # Fázisonkénti fejlesztési terv (0–4. fázis)
├── scrap_forge_todo.md     # Aktuális sprint feladatok + backlog
└── README.md               # Projekt összefoglaló, quick start
```

### Dependency graph (körkörös import nincs)

```
state.js          (nincs import)
    ↓
storage.js        ← state.js (G)
helpers.js        ← state.js (G)
    ↓
game.js           ← state.js (G, ORDER_TEMPLATES, needFullRender)
                  ← helpers.js (getQuality, getInvCount, consumeInv, toast, sparks)
                  ← storage.js (saveGame)
render.js         ← state.js (G)
                  ← helpers.js (qualityLabel, getInvCount)
update.js         ← state.js (G)
                  ← helpers.js (getInvCount)
animations.js     ← state.js (G)
    ↓
events.js         ← game.js (craftStation, fulfillOrder, buyUpgrade)
                  ← helpers.js (showTab)
                  ← storage.js (resetGame)
    ↓
main.js           ← state.js (G, needFullRender)
                  ← game.js (spawnOrder)
                  ← render.js (render*)
                  ← update.js (update*)
                  ← animations.js (tickAnims)
                  ← events.js (setupEventDelegation)
                  ← helpers.js (sparks, qualityLabel, qualityMult, toast)
                  ← storage.js (loadGame, saveGame)
```

### Dev indítás

```bash
npx serve /home/user/scarp-forge
# vagy
python3 -m http.server 8080
# Böngésző: http://localhost:3000  (vagy 8080)
```

> ES Modules miatt lokális szerver szükséges – `file://` protokollon nem fut.

### Adatfolyam

```
gameTick() [requestAnimationFrame, ~200ms dt cap]
  → resources növelés (baseRate × dt/1000)
  → station progress update (dt × speedMultiplier)
  → station completion → inventory update → needFullRender flag
  → bottleneck detection (ingot/part > 4)
  → order spawn timer (60s)
  → order timer countdown → lejárat → reputation penalty (Math.max(0))
  → updateAll() (diff updates, minden frame)
  → needFullRender ? renderAll() : skip
  → tickAnims(now)
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
- **ES Modules + const/let** – `import`/`export`, modern JS (ES6+)
- Indítás: `npx serve .` vagy `python3 -m http.server` szükséges (ES Modules)
- Egyetlen `G` globális state objektum – nincs külső state management
- `G` exportálva a `state.js`-ből, minden modul importálja – by reference, mutáció azonnal látható
- `needFullRender` objektum a `state.js`-ben él – game.js állítja, main.js olvassa/törli
- **NE** destrukturálj primitíveket a `G`-ből importkor (`const { gold } = G` – értéket másolna!)

### Render stratégia
- **Full render** (`renderPipeline()`, `renderOrders()`, `renderUpgrades()`): crafting completion, upgrade vásárlás, order spawn/fulfill után
- **Diff update** (`updateResourceNumbers()`, `updateStationProgress()`, `updateOrderTimers()`): minden frame – csak számokat frissít, nem rebuild-el DOM-ot
- Event delegation: per-container `addEventListener('click')` + `e.target.closest('[data-*]')` – nincs per-element listener

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
- `animState` objektum **modul-privát** az `animations.js`-ben (nem exportált)
- `tickAnims(t)` az egyetlen exportált belépési pont a canvas rajzoláshoz
- `initAnimState(sid)` lazy init – első rajzolásnál hívódik

### Mobile tab kezelés
- Régi: `onclick="showTab('...')"` inline HTML attribútum (nem működik ES module scope alatt)
- Új: `data-tab="resources"` attribútum + `.mobile-tabs` listener az `events.js`-ben

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
- [x] **Event delegation** – per-container listener, nincs DOM rebuild kattintáskor
- [x] **Canvas animációk** – mind az 5 stationhoz egyedi rajzoló (olvasztó láng, kalapácsütés, szikrák, fogaskerekek, QC scan)
- [x] **Bottleneck vizualizáció** – warning jelzés ha a pipeline torlódik
- [x] **Frakció respawn delay** – teljesítés után az adott frakció prioritást kap
- [x] **iOS Safari javítás** – duplikált függvények eltávolítva
- [x] **Nyersanyag ráta újraskálázás** – /s → közel /min érzet a jobb balance érdekében
- [x] **GDD + Roadmap + TODO dokumentáció** – teljes tervezési dokumentáció elkészítve
- [x] **Moduláris refaktor** – single-file → ES Modules struktúra (index.html + css/ + src/)
- [x] **Bug fix: negatív inventory** – `consumeInv` Math.max(0) guard
- [x] **Bug fix: sparks() null crash** – null check ha station DOM elem nem létezik
- [x] **Bug fix: qtyDelivered null safety** – `|| 0` guard minden helyen
- [x] **Mobile tab onclick eltávolítva** – `data-tab` + event delegation helyette
- [x] **IndexedDB perzisztencia** – `src/storage.js`: openDB/saveGame/loadGame/resetGame, single save slot ('slot1'), saveVersion:1 (migráció ready)
- [x] **Auto-save** – 30s-onként gameTick-ben + azonnali mentés buyUpgrade + fulfillOrder után
- [x] **Új játék gomb** – `↺` a headerben, confirm dialóg, resetGame() + location.reload()
- [x] **Save indikátor** – `💾` ikon villan el mentéskor (CSS transition)

---

## Known Issues / Tech Debt

### UI/UX hibák
- Mobilon bottleneck warning szöveg esetleg túl hosszú (rövidítve: "⚠ BN" – ellenőrizni kell)
- Toast üzenetek fedik a fulfill gombot mobilon
- Canvas méretezés portrait vs. landscape módban nem konzisztens
- Upgrade lista scroll pozíció elveszik full render után

### Tech debt
- Station `inputSlots` / `outputSlots` nem frissül vizuálisan kovácsoláskor
- iOS Safari Canvas animáció teljesítmény – FPS mérés, esetleg requestAnimationFrame throttle szükséges
- `needFullRender` race condition – pipeline render közben érkező új trigger esetén (ritka)

---

## Session Log (last 5)

- **2026-02-26 (3)**: IndexedDB perzisztencia – `src/storage.js` létrehozva (openDB, saveGame, loadGame, resetGame). Módosítva: `game.js` (saveGame hívás fulfillOrder + buyUpgrade végén), `main.js` (async init, await loadGame, 30s auto-save timer), `events.js` (↺ reset gomb listener), `index.html` (reset gomb + save indikátor a headerben), `css/style.css` (reset gomb + #save-indicator stílus).
- **2026-02-26 (2)**: Moduláris refaktor – single-file HTML → ES Modules projekt struktúra. Létrehozva: `index.html`, `css/style.css`, `src/state.js`, `src/helpers.js`, `src/game.js`, `src/render.js`, `src/update.js`, `src/animations.js`, `src/events.js`, `src/main.js`. Bug fixek: negatív inventory guard, sparks() null check, qtyDelivered null safety, inline onclick eltávolítva.
- **2026-02-26 (1)**: CLAUDE.md létrehozva – projekt teljes állapotának dokumentálása (pipeline, architecture, patterns, known issues)

---

## Roadmap Összefoglaló

| Fázis | Tartalom | Státusz |
|---|---|---|
| **MVP (Fázis 0)** | Core pipeline, 3 frakció, 22 upgrade, canvas animációk, moduláris struktúra | 🟠 Aktív |
| **Beta v1 (Fázis 1)** | Staff, offline progress, prestige alap, 5 frakció, IndexedDB, PWA | ⬜ Tervezett |
| **Launch v1.0 (Fázis 2)** | Leaderboard, backend (Node+PG+Redis), monetizáció, skin shop | ⬜ Tervezett |
| **v1.1 (Fázis 3)** | Heti eventek, új receptek, volframit, 2 extra frakció | ⬜ Tervezett |
| **v2.0 (Fázis 4)** | Kikötő expanzió, guild rendszer, cloud save | ⬜ Tervezett |

## Tervezett Tech Stack (teljes)

**MVP (jelenlegi):** Vanilla JS (ES Modules), HTML5 Canvas, CSS3 + CSS Variables, lokális szerver
**Beta v1:** + IndexedDB, Service Worker (PWA), Web Workers
**Launch:** + Node.js + Express, PostgreSQL, Redis, JWT, Google AdSense/AdMob
