# ⚒ SCRAP FORGE – Fejlesztési Roadmap

> Utolsó frissítés: 2026 | Státusz: MVP aktív fejlesztés alatt

---

## Áttekintés

```
MVP (✅ folyamatban)  →  Beta v1  →  Launch v1.0  →  v1.1 Tartalom  →  v2.0 Expanzió
     8–10 hét              4–6 hét      3–4 hét         Ongoing           6 hónap
```

---

## ✅ Fázis 0 – MVP Foundation
**Státusz: Aktív fejlesztés**  
**Cél: Playtest-ready demo**

### Elkészült
- [x] Core pipeline (Olvasztó → Kovácsállvány → Csiszoló → Összeszereló → QC)
- [x] Alap nyersanyag rendszer (Scrap, Coal, Wood, Binder)
- [x] Minőség rendszer (Selejt / Standard / Jó / Mestermű)
- [x] Megrendelés queue (2 slot alap, fejleszthető)
- [x] 3 frakció (Acélkarmok, Kéregmanók, Vasbosszú)
- [x] Reputáció alapú megrendelés pool (minRep gating)
- [x] Upgrade rendszer (19+ fejlesztés, állomásonként csoportosítva)
- [x] Részleges megrendelés teljesítés (qty rendszer)
- [x] Mobile-first UI (tab navigáció, touch-optimalizált gombok)
- [x] Event delegation alapú input (nincs DOM rebuild kattintáskor)
- [x] Station canvas animációk (olvasztó, kalapács, csiszoló, fogaskerekek, QC scan)
- [x] Bottleneck vizualizáció

### Folyamatban
- [ ] Megrendelés slot upgrade rendszer (📋 2→6 slot)
- [ ] Frakció-alapú gyors respawn (teljesítés utáni prioritás)
- [ ] Balance finomhangolás (nyersanyag ráta, station idők)

### MVP Scope-on kívül (következő fázis)
- Offline progress
- Prestige rendszer
- Leaderboard
- Staff rendszer
- Reklám integráció

---

## 🔄 Fázis 1 – Beta v1
**Becsült idő: 4–6 hét az MVP után**  
**Cél: Public beta, teljes core élmény**

### Gameplay
- [ ] Mind az 5 frakció implementálása (+ Techsajkások, Elpusztult Rend)
- [ ] Staff rendszer (7 beosztás, fáradtság mechanika)
- [ ] Műszak rendszer (nappal/éjszaka ciklus, 12 óránként)
- [ ] Automatizáció szintek (Kézi → Félautomata → Segédautomata)
- [ ] Drag-and-drop megrendelés priorizálás
- [ ] Teljes 60+ upgrade fa

### Offline
- [ ] Offline progress számítás (60% alap hatékonyság)
- [ ] Visszatérési összegző animáció
- [ ] Futár upgrade (offline bónusz +10%/szint)
- [ ] Max 8 óra offline cap

### Prestige (alap)
- [ ] Wasteland Reset trigger (össztermelési küszöb)
- [ ] Wasteland Token rendszer
- [ ] Prestige shop (5 alap vásárolható bónusz)
- [ ] Frakció reputáció 25% megőrzése resetkor

### Technikai
- [ ] IndexedDB mentés (lokális perzisztencia)
- [ ] Service Worker / PWA alap konfiguráció
- [ ] Web Workers (offline számítás ne blokkolja UI-t)

---

## 🚀 Fázis 2 – Launch v1.0
**Becsült idő: 3–4 hét a Beta v1 után**  
**Cél: Soft launch, monetizáció bekapcsolva**

### Leaderboard & PvP
- [ ] Heti leaderboard (VIP megrendelések, arany, mestermű)
- [ ] Backend API (Node.js + Express + PostgreSQL)
- [ ] Redis cache (leaderboard lekérések)
- [ ] JWT authentikáció
- [ ] Frakció Szabotázs (PvP mechnika, biztonsági fal upgrade)
- [ ] Leaderboard jutalmak (Wasteland Token heti kiosztás)

### Monetizáció
- [ ] Google AdSense banner integráció
- [ ] Rewarded video (offline ×1.5 szorzó)
- [ ] Rewarded video (queue skip)
- [ ] Interstitial (prestige után, 1×/reset)
- [ ] No-Ads IAP csomag ($2.99–4.99)
- [ ] Cosmetic skin shop alap (3–4 csomag)
- [ ] Starter Pack ($0.99, 1× vásárolható)

### Skin rendszer
- [ ] Skin equip/unequip UI
- [ ] Rozsdafaló Csomag skin implementáció
- [ ] Vaskrisztály Csomag skin implementáció

### Technikai
- [ ] Szerver oldali idő validáció (offline abuse védelem)
- [ ] Google Play / App Store PWA wrap (opcionális)
- [ ] Analytics (Firebase / Mixpanel)

---

## 📦 Fázis 3 – v1.1 Tartalom Update
**Státusz: Ongoing (launch után)**  
**Cél: Retention, új tartalom folyamatosan**

### Tartalom
- [ ] Új receptek (volframit-alapú endgame craftok)
- [ ] Heti event rendszer (tematikus megrendelés hullámok)
- [ ] 2 új frakció teljes implementáció
- [ ] Hadiisten & Presztízs Legenda skin csomagok
- [ ] Seasonal event skinok

### Gameplay bővítések
- [ ] Ritka fém (Volframit) teljes integrációja
- [ ] Kutatási fa (új receptek feloldása)
- [ ] Frakció-specifikus exkluzív receptek (magas rep esetén)
- [ ] Mestermű mérföldkő jutalmak bővítése

### QoL
- [ ] Notification rendszer (PWA push – megrendelés lejár hamarosan)
- [ ] Batch crafting (több darab egyszerre indítható)
- [ ] Pipeline sebesség vizualizáció fejlesztése
- [ ] Tutorial / onboarding flow (első indítás)

---

## 🌍 Fázis 4 – v2.0 Expanzió
**Becsült idő: ~6 hónap a launch után**  
**Cél: Növekedés, új helyszín, közösség**

### Új helyszín
- [ ] Kikötő Kovácstelep (2. biome, új pipeline mechanikákkal)
- [ ] Tengeri frakciók (2 új frakció, hajózási megrendelések)
- [ ] Helyszínek közötti nyersanyag csere rendszer

### Guild rendszer
- [ ] Guild létrehozás / csatlakozás
- [ ] Közös heti guild quest
- [ ] Guild leaderboard
- [ ] Guild-exkluzív skin jutalmak

### Technikai
- [ ] Cross-platform cloud mentés (Google / Apple account sync)
- [ ] Multiplayer sabotage bővítése (guild vs. guild)
- [ ] Backend optimalizálás (horizontal scaling)

---

## 🔑 Kulcs Mérföldkövek

| Mérföldkő | Feltétel | Jutalom |
|---|---|---|
| Első kovács | 10. upgrade megvásárolva | Acélkarmok frakció felnyitás |
| Félautomata műhely | Olvasztó auto elérése | Éjszakai műszak feloldás |
| Mesterkovács | 100 VIP megrendelés | Mestermű skin feloldás |
| Wasteland Legenda | Első prestige | Exkluzív 'Roncs Trón' skin |
| Ipari Titán | 5. prestige | Leaderboard 'Örök Rang' cím |

---

## 📊 Kockázati Regiszter

| Kockázat | Valószínűség | Hatás | Mitigáció |
|---|---|---|---|
| Reklám bevétel alacsony (ad block) | Magas | Közepes | Rewarded-re fókuszálás |
| Pipeline túl bonyolult | Közepes | Magas | Tutorial, bottleneck UI |
| Leaderboard toxicitás | Alacsony | Közepes | Heti reset, report |
| Offline progress abuse | Közepes | Alacsony | Szerver oldali validáció |
| Platform policy (IAP) | Alacsony | Magas | WebView IAP alternatíva |
