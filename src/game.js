// ═══════════════════════════════════════════════
// CORE GAME LOGIC
// ═══════════════════════════════════════════════
import { G, ORDER_TEMPLATES, needFullRender } from './state.js';
import { getQuality, getInvCount, consumeInv, toast, sparks } from './helpers.js';
import { saveGame } from './storage.js';

export function spawnOrder(forceFaction) {
  if (G.orders.length >= G.maxOrderSlots) return;
  let pool = ORDER_TEMPLATES.filter(t => G.reputation >= t.minRep);
  if (!pool.length) pool = ORDER_TEMPLATES.filter(t => t.minRep === 0);
  if (forceFaction) {
    const fp = pool.filter(t => t.faction === forceFaction);
    if (fp.length && Math.random() < 0.7) pool = fp;
  }
  const tmpl = pool[Math.floor(Math.random() * pool.length)];
  const qty = tmpl.qty[0] + Math.floor(Math.random() * (tmpl.qty[1] - tmpl.qty[0] + 1));
  const totalMs = (tmpl.timeLimit + (qty - 1) * Math.floor(tmpl.timeLimit * 0.3)) * 1000;
  G.orders.push({
    faction:      tmpl.faction,
    product:      tmpl.product,
    icon:         tmpl.icon,
    type:         tmpl.type,
    needs:        tmpl.needs,
    minRep:       tmpl.minRep,
    id:           ++G.orderIdCounter,
    qty,
    qtyDelivered: 0,
    reward:       tmpl.reward * qty,
    timeLeft:     totalMs,
    totalTime:    totalMs
  });
  needFullRender.orders = true;
}

export function craftStation(sid) {
  const s = G.stations.find(x => x.id === sid);
  if (!s || s.locked || s.active) return;
  const res = G.resources;
  const inv = G.inventory;

  if (sid === 'smelter') {
    if (res.scrap.val < s.inputReq.scrap || res.coal.val < s.inputReq.coal) { toast('Nincs elég nyersanyag!', 'warn'); return; }
    res.scrap.val -= s.inputReq.scrap;
    res.coal.val  -= s.inputReq.coal;
    s.outputItem.quality = getQuality(res.scrap.quality + G.multipliers.scrapQuality * 10);
  } else if (sid === 'anvil') {
    if (inv.ingot < 1) { toast('Nincs fémtömb!', 'warn'); return; }
    inv.ingot--;
    s.outputItem.quality = getQuality(65);
  } else if (sid === 'grinder') {
    if (inv.part < 1) { toast('Nincs alkatrész!', 'warn'); return; }
    inv.part--;
    s.outputItem.quality = getQuality(70);
  } else if (sid === 'assembly') {
    if (inv.hardened < 1 || res.wood.val < 2) { toast('Hiányzó anyagok!', 'warn'); return; }
    inv.hardened--;
    res.wood.val -= 2;
    s.outputItem.quality = getQuality(75);
  } else if (sid === 'qc') {
    if (inv.product < 1) { toast('Nincs kész termék!', 'warn'); return; }
    inv.product--;
    s.outputItem.quality = getQuality(80);
  }

  s.active   = true;
  s.progress = 0;
}

export function fulfillOrder(id) {
  const order = G.orders.find(o => o.id === id);
  if (!order) return;
  const available  = getInvCount(order.needs);
  const stillNeeds = order.qty - (order.qtyDelivered || 0);
  const qtyNow     = Math.min(available, stillNeeds);
  if (qtyNow <= 0) { toast('Nincs megfelelő termék!', 'warn'); return; }

  consumeInv(order.needs, qtyNow);
  order.qtyDelivered = (order.qtyDelivered || 0) + qtyNow;

  if (order.qtyDelivered < order.qty) {
    toast('+' + qtyNow + ' leadva (' + order.qtyDelivered + '/' + order.qty + ') - ' + order.product);
    needFullRender.orders = true;
    return;
  }

  // teljes teljesítés
  const timerRatio = order.timeLeft / order.totalTime;
  const mult   = timerRatio > 0.75 ? 1.5 : timerRatio > 0.5 ? 1.2 : 1.0;
  const earned = Math.floor(order.reward * mult);
  G.gold      += earned;
  G.reputation += order.type === 'vip' ? 15 : order.type === 'urgent' ? 7 : 3;
  G.totalCrafted++;

  const faction = order.faction;
  G.orders = G.orders.filter(o => o.id !== id);

  const delay = order.type === 'vip' ? 0 : order.type === 'urgent' ? 5000 : 15000;
  if (delay === 0) { spawnOrder(faction); }
  else { setTimeout(() => spawnOrder(faction), delay); }

  const bonus = mult > 1.0 ? ' ⚡×' + mult.toFixed(1) : '';
  toast('✓ ' + order.product + ' kész! +' + earned + ' arany' + bonus, 'success');
  needFullRender.orders = true;
  saveGame();
}

export function buyUpgrade(uid) {
  const u = G.upgrades.find(x => x.id === uid);
  if (!u || u.bought || G.gold < u.cost) { toast('Nincs elég arany!', 'warn'); return; }
  G.gold -= u.cost;
  u.bought = true;

  if (u.effect === 'stationSpeed') {
    const key = u.target + 'Speed';
    G.multipliers[key] = (G.multipliers[key] || 1) * u.mult;
  }
  if (u.effect === 'coalRate')     G.resources.coal.baseRate += 0.02;
  if (u.effect === 'scrapQuality') G.multipliers.scrapQuality = (G.multipliers.scrapQuality || 0) + 1;
  if (u.effect === 'storageUp')    { for (const k in G.resources) G.resources[k].max = Math.floor(G.resources[k].max * 1.5); }
  if (u.effect === 'allQuality')   G.multipliers.allQuality = (G.multipliers.allQuality || 0) + 1;
  if (u.effect === 'orderSlot')    { G.maxOrderSlots++; spawnOrder(); }
  if (u.effect === 'unlockGrinder')  { G.stations[2].locked = false; toast('Csiszoló feloldva!'); }
  if (u.effect === 'unlockAssembly') { G.stations[3].locked = false; toast('Összeszereló feloldva!'); }
  if (u.effect === 'unlockQC')       { G.stations[4].locked = false; toast('QC Állomás feloldva!'); }

  toast(u.name + ' megvásárolva!', 'success');
  needFullRender.upgrades = true;
  needFullRender.pipeline = true;
  saveGame();
}
