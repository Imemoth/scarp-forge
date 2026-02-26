// ═══════════════════════════════════════════════
// CANVAS ANIMATIONS – one draw function per station
// ═══════════════════════════════════════════════
import { G } from './state.js';

// Animation state is module-private (not exported)
const animState = {};

function initAnimState(sid) {
  if (animState[sid]) return;
  if (sid === 'smelter') {
    animState[sid] = { particles: [], meltY: 120, bubbles: [] };
  } else if (sid === 'anvil') {
    animState[sid] = { hammerY: 20, hammerDir: 1, sparks: [], hit: 0 };
  } else if (sid === 'grinder') {
    animState[sid] = { angle: 0, sparks: [] };
  } else if (sid === 'assembly') {
    animState[sid] = { gear1: 0, gear2: 0, bolts: [] };
  } else if (sid === 'qc') {
    animState[sid] = { scanY: 0, beams: [] };
  }
}

function drawSmelter(ctx, w, h, active, t) {
  const st = animState['smelter'];
  ctx.clearRect(0, 0, w, h);

  // molten metal pool at bottom
  const poolH = active ? 35 + Math.sin(t * 0.003) * 5 : 20;
  const grad  = ctx.createLinearGradient(0, h - poolH, 0, h);
  grad.addColorStop(0,   active ? '#ff6600' : '#442200');
  grad.addColorStop(0.5, active ? '#ffaa00' : '#331100');
  grad.addColorStop(1,   active ? '#cc3300' : '#220800');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, h - poolH);
  for (let x = 0; x <= w; x += 8) {
    const wave = Math.sin(x * 0.08 + t * 0.004) * (active ? 4 : 1);
    ctx.lineTo(x, h - poolH + wave);
  }
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  ctx.fill();

  // rising heat shimmer lines
  if (active) {
    ctx.strokeStyle = 'rgba(255,140,0,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const xp = 20 + i * 40 + Math.sin(t * 0.002 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(xp, h - poolH);
      ctx.bezierCurveTo(xp + Math.sin(t * 0.003 + i * 2) * 10, h - poolH - 30, xp + Math.sin(t * 0.004 + i) * 12, h - poolH - 60, xp + Math.sin(t * 0.002 + i * 3) * 8, h - poolH - 90);
      ctx.stroke();
    }
  }

  // bubbles
  if (active && Math.random() < 0.06) {
    st.bubbles.push({ x: 10 + Math.random() * (w - 20), y: h - poolH + 5, r: 1 + Math.random() * 3, vy: -0.5 - Math.random() * 0.8 });
  }
  for (let i = st.bubbles.length - 1; i >= 0; i--) {
    const b = st.bubbles[i];
    b.y += b.vy; b.r -= 0.04;
    if (b.r <= 0 || b.y < h - poolH - 10) { st.bubbles.splice(i, 1); continue; }
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,200,50,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  }

  // floating ember sparks
  if (active && Math.random() < 0.08) {
    st.particles.push({ x: 30 + Math.random() * (w - 60), y: h - poolH, vx: (Math.random() - 0.5) * 1.5, vy: -1 - Math.random() * 2, life: 1 });
  }
  for (let i = st.particles.length - 1; i >= 0; i--) {
    const p = st.particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.life -= 0.02;
    if (p.life <= 0) { st.particles.splice(i, 1); continue; }
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,' + (100 + Math.floor(p.life * 155)) + ',0,' + p.life + ')';
    ctx.fill();
  }
}

function drawAnvil(ctx, w, h, active, t) {
  const st = animState['anvil'];
  ctx.clearRect(0, 0, w, h);

  // anvil silhouette
  ctx.fillStyle = active ? '#3a3a3a' : '#222';
  ctx.fillRect(w / 2 - 45, h - 25, 90, 18);
  ctx.fillRect(w / 2 - 30, h - 55, 60, 30);
  ctx.beginPath();
  ctx.moveTo(w / 2 - 30, h - 45);
  ctx.lineTo(w / 2 - 70, h - 38);
  ctx.lineTo(w / 2 - 30, h - 30);
  ctx.closePath(); ctx.fill();

  if (active) {
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(w / 2 - 30, h - 57, 60, 3);
  }

  // hammer
  const hammerSwing = active ? Math.abs(Math.sin(t * 0.005)) : 0.1;
  const hammerY     = h - 80 - hammerSwing * 35;
  const hammerRot   = active ? (hammerSwing - 0.5) * 0.4 : 0;

  ctx.save();
  ctx.translate(w / 2 + 10, hammerY + 10);
  ctx.rotate(hammerRot);
  ctx.fillStyle = '#6b3f1a';
  ctx.fillRect(-3, 0, 6, 45);
  ctx.fillStyle = active ? '#aaaaaa' : '#555';
  ctx.fillRect(-14, -8, 28, 16);
  ctx.restore();

  // impact sparks when hammer near anvil
  if (active && hammerSwing > 0.88 && Math.random() < 0.3) {
    for (let k = 0; k < 4; k++) {
      st.sparks.push({ x: w / 2 + 10, y: h - 58, vx: (Math.random() - 0.5) * 6, vy: -1 - Math.random() * 4, life: 0.8 });
    }
    st.hit = 5;
  }
  if (st.hit > 0) st.hit--;
  for (let i = st.sparks.length - 1; i >= 0; i--) {
    const sp = st.sparks[i];
    sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.2; sp.life -= 0.07;
    if (sp.life <= 0) { st.sparks.splice(i, 1); continue; }
    ctx.beginPath(); ctx.moveTo(sp.x, sp.y); ctx.lineTo(sp.x - sp.vx, sp.y - sp.vy);
    ctx.strokeStyle = 'rgba(255,220,80,' + sp.life + ')'; ctx.lineWidth = 1.5; ctx.stroke();
  }
}

function drawGrinder(ctx, w, h, active, t) {
  const st = animState['grinder'];
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2 + 10, cy = h / 2 + 5;
  const r  = 36;
  st.angle += active ? 0.06 : 0.005;

  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
  grad.addColorStop(0, active ? '#555' : '#2a2a2a');
  grad.addColorStop(1, active ? '#333' : '#1a1a1a');
  ctx.fillStyle = grad; ctx.fill();
  ctx.strokeStyle = active ? '#888' : '#444'; ctx.lineWidth = 2; ctx.stroke();

  for (let k = 0; k < 16; k++) {
    const ang = st.angle + k * (Math.PI * 2 / 16);
    const ix = Math.cos(ang) * (r - 2), iy = Math.sin(ang) * (r - 2);
    const ox = Math.cos(ang) * (r + 5),  oy = Math.sin(ang) * (r + 5);
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ox, oy);
    ctx.strokeStyle = active ? '#aaa' : '#444'; ctx.lineWidth = 2.5; ctx.stroke();
  }

  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = active ? '#ff6600' : '#333'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#111'; ctx.fill();

  for (let k = 0; k < 4; k++) {
    const ang = st.angle + k * (Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * 8,       Math.sin(ang) * 8);
    ctx.lineTo(Math.cos(ang) * (r - 4), Math.sin(ang) * (r - 4));
    ctx.strokeStyle = '#666'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = active ? '#885500' : '#442200';
  ctx.fillRect(cx + r - 4, cy - 8, 35, 16);

  if (active && Math.random() < 0.25) {
    st.sparks.push({ x: cx + r + 2, y: cy, vx: 1 + Math.random() * 4, vy: (Math.random() - 0.5) * 5, life: 0.7 });
  }
  for (let i = st.sparks.length - 1; i >= 0; i--) {
    const sp = st.sparks[i];
    sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.15; sp.life -= 0.06;
    if (sp.life <= 0) { st.sparks.splice(i, 1); continue; }
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,' + (150 + Math.floor(Math.random() * 100)) + ',0,' + sp.life + ')';
    ctx.fill();
  }
}

function drawAssembly(ctx, w, h, active, t) {
  const st = animState['assembly'];
  ctx.clearRect(0, 0, w, h);
  st.gear1 += active ? 0.04 : 0.003;
  st.gear2 -= active ? 0.04 : 0.003;

  function drawGear(cx, cy, r, teeth, angle, col) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.stroke();
    for (let k = 0; k < teeth; k++) {
      const a = k * (Math.PI * 2 / teeth);
      ctx.save(); ctx.rotate(a);
      ctx.fillStyle = col;
      ctx.fillRect(-3, -r - 7, 6, 8);
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6600'; ctx.fill();
    ctx.restore();
  }

  const gCol1 = active ? '#5a5a5a' : '#2a2a2a';
  const gCol2 = active ? '#4a4a4a' : '#222';
  const gCol3 = active ? '#666'    : '#333';
  drawGear(w / 2 - 20, h / 2,      28, 10, st.gear1,        gCol1);
  drawGear(w / 2 + 35, h / 2 - 5,  18,  7, st.gear2,        gCol2);
  drawGear(w / 2 + 20, h / 2 + 32, 14,  6, st.gear1 * 1.5,  gCol3);

  // wrench
  ctx.save();
  ctx.translate(w / 2 - 55, h / 2 + 10);
  ctx.rotate(active ? Math.sin(t * 0.004) * 0.3 : 0);
  ctx.fillStyle = active ? '#888' : '#444';
  ctx.fillRect(-3, -25, 6, 50);
  ctx.beginPath();
  ctx.arc(0, -25, 10, 0, Math.PI * 2); ctx.arc(0, -25, 5, 0, Math.PI * 2);
  ctx.fillStyle = active ? '#999' : '#444';
  ctx.fill();
  ctx.restore();

  // connection bolts
  if (active) {
    if (Math.random() < 0.04) st.bolts.push({ x: 20 + Math.random() * (w - 40), y: 10 + Math.random() * (h - 20), life: 1, r: 2 + Math.random() * 3 });
    for (let i = st.bolts.length - 1; i >= 0; i--) {
      const b = st.bolts[i]; b.life -= 0.025;
      if (b.life <= 0) { st.bolts.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle   = 'rgba(100,200,255,' + b.life * 0.5 + ')'; ctx.fill();
      ctx.strokeStyle = 'rgba(100,200,255,' + b.life + ')'; ctx.lineWidth = 1; ctx.stroke();
    }
  }
}

function drawQC(ctx, w, h, active, t) {
  const st = animState['qc'];
  ctx.clearRect(0, 0, w, h);

  st.scanY = (st.scanY + (active ? 1.2 : 0.3)) % h;

  // target object (sword silhouette)
  ctx.fillStyle = active ? '#445544' : '#222';
  ctx.fillRect(w / 2 - 5, 15, 10, h - 30);
  ctx.fillRect(w / 2 - 18, h / 2 - 5, 36, 10);

  // scan beam
  if (active) {
    const scanGrad = ctx.createLinearGradient(0, st.scanY - 15, 0, st.scanY + 15);
    scanGrad.addColorStop(0,   'rgba(0,255,100,0)');
    scanGrad.addColorStop(0.5, 'rgba(0,255,100,0.4)');
    scanGrad.addColorStop(1,   'rgba(0,255,100,0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, st.scanY - 15, w, 30);
    ctx.beginPath();
    ctx.moveTo(0, st.scanY); ctx.lineTo(w, st.scanY);
    ctx.strokeStyle = 'rgba(0,255,100,0.7)'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // grid overlay
  ctx.strokeStyle = active ? 'rgba(0,255,100,0.08)' : 'rgba(100,100,100,0.05)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // corner brackets
  const bCol = active ? 'rgba(0,255,100,0.7)' : 'rgba(100,150,100,0.3)';
  ctx.strokeStyle = bCol; ctx.lineWidth = 2;
  [[5, 5], [w - 5, 5], [5, h - 5], [w - 5, h - 5]].forEach(pt => {
    const sx = pt[0] > w / 2 ? -1 : 1, sy = pt[1] > h / 2 ? -1 : 1;
    ctx.beginPath(); ctx.moveTo(pt[0], pt[1] + sy * 15); ctx.lineTo(pt[0], pt[1]); ctx.lineTo(pt[0] + sx * 15, pt[1]); ctx.stroke();
  });

  if (active) {
    ctx.font = '9px Share Tech Mono, monospace';
    ctx.fillStyle = 'rgba(0,255,100,0.5)';
    ctx.fillText('SCANNING...', 6, h - 8);
  }
}

const animDrawers = { smelter: drawSmelter, anvil: drawAnvil, grinder: drawGrinder, assembly: drawAssembly, qc: drawQC };

export function tickAnims(t) {
  for (const sid in animDrawers) {
    const canvas = document.getElementById('anim-' + sid);
    if (!canvas) continue;
    const cw = canvas.offsetWidth || 200;
    const ch = canvas.offsetHeight || 120;
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    initAnimState(sid);
    const ctx     = canvas.getContext('2d');
    const station = G.stations.find(s => s.id === sid);
    if (!station || station.locked) { ctx.clearRect(0, 0, canvas.width, canvas.height); continue; }
    animDrawers[sid](ctx, canvas.width, canvas.height, station.active, t);
  }
}
