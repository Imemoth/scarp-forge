# ⚒ SCRAP FORGE – TODO

> MVP aktív fejlesztés · Utolsó frissítés: 2026-02

---

## 🔥 Kritikus / Aktuális Sprint

### Bugs & Stability
- [ ] iOS Safari script error vizsgálat (duplikált függvények eltávolítva – tesztelni kell)
- [ ] Canvas animáció teljesítmény mobilon (FPS mérés, esetleg requestAnimationFrame throttle)
- [ ] `getInvCount` / `consumeInv` edge case: negatív inventory guard
- [ ] Megrendelés lejáratkor reputation negatívba mehet-e? (Math.max(0) check)

### Balance
- [ ] Nyersanyag ráta playtestelése (jelenlegi: scrap 0.15/s, coal 0.06/s)
- [ ] Station időzítés felülvizsgálat (olvasztó 3s → kovácsállvány 8s arány OK?)
- [ ] Korai játék: elegendő-e 20 scrap + 15 coal induló készlet az első kovácsoláshoz?
- [ ] Upgrade árak újrakalibrálása (első upgrade ~80 arany elérhetősége ~5 perc játék után)

---

## 📋 MVP Fennmaradó Feladatok

### Gameplay
- [ ] Megrendelés slot upgrade rendszer tesztelése (u_os1–u_os4, 2→6 slot)
- [ ] Frakció respawn delay tesztelése (VIP: 0s, sürgős: 5s, normál: 15s)
- [ ] Rep-gated megrendelés pool ellenőrzése (0 / 10 / 25 / 50 rep threshold)
- [ ] Qty dots vizuális frissítése részleges leadásnál (renderOrders után updateOrderTimers)
- [ ] `qtyDelivered` perzisztencia: nem null-safe minden helyen

### UI/UX
- [ ] Mobilon tab váltás animáció (fade transition)
- [ ] Station canvas méretezés portrait vs. landscape módban
- [ ] Bottleneck warning szöveg rövidítése mobilon (⚠ BN szöveg túl hosszú)
- [ ] Toast üzenetek ne fedjék a fulfill gombot mobilon
- [ ] Upgrade lista scroll pozíció megőrzése full render után

### Technikai
- [ ] `var` → `const/let` migráció (kód olvashatóság)
- [ ] `needFullRender` race condition: ha pipeline render közben jön új trigger
- [ ] Station `inputSlots` / `outputSlots` nem frissül vizuálisan kovácsoláskor
- [ ] `sparks()` null-safe check ha station DOM elem nem létezik

---

## 🔄 Beta v1 Előkészítés (következő fázis)

### Staff rendszer
- [ ] Staff adatstruktúra tervezése (`G.staff` array)
- [ ] Hire/fire UI panel
- [ ] Fáradtság csúszka mechanika
- [ ] Műszak beosztás UI

### Offline Progress
- [ ] `lastActiveTime` timestamp mentése
- [ ] Offline delta számítás indításkor
- [ ] Visszatérési modal (összegző animáció)
- [ ] Rewarded video hook az offline ×1.5-höz

### Prestige
- [ ] Prestige trigger threshold meghatározása
- [ ] Wasteland Token adatstruktúra
- [ ] Reset animáció
- [ ] Prestige shop UI

### Perzisztencia
- [ ] IndexedDB wrapper megírása (`saveGame()` / `loadGame()`)
- [ ] Auto-save minden 30 másodpercben
- [ ] Save export / import (JSON backup)
- [ ] Verziókezelés a save file-ban (migration support)

---

## 🚀 Launch Előkészítés

### Backend
- [ ] Node.js + Express projekt setup
- [ ] PostgreSQL séma (users, leaderboard, scores)
- [ ] Redis konfiguráció (leaderboard cache)
- [ ] JWT auth flow
- [ ] API végpontok: POST /score, GET /leaderboard, POST /auth

### Monetizáció
- [ ] Google AdSense account + site verification
- [ ] AdMob app regisztráció (PWA)
- [ ] Rewarded video SDK integráció
- [ ] No-Ads IAP implementáció
- [ ] Skin shop UI + checkout flow
- [ ] Receipt validation backend

### PWA / Store
- [ ] `manifest.json` elkészítése
- [ ] Service Worker (offline cache stratégia)
- [ ] App icons (192px, 512px)
- [ ] iOS splash screen
- [ ] PWA install prompt trigger logika

---

## 🎨 Design / Assets

- [ ] Pixel art ikonok az állomásokhoz (Aseprite)
- [ ] Frakció emblémák / logók
- [ ] Skin CSS variable szett (rozsdafaló, vaskrisztály, hadiisten)
- [ ] Animált füst effekt (Hadiisten skin)
- [ ] Tutorial overlay képernyők (4–5 db)
- [ ] App icon design (post-apokaliptikus kalapács logó)
- [ ] Screenshot-ok (store listing: 3–5 db)

---

## 📝 Dokumentáció

- [x] GDD megírva (`scrap_forge_gdd.md`)
- [x] Roadmap megírva (`scrap_forge_roadmap.md`)
- [ ] API dokumentáció (Swagger / OpenAPI)
- [ ] Deployment guide (Render.com setup)
- [ ] Playtest feedback form (Google Forms)
- [ ] Changelog fájl kezdése

---

## 💡 Backlog / Ötletek

> Nem priorizált, de érdemes visszatérni rá

- [ ] Napi login jutalom rendszer (streak)
- [ ] Achievements rendszer (50+ achievement)
- [ ] Sound effects (forge sounds, UI click, success jingle)
- [ ] Háttérzene (ambient posztapokaliptikus loop)
- [ ] Colorblind mode (accessibility)
- [ ] Beállítások panel (hangerő, értesítések, téma)
- [ ] Scrap quality mini-game (opcionális kattintásos bónusz)
- [ ] Blueprint rendszer (receptek feloldása kutatással)
- [ ] Volframit / ritka fém implementáció
- [ ] Endgame recept fa (6–8 high-tier item)
- [ ] Frakció war event (heti cross-frakció esemény)
- [ ] Referral rendszer (meghívó link → Wasteland Token)

---

## ✅ Elvégzett Feladatok

- [x] Core 5-állomásos pipeline implementálva
- [x] Alap nyersanyag rendszer (4 nyersanyag, rate-alapú gyűjtés)
- [x] Minőségi rendszer (Selejt/Standard/Jó/Mestermű)
- [x] Upgrade rendszer (22 fejlesztés, csoportosított UI)
- [x] Megrendelés queue (frakció-alapú spawn, rep gating)
- [x] Részleges megrendelés teljesítés (qty dots vizuális feedback)
- [x] Mobile tab navigáció (3 panel, CSS !important fix)
- [x] Event delegation (nincs DOM rebuild kattintáskor)
- [x] Station canvas animációk (mind az 5 állomáshoz egyedi rajzoló)
- [x] Bottleneck vizuális jelzés
- [x] Frakció-alapú gyors order respawn teljesítés után
- [x] iOS Safari script error javítás (duplikált függvények eltávolítva)
- [x] Nyersanyag ráta újraskálázás (/s → közel /min érzet)
- [x] GDD + Roadmap + TODO dokumentáció
