// ═══════════════════════════════════════════════
// STORAGE – IndexedDB persistence layer
// ═══════════════════════════════════════════════
import { G } from './state.js';

const DB_NAME    = 'ScrapForgeDB';
const DB_VERSION = 1;
const STORE      = 'saves';
const SLOT       = 'slot1';

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE);
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = e => reject(e.target.error);
  });
}

function flashSaveIndicator() {
  const el = document.getElementById('save-indicator');
  if (!el) return;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 1500);
}

export async function saveGame() {
  try {
    const db   = await openDB();
    const data = {
      saveVersion:   1,
      savedAt:       Date.now(),
      gold:          G.gold,
      reputation:    G.reputation,
      totalCrafted:  G.totalCrafted,
      day:           G.day,
      dayTime:       G.dayTime,
      resources: {
        scrap:  { val: G.resources.scrap.val,  max: G.resources.scrap.max,  quality: G.resources.scrap.quality,  baseRate: G.resources.scrap.baseRate  },
        coal:   { val: G.resources.coal.val,   max: G.resources.coal.max,   quality: G.resources.coal.quality,   baseRate: G.resources.coal.baseRate   },
        wood:   { val: G.resources.wood.val,   max: G.resources.wood.max,   quality: G.resources.wood.quality,   baseRate: G.resources.wood.baseRate   },
        binder: { val: G.resources.binder.val, max: G.resources.binder.max, quality: G.resources.binder.quality, baseRate: G.resources.binder.baseRate }
      },
      stationStates: G.stations.map(s => ({
        id:                s.id,
        locked:            s.locked,
        active:            s.active,
        progress:          s.progress,
        outputItemQuality: s.outputItem.quality
      })),
      inventory:      { ...G.inventory },
      orders:         G.orders.map(o => ({ ...o })),
      orderIdCounter: G.orderIdCounter,
      maxOrderSlots:  G.maxOrderSlots,
      upgrades:       G.upgrades.map(u => ({ id: u.id, bought: u.bought })),
      multipliers:    { ...G.multipliers }
    };
    await new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).put(data, SLOT);
      req.onsuccess = () => resolve();
      req.onerror   = e => reject(e.target.error);
    });
    flashSaveIndicator();
  } catch (err) {
    console.warn('[ScrapForge] saveGame failed:', err);
  }
}

export async function loadGame() {
  try {
    const db   = await openDB();
    const data = await new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(SLOT);
      req.onsuccess = e => resolve(e.target.result);
      req.onerror   = e => reject(e.target.error);
    });
    if (!data) return false;

    // scalars
    G.gold           = data.gold          ?? G.gold;
    G.reputation     = data.reputation    ?? G.reputation;
    G.totalCrafted   = data.totalCrafted  ?? G.totalCrafted;
    G.day            = data.day           ?? G.day;
    G.dayTime        = data.dayTime       ?? G.dayTime;
    G.orderIdCounter = data.orderIdCounter ?? G.orderIdCounter;
    G.maxOrderSlots  = data.maxOrderSlots  ?? G.maxOrderSlots;

    // resources
    if (data.resources) {
      for (const key of ['scrap', 'coal', 'wood', 'binder']) {
        const saved = data.resources[key];
        if (!saved) continue;
        G.resources[key].val      = saved.val;
        G.resources[key].max      = saved.max;
        G.resources[key].quality  = saved.quality;
        G.resources[key].baseRate = saved.baseRate;
      }
    }

    // station dynamic state
    if (data.stationStates) {
      for (const st of data.stationStates) {
        const s = G.stations.find(x => x.id === st.id);
        if (!s) continue;
        s.locked             = st.locked;
        s.active             = st.active;
        s.progress           = st.progress;
        s.outputItem.quality = st.outputItemQuality;
      }
    }

    // inventory
    if (data.inventory) Object.assign(G.inventory, data.inventory);

    // orders
    if (Array.isArray(data.orders)) G.orders = data.orders;

    // upgrades bought flags
    if (data.upgrades) {
      for (const u2 of data.upgrades) {
        const u = G.upgrades.find(x => x.id === u2.id);
        if (u) u.bought = u2.bought;
      }
    }

    // multipliers
    if (data.multipliers) Object.assign(G.multipliers, data.multipliers);

    return true;
  } catch (err) {
    console.warn('[ScrapForge] loadGame failed:', err);
    return false;
  }
}

export async function resetGame() {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).delete(SLOT);
      req.onsuccess = () => resolve();
      req.onerror   = e => reject(e.target.error);
    });
  } catch (err) {
    console.warn('[ScrapForge] resetGame failed:', err);
  }
}
