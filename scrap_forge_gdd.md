# ⚒ SCRAP FORGE
### Posztapokaliptikus Kovácsműhely Idle Szimulátor
**Game Design Document · v1.0 · 2026**

| | |
|---|---|
| **Platform** | Böngésző (HTML5/JS) + Mobile (PWA) |
| **Műfaj** | Idle / Incremental / Management |
| **Téma** | Posztapokaliptikus túlélő kovács |
| **Monetizáció** | F2P + Reklám + No-Ads + Cosmetic IAP |
| **Célközönség** | 16–35 éves idle game rajongók |
| **Session hossz** | 2–10 perc aktív / 1–8 óra offline |

---

## 1. Játék Összefoglaló

A Scrap Forge egy posztapokaliptikus kovácsszimulátoros idle játék, ahol a játékos egy romváros szélén felállított kovácsműhelyt vezet. Az emberek frakciókba szerveződtek, és mindenkinek kell fegyver, páncél, eszköz – te vagy az egyetlen mesterkovács a körzetben.

A játék ötvözi a klasszikus idle mechanikákat (automatikus termelés, offline progress) a menedzsment elemekkel (rendelési sor, staff, műszakok) és egy nyersanyag-minőségi rendszerrel, amely posztapokaliptikus ízt ad a tradicionális idle progresszióhoz.

---

## 2. Core Gameplay Loop

```
Nyersanyag gyűjtés → Kovácsolás → Megrendelés teljesítés
        ↑                                      ↓
Bevétel / Presztízs  ←  Fejlesztés / Staff bővítés
```

### 2.2 Másodlagos hurkok

- **Scrap minőség kezelés** – jó vs. selejt nyersanyag befolyásolja a végtermék minőségét
- **Frakció reputáció** – különböző frakcióknak teljesített megrendelések különböző jutalmakat adnak
- **Prestige (Wasteland Reset)** – rejtett bónuszokért újra lehet kezdeni
- **Leaderboard verseny** – heti rangsor a legtöbb teljesített VIP megrendelés alapján

---

## 3. Nyersanyag Rendszer

### 3.1 Nyersanyag típusok

| Nyersanyag | Forrás | Minőség szintek | Felhasználás |
|---|---|---|---|
| Fémhulladék (Scrap) | Automatikus gyűjtő | Rozsdás / Közepes / Tiszta | Minden alaprecept |
| Szén / Koksz | Olvasztó | Nedves / Száraz / Prém. | Tüzelőanyag, acélhoz |
| Fa / Nyél | Erdőszél fosztogató | Korhadt / Kemény / Kőris | Szerszámnyél, tok |
| Kötőanyag (Szurok) | Kereskedelmi | Híg / Normál / Extra | Páncél összeillesztés |
| Ritka fém (Volframit) | Küldetés jutalom / Prestige | — | Endgame receptek |

### 3.2 Scrap Minőség & QC rendszer

Minden begyűjtött nyersanyagnak van egy minőségi értéke (0–100%). Az olvasztás során a minőség befolyásolja a végső alkatrész tulajdonságait:

| Minőségi sáv | Megnevezés | Termék hatás | Eladási ár módosító |
|---|---|---|---|
| 0–30% | Selejt (Junk) | 20% esély törésre szállításnál | –40% |
| 31–60% | Közepes (Standard) | Normál minőség | 0% |
| 61–85% | Jó (Quality) | Bónusz reputáció | +25% |
| 86–100% | Mestermű (Masterwork) | VIP megrendelő elégedett, extra jutalom | +60% |

A **QC állomás** egy fejleszthető épület, amely automatikusan kiszűri a selejtet és újraolvasztásra küldi. Upgrades nélkül minden scrap-ot felhasznál a rendszer.

---

## 4. Kovácsolás Pipeline

### 4.1 Többlépcsős gyártás

```
[1] OLVASZTÓ        → Scrap → Fémtömb              (2–8 perc)
        ↓
[2] KOVÁCSÁLLVÁNY   → Fémtömb → Alakított alkatrész (1–4 perc)
        ↓
[3] CSISZOLÓ / EDZŐ → Alkatrész → Edzett alkatrész  (1–3 perc)
        ↓
[4] ÖSSZESZERELŐ    → Alkatrész + Nyél/Tok → Kész   (1–5 perc)
        ↓
[5] QC ÁLLOMÁS      → Minőségvizsgálat → Szállítható / Selejt
```

### 4.2 Bottleneck rendszer

Minden állomásnak van kapacitása és sebessége. Ha egy downstream állomás lassabb, az upstream sor megtelik – ez ösztönzi a játékost a legszűkebb keresztmetszetű állomás fejlesztésére.

| Állomás | Alap slot | Max slot (upgrade) | Bottleneck hatás |
|---|---|---|---|
| Olvasztó | 1 | 4 | Nincs alapanyag → pipeline megáll |
| Kovácsállvány | 2 | 6 | Lassú alakítás → olvasztó megtelik |
| Csiszoló/Edző | 1 | 4 | Edzetlen alkatrész torlódás |
| Összeszerelő | 2 | 5 | Kész termék késés → megrendelés lejár |
| QC Állomás | 1 | 3 | Selejt átcsúszik → reputáció veszteség |

---

## 5. Megrendelés Queue & Frakció Rendszer

### 5.1 Megrendelés típusok

| Típus | Forrás | Határidő | Jutalom | Prioritás |
|---|---|---|---|---|
| Normál | Random NPC | 30–120 perc | Alap arany + rep. | Alacsony |
| Sürgős | Frakció kézbesítő | 10–30 perc | +50% arany | Közepes |
| VIP | Frakció vezér | 5–15 perc | +150% arany + ritka alap. | Magas |
| Kézi (Manual) | Játékos nyomja | Nincs limit | Alap | — |
| Éjszakai csomag | Offline jutalom | Offline idő alatt | Offline bónusz | Auto |

### 5.2 Priorizálás mechanika

A sor vizuálisan jelenik meg (legfeljebb 8 aktív megrendelés egyidőben). A játékos drag-and-drop módszerrel átrendezi a sort, VIP megrendelést előre húzva. Ha a VIP megrendelés lejár, reputáció veszteség és büntetőidő jár a frakciónál.

### 5.3 Frakciók

| Frakció | Témájuk | Kedvelt termék | Jutalom specialitás |
|---|---|---|---|
| Acélkarmok | Katonai zsoldos csoport | Fegyverek, páncél | Ritka fém, fegyver skin |
| Kéregmanók | Vándorkereskedők | Szerszámok, zár | Kereskedési bónusz, extra slot |
| Vasbosszú | Bosszúszomjas törzs | Lándzsák, nyilak | Reputáció multiplikátor |
| Techsajkások | Felvilágosult mérnökök | Alkatrészek, kéziszerszám | Gyártási sebesség bónusz |
| Elpusztult Rend | Régi világi pap-katonák | Szertartásos fegyver | Prestige bónusz |

Minden frakciónál van egy 0–100-as reputáció skála. Magasabb reputáció = több VIP megrendelés, jobb árak, exkluzív receptek feloldása.

---

## 6. Staff & Automatizáció

### 6.1 Alkalmazottak

| Beosztás | Állomás | Alap hatás | Max szint |
|---|---|---|---|
| Olvasztármester | Olvasztó | +20% olvasztási sebesség/fő | 3 fő |
| Kézműves segéd | Kovácsállvány | +15% alakítási sebesség | 4 fő |
| Csiszológép kezelő | Csiszoló | +25% edzési sebesség | 2 fő |
| Összeszereló | Összeszereló | Automatikus összeszereló | 3 fő |
| QC Ellenőr | QC Állomás | +10% selejtkiszűrési arány | 2 fő |
| Raktáros | Globális | +30% tárolókapacitás | 2 fő |
| Futár | Szállítás | Offline progress +1 óra/szint | 3 szint |

### 6.2 Műszak rendszer

A műhely nappal/éjszaka ciklikusan működik (valós idő alapú, 12 óránként vált). Éjszakai műszakban a termelési sebesség –30%, de az offline progress bónusz aktív. Staffot lehet műszakra beosztani – aki dolgozik éjjel, nappal kevésbé hatékony (fáradtság csúszka).

### 6.3 Automatizáció szintek

| Szint | Feloldás | Leírás |
|---|---|---|
| 0 – Kézi | Alapból | Minden kovácsolás kézi gombnyomás |
| 1 – Félautomata | 5. upgrade | Olvasztó automatikusan dolgozik |
| 2 – Segédautomata | 15. upgrade | Összes állomás automata, sor kézi |
| 3 – Teljes Auto | Prestige után | Teljes pipeline önállóan fut, játékos csak priorizál |

---

## 7. Offline Progress

### 7.1 Mechanika

```
Offline produkció = Alap_termelés × Offline_hatékonyság × Eltelt_idő

Alap offline hatékonyság:  60%
+ Futár upgrade 1:         +10% → 70%
+ Futár upgrade 2:         +10% → 80%
+ Futár upgrade 3:         +10% → 90%
+ Prémium (No-Ads csomag): +10% → max 100%

Max offline idő: 8 óra (alap) / 16 óra (prémium)
```

### 7.2 Visszatérési jutalom

Visszatéréskor a játékos egy animált összegzőt lát: mennyi termék készült, mennyi arany gyűlt, milyen megrendelések teljesültek automatikusan. Reklám megtekintésével ×1.5 szorzó alkalmazható az offline összegre (F2P flow).

---

## 8. Prestige Rendszer – Wasteland Reset

A prestige akkor érhető el, ha a játékos elért egy bizonyos össztermelési küszöböt. Újrakezdéskor elvesznek az épületek és a szint, de megmaradnak:

- Wasteland Token-ek (prestige valuta)
- Frakció reputáció 25%-a
- Skin kollekció
- Leaderboard eredmények

### 8.1 Wasteland Token felhasználás

| Vásárolható dolog | Ár (Token) | Hatás |
|---|---|---|
| Offline time +4 óra | 5 | Max 16 óra offline (F2P) |
| Alap termelési sebesség +10% | 10 | Stacking, max 5× |
| Extra megrendelés slot | 15 | 9. slot a sorban |
| Kézzel kezdő blueprint | 20 | Endgame recept feloldás induláskor |
| Frakció szívesség | 30 | Egy frakció reputáció 50%-ról indul |

---

## 9. Progression & Fejlesztések

### 9.1 Fejlesztési fa áttekintés

Összesen 60+ fejlesztés érhető el, 6 kategóriában:

- **Termelés** (Olvasztó, Állvány, Csiszoló, QC): sebességek, slotok
- **Infrastruktúra**: tároló, energia, biztonsági fal
- **Staff**: létszám, fáradtság kezelés, műszak automatizálás
- **Kereskedelem**: frakció kapcsolatok, árak, extra megrendelés típusok
- **Kutatás**: új receptek, minőségjavítás, ritka anyagok
- **Prestige fa**: Wasteland Token megvásárolható bónuszok

### 9.2 Fejlesztési mérföldkövek

| Mérföldkő | Feltétel | Jutalom |
|---|---|---|
| Első kovács | 10. upgrade megvásárolva | Acélkarmok frakció felnyitás |
| Félautomata műhely | Olvasztó auto elérése | Éjszakai műszak feloldás |
| Mesterkovács | 100 VIP megrendelés teljesítés | Mestermű skin feloldás |
| Wasteland Legenda | Első prestige elérése | Exkluzív 'Roncs Trón' skin |
| Ipari Titán | 5. prestige | Leaderboard 'Örök Rang' cím |

---

## 10. PvP & Leaderboard

### 10.1 Heti verseny

Minden héten indul egy Leaderboard verseny. A rangsor metrikái:

- Teljesített VIP megrendelések száma (heti)
- Összes termelt arany (heti)
- Mestermű darabszám (heti)

### 10.2 PvP – Frakció Szabotázs

Magasabb reputációval egy rivális frakció ('Vasbosszú' vs. 'Acélkarmok') időnként sabotage akciót indít: megpróbálnak ellopni egy megrendelést. A játékos 'biztonsági fal' fejlesztéssel védekezhet.

### 10.3 Jutalmak

| Helyezés | Jutalom |
|---|---|
| 1. | Exkluzív heti skin + 50 Wasteland Token |
| 2–5. | 25 Wasteland Token + egyedi cím |
| 6–20. | 10 Wasteland Token |
| 21–100. | 5 Wasteland Token |

---

## 11. Monetizáció

### 11.1 F2P reklám integráció

| Reklám típus | Megjelenés | Jutalom játékosnak |
|---|---|---|
| Rewarded video | Önkéntes – offline összeg dupla | ×1.5 offline jutalom |
| Rewarded video | Önkéntes – gyors queue skip | Azonnali 1 termék készítés |
| Rewarded video | Napi limit: 5× | Extra Wasteland Token |
| Interstitial | Prestige után, 1× alkalommal | Nincs kötelező, csak 1×/reset |
| Banner | Alap F2P játékosoknak – képernyő alján | Nincs jutalom |

### 11.2 No-Ads csomag (~$2.99–4.99)

Egyszer megvásárolható, örökre eltávolítja a banner és interstitial reklámokat. A rewarded video opcionálisan megmarad.

- Banner reklám eltávolítása
- Interstitial eltávolítása
- Offline hatékonyság +10% bónusz
- Offline max idő 8 → 16 óra

### 11.3 Cosmetic Skin csomagok

| Csomag neve | Ár | Tartalom |
|---|---|---|
| Rozsdafaló Csomag | $1.99 | Olvasztó + Állvány rozsdás skin |
| Vaskrisztály Csomag | $2.99 | Jégkristályos kék kovács szett |
| Hadiisten Csomag | $4.99 | Teljes műhely militáris skin + animált füst |
| Presztízs Legenda | $7.99 | Exkluzív arany + fekete prestige skin szett |
| Starter Pack | $0.99 | Kezdő skin + 10 Wasteland Token (1×) |

> A skinek **csak esztétikaiak** – nem adnak gameplay előnyt.

### 11.4 Bevételi modell becslés

```
Példa: 10,000 aktív F2P játékos / hó

Reklám bevétel:    ~$0.05–0.15 ARPU/nap × 10k × 30  = $15k–45k/hó
No-Ads konverzió:  5% × 10k × $3.99                  = $2k/hó
Skin konverzió:    2% × 10k × $3 átlag               = $600/hó

Becsült összesített: ~$18k–48k/hó (10k aktív user esetén)
```

---

## 12. Technikai Stack

### 12.1 Frontend

| Technológia | Szerepe | Miért ezt? |
|---|---|---|
| Vanilla JS + HTML5 Canvas | Játék motor, animációk | Nincs framework overhead, max teljesítmény |
| CSS3 + CSS Variables | UI stílus, posztapokaliptikus téma | Gyors theming, skin váltás CSS var-okkal |
| Web Workers | Offline progress számítás | Nem blokkolja a UI threadet |
| IndexedDB | Lokális mentés | Böngésző perzisztencia, offline képes |
| Service Worker (PWA) | Offline mód, telepíthetőség | Mobile 'app-like' élmény |

### 12.2 Backend

| Technológia | Szerepe | Miért ezt? |
|---|---|---|
| Node.js + Express | API szerver | Gyors fejlesztés, JS mindkét oldalon |
| PostgreSQL | Játékos adat, leaderboard | Megbízható, ACID, szerver oldali számítás |
| Redis | Session, queue, leaderboard cache | Sub-millisecond leaderboard lekérés |
| JWT Auth | Bejelentkezés | Stateless, mobillal is működik |
| Render.com / Railway | Hosting | Olcsó startup hosting, auto-scale |

### 12.3 Reklám integráció

- Google AdMob (mobile PWA)
- Google AdSense (böngésző web)
- IronSource / Unity Ads (rewarded video fallback)

---

## 13. Kockázatok & Mitigáció

| Kockázat | Valószínűség | Hatás | Mitigáció |
|---|---|---|---|
| Reklám bevétel alacsony (ad block) | Magas | Közepes | Rewarded-re fókuszálás, No-Ads ösztönzés |
| Pipeline túl bonyolult | Közepes | Magas | Tutorial, bottleneck vizualizáció, auto-segéd |
| Leaderboard toxicitás | Alacsony | Közepes | Heti reset, report rendszer |
| Offline progress abuse | Közepes | Alacsony | Szerver oldali idő validáció |
| Platform policy (Google Play IAP) | Alacsony | Magas | WebView-based IAP alternatíva |

---

## 14. Összefoglalás

A Scrap Forge egy jól definiált niche-t céloz: posztapokaliptikus esztétikájú idle játék, amely a klasszikus 'számok nőnek' élményt kiegészíti valódi menedzsment döntéshozatallal (bottleneck kezelés, frakció priorizálás, staff beosztás).

A hibrid F2P modell (reklám + No-Ads + cosmetic) etikus és fenntartható, a prestige és leaderboard rendszer pedig hosszú távú player retention-t biztosít.

**Következő lépés:** MVP playable demo fejlesztése (Core pipeline + 1 frakció)  
**Javasolt eszközök:** Figma (UI mockup), Tiled (tile map), Aseprite (pixel art skin)  
**Becsült MVP idő:** 8–10 hét | 1–2 fejlesztő
