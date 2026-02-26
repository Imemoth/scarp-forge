// ═══════════════════════════════════════════════
// DIFF UPDATE FUNCTIONS – run every tick (200ms)
// Only update changed values, no DOM rebuild
// ═══════════════════════════════════════════════
import { G } from './state.js';
import { getInvCount } from './helpers.js';

export function updateResourceNumbers() {
  for (const key in G.resources) {
    const r   = G.resources[key];
    const el  = document.getElementById('res-val-' + key);
    if (el) el.textContent = Math.floor(r.val);
    const bar = document.getElementById('res-bar-' + key);
    if (bar) bar.style.width = Math.min(100, (r.val / r.max) * 100) + '%';
  }
  const items = ['ingot', 'part', 'hardened', 'product'];
  for (const k of items) {
    const el = document.getElementById('inv-val-' + k);
    if (el) {
      const v = G.inventory[k];
      el.textContent  = v;
      el.style.color  = v > 0 ? 'var(--orange2)' : 'var(--text2)';
    }
  }
}

export function updateStationProgress() {
  for (const s of G.stations) {
    if (s.locked) continue;
    const pct = Math.min(100, (s.progress / s.progressMax) * 100);

    const bar = document.getElementById('prog-' + s.id);
    if (bar) bar.style.width = pct + '%';

    const timeEl = document.getElementById('time-' + s.id);
    if (timeEl && s.active) {
      const speed = 1 / (G.multipliers[s.id + 'Speed'] || 1);
      timeEl.textContent = ((s.progressMax - s.progress) / speed / 1000).toFixed(1) + 's';
    }

    const btn = document.getElementById('btn-' + s.id);
    if (btn) {
      if (s.active)       { btn.disabled = true;  btn.textContent = '⚙ DOLGOZIK...'; }
      else if (pct >= 100){ btn.disabled = false; btn.textContent = '⬇ KIÜRÍTÉS'; }
      else                { btn.disabled = false; btn.textContent = '▶ KOVÁCSOL'; }
    }

    const badge = document.getElementById('badge-' + s.id);
    if (badge) {
      if (s.active)       { badge.className = 'station-badge running'; badge.textContent = '⚙ DOLGOZIK'; }
      else if (pct >= 100){ badge.className = 'station-badge done';    badge.textContent = '✓ KÉSZ'; }
      else                { badge.className = 'station-badge';         badge.textContent = '— TÉTLEN'; }
    }

    const stEl = document.getElementById('station-' + s.id);
    if (stEl) stEl.className = 'station' + (s.active ? ' active' : pct >= 100 ? ' complete' : '');

    const bw = document.getElementById('bn-' + s.id);
    if (bw) bw.style.display = s.bottleneck ? 'block' : 'none';
  }
}

export function updateOrderTimers() {
  for (const o of G.orders) {
    const pct = Math.max(0, (o.timeLeft / o.totalTime) * 100);

    const bar = document.getElementById('otimer-' + o.id);
    if (bar) bar.style.width = pct + '%';

    const txt = document.getElementById('otime-' + o.id);
    if (txt) {
      const mins = Math.floor(o.timeLeft / 60000);
      const secs = Math.floor((o.timeLeft % 60000) / 1000);
      txt.textContent = '⏱ ' + (mins > 0 ? mins + 'p ' + secs + 's' : secs + 's');
      txt.style.color = pct < 20 ? 'var(--red)' : 'var(--text2)';
    }

    const btn = document.getElementById('obtn-' + o.id);
    if (btn) {
      const available  = getInvCount(o.needs);
      // BUG FIX: qtyDelivered null safety
      const stillNeeds = o.qty - (o.qtyDelivered || 0);
      const hasItem    = available > 0 && stillNeeds > 0;
      btn.disabled    = !hasItem;
      btn.textContent = hasItem ? '✓ LEADÁS (' + Math.min(available, stillNeeds) + '/' + stillNeeds + ')' : '⚠ HIÁNYZÓ TERMÉK';
    }

    const qtyEl = document.getElementById('oqty-' + o.id);
    if (qtyEl) {
      // BUG FIX: qtyDelivered null safety
      const done = o.qtyDelivered || 0;
      qtyEl.textContent = done + '/' + o.qty + ' db';
      qtyEl.style.color = done > 0 ? 'var(--green)' : 'var(--text2)';
    }
  }
}

export function updateUpgradeButtons() {
  for (const u of G.upgrades) {
    if (u.bought) continue;
    const btn = document.querySelector('[data-uid="' + u.id + '"]');
    if (btn) btn.disabled = G.gold < u.cost;
  }
}
