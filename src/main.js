// ═══════════════════════════════════════════════
// MAIN – game loop entry point
// ═══════════════════════════════════════════════
import { G, needFullRender } from './state.js';
import { qualityLabel, qualityMult, sparks, toast } from './helpers.js';
import { spawnOrder } from './game.js';
import { renderHeader, renderResources, renderUpgrades, renderPipeline, renderOrders } from './render.js';
import { updateResourceNumbers, updateStationProgress, updateOrderTimers, updateUpgradeButtons } from './update.js';
import { tickAnims } from './animations.js';
import { setupEventDelegation } from './events.js';
import { loadGame, saveGame } from './storage.js';

let lastTick        = Date.now();
let orderSpawnTimer = 0;
let autoSaveTimer   = 0;

function gameTick(ts) {
  const now = Date.now();
  const dt  = Math.min(now - lastTick, 200);
  lastTick  = now;
  G.tick++;
  G.dayTime = (G.dayTime + dt / 60000 * 60) % 1440;
  if (G.dayTime < dt / 60000 * 60) G.day++;

  // ── resources growth ──
  for (const key in G.resources) {
    const r = G.resources[key];
    r.val = Math.min(r.max, r.val + r.baseRate * dt / 1000);
  }

  // ── station progress ──
  for (const s of G.stations) {
    if (s.locked || !s.active) continue;
    const speed = 1 / (G.multipliers[s.id + 'Speed'] || 1);
    s.progress += dt * speed;
    if (s.progress >= s.progressMax) {
      s.progress = s.progressMax;
      s.active   = false;
      if (s.id === 'smelter')  { G.inventory.ingot++;    toast('🧱 Fémtömb kész! (+1)', 'success');     sparks(document.getElementById('station-smelter')); }
      if (s.id === 'anvil')    { G.inventory.part++;     toast('⚙ Alkatrész kész! (+1)', 'success');    sparks(document.getElementById('station-anvil')); }
      if (s.id === 'grinder')  { G.inventory.hardened++; toast('🗡 Edzett rész kész! (+1)', 'success');  sparks(document.getElementById('station-grinder')); }
      if (s.id === 'assembly') { G.inventory.product++;  G.totalCrafted++; toast('⚔ Fegyver kész! (+1)', 'success'); sparks(document.getElementById('station-assembly')); }
      if (s.id === 'qc') {
        const ql       = qualityLabel(s.outputItem.quality);
        const goldBonus = Math.floor(20 * qualityMult(s.outputItem.quality));
        G.gold += goldBonus;
        toast('✅ QC: ' + ql.label + ' +' + goldBonus + ' arany', s.outputItem.quality >= 86 ? 'success' : '');
      }
      needFullRender.pipeline  = true;
      needFullRender.resources = true;
    }
  }

  // ── bottleneck detection ──
  G.stations[0].bottleneck = G.inventory.ingot > 4;
  G.stations[1].bottleneck = G.inventory.part  > 4;

  // ── order spawn ──
  orderSpawnTimer += dt;
  if (orderSpawnTimer > 60000) { spawnOrder(); orderSpawnTimer = 0; }

  // ── auto-save every 30s ──
  autoSaveTimer += dt;
  if (autoSaveTimer >= 30000) { saveGame(); autoSaveTimer = 0; }

  // ── order timers + expiry ──
  let expired = false;
  for (let i = G.orders.length - 1; i >= 0; i--) {
    G.orders[i].timeLeft -= dt;
    if (G.orders[i].timeLeft <= 0) {
      toast('✗ Lejárt: ' + G.orders[i].product + ' (' + G.orders[i].faction + ')', 'warn');
      // BUG FIX: reputation floor at 0 (already existed in original, confirmed here)
      G.reputation = Math.max(0, G.reputation - (G.orders[i].type === 'vip' ? 10 : 3));
      G.orders.splice(i, 1);
      expired = true;
    }
  }
  if (expired) needFullRender.orders = true;

  // ── partial updates every frame ──
  updateResourceNumbers();
  updateStationProgress();
  updateOrderTimers();
  updateUpgradeButtons();
  renderHeader();

  // ── full re-renders only on structural change ──
  if (needFullRender.pipeline)  { renderPipeline();  needFullRender.pipeline  = false; }
  if (needFullRender.orders)    { renderOrders();    needFullRender.orders    = false; }
  if (needFullRender.resources) { renderResources(); needFullRender.resources = false; }
  if (needFullRender.upgrades)  { renderUpgrades();  needFullRender.upgrades  = false; }

  tickAnims(now);
  requestAnimationFrame(gameTick);
}

async function init() {
  const loaded = await loadGame();
  if (!loaded) {
    spawnOrder(); spawnOrder();
  }
  renderResources();
  renderPipeline();
  renderOrders();
  renderHeader();
  renderUpgrades();
  setupEventDelegation();
  lastTick = Date.now();
  requestAnimationFrame(gameTick);
  toast(loaded ? '💾 Játék betöltve!' : 'Scrap Forge indítva! Kattints a KOVÁCSOL gombra.');
}

init();
