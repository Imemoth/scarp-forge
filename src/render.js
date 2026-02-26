// ═══════════════════════════════════════════════
// RENDER FUNCTIONS – full DOM rebuilds
// Called only on structural changes (not every tick)
// ═══════════════════════════════════════════════
import { G } from './state.js';
import { qualityLabel, getInvCount } from './helpers.js';

export function renderHeader() {
  document.getElementById('hstat-gold').textContent    = Math.floor(G.gold).toLocaleString();
  document.getElementById('hstat-crafted').textContent = G.totalCrafted;
  document.getElementById('hstat-rep').textContent     = G.reputation;
  const hour    = Math.floor((G.dayTime / 1440) * 24);
  const timeStr = hour < 6 ? 'HAJNAL' : hour < 12 ? 'REGGEL' : hour < 18 ? 'DÉLUTÁN' : 'ESTE';
  document.getElementById('day-badge').textContent = 'NAP ' + G.day + ' — ' + timeStr;
}

export function renderResources() {
  const c = document.getElementById('resource-list');
  let html = '';
  for (const key in G.resources) {
    const r   = G.resources[key];
    const pct = Math.min(100, (r.val / r.max) * 100);
    const ql  = qualityLabel(r.quality);
    html += '<div class="resource-item">'
      + '<div class="res-icon">' + r.icon + '</div>'
      + '<div class="res-info">'
        + '<div class="res-name">' + r.name + '</div>'
        + '<div class="res-rate">+' + (r.baseRate * 60).toFixed(1) + '/min'
          + ' <span class="quality-pill ' + ql.cls + '" style="font-size:9px;padding:1px 4px;border-radius:8px">' + ql.label + '</span></div>'
        + '<div class="res-bar"><div class="res-bar-fill" id="res-bar-' + key + '" style="width:' + pct + '%"></div></div>'
      + '</div>'
      + '<div class="res-val" id="res-val-' + key + '">' + Math.floor(r.val) + '</div>'
      + '</div>';
  }
  html += '<div class="section-div">🧱 RAKTÁR</div>';
  const items = [
    { n:'Fémtömb',    ic:'🧱', k:'ingot' },
    { n:'Alkatrész',  ic:'⚙️', k:'part' },
    { n:'Edzett rész',ic:'🗡️', k:'hardened' },
    { n:'Kész termék',ic:'⚔️', k:'product' }
  ];
  for (const it of items) {
    const v = G.inventory[it.k];
    html += '<div class="resource-item">'
      + '<div class="res-icon">' + it.ic + '</div>'
      + '<div class="res-info"><div class="res-name">' + it.n + '</div></div>'
      + '<div class="res-val" id="inv-val-' + it.k + '" style="color:' + (v > 0 ? 'var(--orange2)' : 'var(--text2)') + '">' + v + '</div>'
      + '</div>';
  }
  c.innerHTML = html;
}

export function renderUpgrades() {
  const c = document.getElementById('upgrade-list');
  const remaining = G.upgrades.filter(u => !u.bought);
  if (!remaining.length) {
    c.innerHTML = '<div style="color:var(--text2);font-size:12px;text-align:center;padding:20px">✓ Minden fejlesztés megvásárolva!</div>';
    return;
  }
  const groups = [
    { key:'smelter',  label:'🔥 Olvasztó' },
    { key:'anvil',    label:'⚒ Kovácsállvány' },
    { key:'grinder',  label:'⚡ Csiszoló' },
    { key:'assembly', label:'🔧 Összeszereló' },
    { key:'qc',       label:'🔍 QC Állomás' },
    { key:'orders',   label:'📋 Megrendelés Slotok' },
    { key:null,       label:'⬡ Globális' }
  ];
  let html = '';
  for (const grp of groups) {
    const items = remaining.filter(u => {
      if (grp.key === 'orders') return u.effect === 'orderSlot';
      if (grp.key === null)     return u.station === null && u.effect !== 'orderSlot';
      return u.station === grp.key;
    });
    if (!items.length) continue;
    html += '<div class="section-div" style="margin-top:10px">' + grp.label + '</div>';
    for (const u of items) {
      const canBuy = G.gold >= u.cost;
      html += '<div class="upgrade-item">'
        + '<div class="upg-name">' + u.name + '</div>'
        + '<div class="upg-desc">' + u.desc + '</div>'
        + '<div class="upg-footer"><div class="upg-cost">☗ ' + u.cost + '</div>'
        + '<button class="upgrade-btn" data-uid="' + u.id + '" ' + (canBuy ? '' : 'disabled') + '>MEGVÁSÁROL</button>'
        + '</div></div>';
    }
  }
  c.innerHTML = html;
}

export function renderPipeline() {
  const c = document.getElementById('pipeline-container');
  let html = '';
  for (let idx = 0; idx < G.stations.length; idx++) {
    const s        = G.stations[idx];
    const pct      = (s.progress / s.progressMax) * 100;
    const state    = s.locked ? 'locked' : s.active ? 'active' : pct >= 100 ? 'complete' : '';
    const badge    = s.locked ? '' : s.active ? 'running' : pct >= 100 ? 'done' : '';
    const badgeTxt = s.locked ? '🔒 ZÁROLT' : s.active ? '⚙ DOLGOZIK' : pct >= 100 ? '✓ KÉSZ' : '— TÉTLEN';
    const ql       = s.outputItem.quality ? qualityLabel(s.outputItem.quality) : null;
    const speedKey = s.id + 'Speed';
    const speed    = 1 / (G.multipliers[speedKey] || 1);
    const timeLeft = s.active ? ((s.progressMax - s.progress) / speed / 1000).toFixed(1) + 's' : '';
    const btnLabel = s.active ? '⚙ DOLGOZIK...' : pct >= 100 ? '⬇ KIÜRÍTÉS' : '▶ KOVÁCSOL';

    let inputHTML = '', outputHTML = '';
    for (let i = 0; i < s.inputSlots.length; i++)  inputHTML  += '<div class="slot ' + (s.inputSlots[i]  ? 'filled' : '') + '">' + (s.inputSlots[i]  ? s.inputSlots[i].icon  : '') + '</div>';
    for (let i = 0; i < s.outputSlots.length; i++) outputHTML += '<div class="slot ' + (s.outputSlots[i] ? 'output' : '') + '">' + (s.outputSlots[i] ? s.outputSlots[i].icon : '') + '</div>';

    html += '<div class="station-wrapper">'
      + '<div class="station ' + state + '" id="station-' + s.id + '">'
      + '<canvas class="station-anim" id="anim-' + s.id + '" width="220" height="120"></canvas>'
      + '<div class="bottleneck-warn" id="bn-' + s.id + '" style="display:' + (s.bottleneck ? 'block' : 'none') + '">⚠ BN</div>'
      + '<div class="station-header">'
        + '<div class="station-icon">' + s.icon + '</div>'
        + '<div class="station-meta"><div class="station-name">' + s.name + '</div><div class="station-sub">' + s.sub + '</div></div>'
        + '<div class="station-badge ' + badge + '" id="badge-' + s.id + '">' + badgeTxt + '</div>'
      + '</div>'
      + '<div class="prog-wrap"><div class="prog-fill" id="prog-' + s.id + '" style="width:' + pct + '%"></div></div>'
      + '<div class="prog-label"><span>' + s.description + '</span><span id="time-' + s.id + '">' + (s.active ? timeLeft : (ql ? '<span class="quality-pill ' + ql.cls + '">' + ql.label + '</span>' : '')) + '</span></div>'
      + '<div style="display:flex;gap:16px;margin-top:8px;align-items:center">'
        + '<div><div style="font-family:Share Tech Mono;font-size:9px;color:var(--text2);margin-bottom:3px">INPUT</div><div style="display:flex;gap:4px">' + inputHTML + '</div></div>'
        + '<div style="color:var(--text2);font-size:18px;align-self:center">→</div>'
        + '<div><div style="font-family:Share Tech Mono;font-size:9px;color:var(--text2);margin-bottom:3px">OUTPUT</div><div style="display:flex;gap:4px">' + outputHTML + '</div></div>'
      + '</div>'
      + '<button class="craft-btn" id="btn-' + s.id + '" data-sid="' + s.id + '" ' + (s.locked || s.active ? 'disabled' : '') + '>' + (s.locked ? '🔒 ZÁROLT' : btnLabel) + '</button>'
      + '</div></div>';

    if (idx < G.stations.length - 1) {
      const flowing = !G.stations[idx + 1].locked && G.stations[idx + 1].active;
      html += '<div class="arrow-connector"><div class="arrow-line ' + (flowing ? 'active' : '') + '"></div><div class="arrow-head ' + (flowing ? 'active' : '') + '">▼</div></div>';
    }
  }
  c.innerHTML = html;
}

export function renderOrders() {
  const c = document.getElementById('order-list');
  if (!G.orders.length) {
    c.innerHTML = '<div style="color:var(--text2);font-size:12px;text-align:center;padding:20px;font-family:Share Tech Mono">Nincs aktív megrendelés...<br><br>Hamarosan érkeznek a frakciók.</div>';
    return;
  }
  let html = '';
  for (const o of G.orders) {
    const pct      = (o.timeLeft / o.totalTime) * 100;
    const mins     = Math.floor(o.timeLeft / 60000);
    const secs     = Math.floor((o.timeLeft % 60000) / 1000);
    const timeStr  = mins > 0 ? mins + 'p ' + secs + 's' : secs + 's';
    const timerCls = o.type === 'vip' ? 'timer-vip' : o.type === 'urgent' ? 'timer-urgent' : 'timer-normal';
    const badgeCls = o.type === 'vip' ? 'badge-vip' : o.type === 'urgent' ? 'badge-urgent' : 'badge-normal';
    const badgeTxt = o.type === 'vip' ? 'VIP' : o.type === 'urgent' ? 'SÜRGŐS' : 'NORMÁL';
    const available  = getInvCount(o.needs);
    // BUG FIX: qtyDelivered null safety
    const done       = o.qtyDelivered || 0;
    const stillNeeds = o.qty - done;
    const hasItem    = available > 0 && stillNeeds > 0;
    const canGive    = Math.min(available, stillNeeds);
    const btnLabel   = hasItem ? '✓ LEADÁS (' + canGive + '/' + stillNeeds + ')' : '⚠ HIÁNYZÓ TERMÉK';

    let dots = '';
    for (let d = 0; d < o.qty; d++) {
      dots += '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:3px;background:' + (d < done ? 'var(--green)' : 'var(--border)') + ';border:1px solid ' + (d < done ? 'var(--green)' : 'var(--text2)') + '"></span>';
    }

    html += '<div class="order-item ' + o.type + '">'
      + '<div class="order-header"><div class="order-faction">' + o.faction + '</div><div class="order-type-badge ' + badgeCls + '">' + badgeTxt + '</div></div>'
      + '<div class="order-product">' + o.icon + ' ' + o.product + '</div>'
      + '<div style="display:flex;align-items:center;gap:8px;margin:4px 0">' + dots + '<span id="oqty-' + o.id + '" style="font-family:Share Tech Mono;font-size:11px;color:' + (done > 0 ? 'var(--green)' : 'var(--text2)') + '">' + done + '/' + o.qty + ' db</span></div>'
      + '<div class="order-reward">☗ ' + o.reward + ' arany</div>'
      + '<div class="order-timer"><div class="order-timer-fill ' + timerCls + '" id="otimer-' + o.id + '" style="width:' + pct + '%"></div></div>'
      + '<div class="order-time-left" id="otime-' + o.id + '">⏱ ' + timeStr + '</div>'
      + '<button class="fulfill-btn" id="obtn-' + o.id + '" data-oid="' + o.id + '" ' + (hasItem ? '' : 'disabled') + '>' + btnLabel + '</button>'
      + '</div>';
  }
  c.innerHTML = html;
}
