// ═══════════════════════════════════════════════
// HELPERS – pure utility functions
// ═══════════════════════════════════════════════
import { G } from './state.js';

export function getQuality(base) {
  const q = Math.min(100, base + G.multipliers.allQuality * 15 + Math.floor(Math.random() * 20) - 5);
  return Math.max(5, q);
}

export function qualityLabel(q) {
  if (q < 31) return { label: 'Selejt',     cls: 'q-junk' };
  if (q < 61) return { label: 'Standard',   cls: 'q-std' };
  if (q < 86) return { label: 'Jó',         cls: 'q-good' };
  return             { label: 'Mestermű ✦', cls: 'q-master' };
}

export function qualityMult(q) {
  if (q < 31) return 0.6;
  if (q < 61) return 1.0;
  if (q < 86) return 1.25;
  return 1.6;
}

export function getInvCount(needs) {
  const inv = G.inventory;
  if (needs === 'product')  return inv.product;
  if (needs === 'hardened') return inv.hardened;
  if (needs === 'part')     return inv.part;
  if (needs === 'ingot')    return inv.ingot;
  return 0;
}

// BUG FIX: Math.max(0) guard – inventory cannot go negative
export function consumeInv(needs, qty) {
  const inv = G.inventory;
  if (needs === 'product')  inv.product  = Math.max(0, inv.product  - qty);
  if (needs === 'hardened') inv.hardened = Math.max(0, inv.hardened - qty);
  if (needs === 'part')     inv.part     = Math.max(0, inv.part     - qty);
  if (needs === 'ingot')    inv.ingot    = Math.max(0, inv.ingot    - qty);
}

export function toast(msg, type) {
  const el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// BUG FIX: null check – ha a station DOM elem nem létezik, ne crasheljen
export function sparks(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    const angle = (Math.PI * 2 / 8) * i;
    const dist = 30 + Math.random() * 40;
    s.style.cssText = 'left:' + (rect.left + rect.width / 2) + 'px;top:' + (rect.top + rect.height / 2) + 'px;--dx:' + (Math.cos(angle) * dist) + 'px;--dy:' + (Math.sin(angle) * dist) + 'px;position:fixed;z-index:9997;';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
}

export function showTab(tab) {
  ['resources', 'pipeline', 'orders'].forEach(t => {
    document.getElementById('panel-' + t).classList.toggle('active', t === tab);
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
  });
}
