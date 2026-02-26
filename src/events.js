// ═══════════════════════════════════════════════
// EVENT DELEGATION
// Single document listener – no per-element bindings
// Also handles mobile tab switching (data-tab)
// ═══════════════════════════════════════════════
import { craftStation, fulfillOrder, buyUpgrade } from './game.js';
import { showTab } from './helpers.js';

export function setupEventDelegation() {
  document.getElementById('pipeline-container').addEventListener('click', e => {
    const btn = e.target.closest('[data-sid]');
    if (btn && !btn.disabled) craftStation(btn.getAttribute('data-sid'));
  });

  document.getElementById('order-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-oid]');
    if (btn && !btn.disabled) fulfillOrder(parseInt(btn.getAttribute('data-oid'), 10));
  });

  document.getElementById('upgrade-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-uid]');
    if (btn && !btn.disabled) buyUpgrade(btn.getAttribute('data-uid'));
  });

  // Mobile tab switching – replaces inline onclick="showTab(...)"
  document.querySelector('.mobile-tabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (btn) showTab(btn.getAttribute('data-tab'));
  });
}
