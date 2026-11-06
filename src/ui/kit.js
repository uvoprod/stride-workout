// Small UI toolkit: DOM helper, icons, sheet, toast, charts, tilt, timers.
import { sfx } from '../audio/sfx.js';
import { mmss } from '../core/util.js';

// ── DOM ─────────────────────────────────────────────────────────────────────
export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  add(el, kids);
  return el;
}
function add(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
}
export const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
export const $ = (sel, root = document) => root.querySelector(sel);

// ── Icons (stroke, 24px) ────────────────────────────────────────────────────
const P = {
  today: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  week: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  progress: '<path d="M4 19V5M4 19h16"/><path d="M8 15l3.5-4 3 2.5L20 7"/>',
  journal: '<path d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v15L12 17l-6.5 3V5A1.5 1.5 0 0 1 6 3.5z"/><path d="M9 8h6M9 11.5h4"/>',
  food: '<path d="M6 3v7a2.5 2.5 0 0 0 2.5 2.5M11 3v7a2.5 2.5 0 0 1-2.5 2.5M8.5 3v18M17.5 21V3c-2.2 1.4-3.5 4-3.5 7.5V14h3.5"/>',
  me: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  vol: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  chevd: '<path d="M5 9l7 7 7-7"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  timer: '<circle cx="12" cy="13.5" r="7"/><path d="M12 10v4M9.5 3.5h5"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.2"/>',
  flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.2 1.2.9 2 1.7 2.2C10.6 8.5 11 5.5 12 3z"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  download: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14"/>',
  upload: '<path d="M12 16V5M7.5 9L12 4.5 16.5 9M5 19.5h14"/>',
  dumbbell: '<path d="M3.5 9.5v5M6.5 7v10M17.5 7v10M20.5 9.5v5M6.5 12h11"/>',
  stretch: '<circle cx="12" cy="5" r="2"/><path d="M12 8v5M12 13l-4 6M12 13l4 6M6 10.5l6-2.5 6 2.5"/>',
  steps: '<path d="M8 4c2 0 3 2 3 4.5S10 12 8 12s-3-1.5-3-4S6 4 8 4zM9 15.5h-3v2.5a1.5 1.5 0 0 0 3 0zM16 10c2 0 3 2 3 4.5S18 18 16 18s-3-1.5-3-4 1-4 3-4z"/>',
};
export function icon(name, size = 22, cls = '') {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', size);
  s.setAttribute('height', size);
  s.setAttribute('fill', 'none');
  s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '1.8');
  s.setAttribute('stroke-linecap', 'round');
  s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true');
  if (cls) s.setAttribute('class', cls);
  s.innerHTML = P[name] || '';
  return s;
}

// ── Toast ───────────────────────────────────────────────────────────────────
let toastEl;
export function toast(msg, ms = 2400) {
  toastEl?.remove();
  toastEl = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(toastEl);
  requestAnimationFrame(() => toastEl.classList.add('in'));
  const t = toastEl;
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 250); }, ms);
}

// ── Bottom sheet ────────────────────────────────────────────────────────────
export function openSheet(title, content, opts = {}) {
  const prevFocus = document.activeElement;
  const body = h('div', { class: 'sheet-body' }, content);
  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'sheet-grab' }),
    h('div', { class: 'sheet-head' },
      h('h2', { class: 'sheet-title' }, title),
      h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: () => close() }, icon('close', 20))),
    body);
  const scrim = h('div', { class: 'scrim', onclick: () => close() });
  const wrap = h('div', { class: 'sheet-wrap' }, scrim, sheet);
  document.body.append(wrap);
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => wrap.classList.add('in'));
  const onKey = (e) => e.key === 'Escape' && close();
  addEventListener('keydown', onKey);
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    removeEventListener('keydown', onKey);
    wrap.classList.remove('in');
    document.body.classList.remove('no-scroll');
    setTimeout(() => wrap.remove(), 260);
    prevFocus?.focus?.();
    opts.onClose?.();
  }
  return { close, body, sheet };
}

// ── Tilt ────────────────────────────────────────────────────────────────────
export function tilt(el, max = 7) {
  el.classList.add('tilt');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return el;
  let raf = 0;
  const set = (rx, ry) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`; }); };
  const move = (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    set((-py * max).toFixed(2), (px * max).toFixed(2));
  };
  const reset = () => { el.style.transform = ''; };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', reset);
  el.addEventListener('pointercancel', reset);
  el.addEventListener('pointerup', reset);
  return el;
}

// ── Charts ──────────────────────────────────────────────────────────────────
const NS = 'http://www.w3.org/2000/svg';
const se = (tag, attrs, text) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
  if (text != null) e.textContent = text;
  return e;
};

/**
 * lineChart({ points:[{x:number,y:number}], band?:[{x,lo,hi}], xTicks:[{x,label}],
 *             yFmt, height, markers:[{x,y}], dots:bool, yPad })
 */
export function lineChart({ points, band, xTicks = [], yFmt = (v) => v, height = 180, markers = [], dots = true, xMin, xMax, yMin, yMax }) {
  const W = 340, H = height, L = 38, R = 12, T = 12, B = 26;
  const svg = se('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', preserveAspectRatio: 'xMidYMid meet' });
  const ys = points.map((p) => p.y).concat(band ? band.flatMap((b) => [b.lo, b.hi]) : []);
  if (!points.length) return svg;
  const xs = points.map((p) => p.x);
  const x0 = xMin ?? Math.min(...xs), x1 = Math.max(xMax ?? Math.max(...xs), x0 + 1);
  let y0 = yMin ?? Math.min(...ys), y1 = yMax ?? Math.max(...ys);
  const pad = Math.max((y1 - y0) * 0.18, 0.5);
  y0 = yMin ?? y0 - pad; y1 = yMax ?? y1 + pad;
  const X = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const Y = (v) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  // grid
  for (let i = 0; i <= 3; i++) {
    const v = y0 + ((y1 - y0) * i) / 3;
    svg.append(se('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: 'grid' }));
    svg.append(se('text', { x: L - 6, y: Y(v) + 3.5, 'text-anchor': 'end', class: 'ax' }, yFmt(v)));
  }
  xTicks.forEach((t) => svg.append(se('text', { x: X(t.x), y: H - 7, 'text-anchor': 'middle', class: 'ax' }, t.label)));
  if (band && band.length > 1) {
    const top = band.map((b) => `${X(b.x)},${Y(b.hi)}`).join(' ');
    const bot = band.slice().reverse().map((b) => `${X(b.x)},${Y(b.lo)}`).join(' ');
    svg.append(se('polygon', { points: `${top} ${bot}`, class: 'band' }));
  }
  const pts = points.map((p) => `${X(p.x)},${Y(p.y)}`);
  if (points.length > 1) svg.append(se('polyline', { points: pts.join(' '), class: 'line', fill: 'none' }));
  if (dots) points.forEach((p) => svg.append(se('circle', { cx: X(p.x), cy: Y(p.y), r: points.length > 24 ? 0 : 3.5, class: 'dot' })));
  const last = points[points.length - 1];
  svg.append(se('circle', { cx: X(last.x), cy: Y(last.y), r: 5.5, class: 'dot-last' }));
  markers.forEach((m) => svg.append(se('circle', { cx: X(m.x), cy: Y(m.y), r: 7, class: 'pr-ring' })));
  return svg;
}

export function barChart({ values, max = 5, labels = [], height = 70 }) {
  const W = 340, H = height, gap = 4;
  const n = values.length;
  const bw = (W - gap * (n - 1)) / n;
  const svg = se('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart bars', role: 'img' });
  values.forEach((v, i) => {
    const bh = v ? (v / max) * (H - 18) : 0;
    svg.append(se('rect', { x: i * (bw + gap), y: H - 14 - bh, width: bw, height: Math.max(bh, 2), rx: 2, class: v ? 'bar' : 'bar empty' }));
    if (labels[i]) svg.append(se('text', { x: i * (bw + gap) + bw / 2, y: H - 2, 'text-anchor': 'middle', class: 'ax' }, labels[i]));
  });
  return svg;
}

// ── Count-up ────────────────────────────────────────────────────────────────
export function countUp(el, to, ms = 700, fmt = (v) => Math.round(v)) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !to) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── Rest timer (floating bar) ───────────────────────────────────────────────
let restEnd = 0, restTotal = 0, restTick = null, restBar = null, restLast = -1;
export function mountRestBar(root) {
  restBar = h('div', { class: 'restbar', hidden: true, role: 'timer', 'aria-live': 'off' },
    h('div', { class: 'rb-fill' }),
    h('div', { class: 'rb-row' },
      h('span', { class: 'rb-label' }, 'Rest'),
      h('span', { class: 'rb-time', id: 'rb-time' }, '0:00'),
      h('button', { class: 'rb-btn', onclick: () => restAdd(15) }, '+15s'),
      h('button', { class: 'rb-btn strong', onclick: () => restStop(true) }, 'Skip')));
  root.append(restBar);
}
export function restStart(sec, label = 'Rest') {
  restTotal = sec; restEnd = Date.now() + sec * 1000; restLast = -1;
  restBar.hidden = false;
  restBar.querySelector('.rb-label').textContent = label;
  document.body.classList.add('resting');
  clearInterval(restTick);
  restTick = setInterval(restUpdate, 200);
  restUpdate();
}
function restAdd(s) { restEnd += s * 1000; restTotal += s; sfx.tick(); restUpdate(); }
export function restStop(skipped) {
  clearInterval(restTick);
  restBar.hidden = true;
  document.body.classList.remove('resting');
  if (skipped) sfx.tick();
}
function restUpdate() {
  const left = (restEnd - Date.now()) / 1000;
  const whole = Math.ceil(left);
  restBar.querySelector('#rb-time').textContent = mmss(left);
  restBar.querySelector('.rb-fill').style.transform = `scaleX(${Math.max(0, left / restTotal)})`;
  if (whole !== restLast) {
    restLast = whole;
    if (whole > 0 && whole <= 3) sfx.beep();
  }
  if (left <= 0) {
    clearInterval(restTick);
    sfx.rest();
    restBar.classList.add('ready');
    restBar.querySelector('.rb-label').textContent = 'Go';
    setTimeout(() => { restBar.classList.remove('ready'); restStop(false); }, 1600);
  }
}

// ── Segment timer (finishers, intervals, stretches) ─────────────────────────
// segments: [{ label, sec, kind:'work'|'easy'|'hold'|'prep', sub?, round? }]
export function runSegments(title, segments, { onDone } = {}) {
  let i = 0, end = 0, paused = false, pausedLeft = 0, tick = null, wake = null, finished = false;
  const ring = se('svg', { viewBox: '0 0 120 120', class: 'tm-ring' });
  ring.append(se('circle', { cx: 60, cy: 60, r: 52, class: 'tm-track' }), se('circle', { cx: 60, cy: 60, r: 52, class: 'tm-arc', transform: 'rotate(-90 60 60)' }));
  const C = 2 * Math.PI * 52;
  const arc = ring.querySelector('.tm-arc');
  arc.style.strokeDasharray = C;
  const timeEl = h('div', { class: 'tm-time' }, '0:00');
  const labelEl = h('div', { class: 'tm-label' });
  const subEl = h('div', { class: 'tm-sub' });
  const nextEl = h('div', { class: 'tm-next' });
  const roundEl = h('div', { class: 'tm-round' });
  const pauseBtn = h('button', { class: 'btn ghost', onclick: () => togglePause() }, icon('pause', 18), ' Pause');
  const overlay = h('div', { class: 'timer-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'tm-top' }, h('span', { class: 'eyebrow' }, title), h('button', { class: 'icon-btn', 'aria-label': 'Close timer', onclick: () => finish(false) }, icon('close', 22))),
    roundEl,
    h('div', { class: 'tm-center' }, ring, h('div', { class: 'tm-inner' }, timeEl)),
    labelEl, subEl, nextEl,
    h('div', { class: 'tm-actions' }, pauseBtn, h('button', { class: 'btn', onclick: () => next(true) }, 'Skip')));
  document.body.append(overlay);
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => overlay.classList.add('in'));
  navigator.wakeLock?.request('screen').then((w) => { wake = w; }).catch(() => {});

  function show() {
    const s = segments[i];
    overlay.dataset.kind = s.kind || 'work';
    labelEl.textContent = s.label;
    subEl.textContent = s.sub || '';
    roundEl.textContent = s.round || '';
    const n = segments[i + 1];
    nextEl.textContent = n ? `Next: ${n.label} · ${mmss(n.sec)}` : 'Last one';
    end = Date.now() + s.sec * 1000;
    if (i > 0) (s.kind === 'work' || s.kind === 'hold') ? sfx.go() : sfx.rest();
  }
  function frame() {
    if (paused) return;
    const s = segments[i];
    const left = (end - Date.now()) / 1000;
    timeEl.textContent = mmss(left);
    arc.style.strokeDashoffset = C * (1 - Math.max(0, left) / s.sec);
    const whole = Math.ceil(left);
    if (frame.last !== whole) { frame.last = whole; if (whole > 0 && whole <= 3) sfx.beep(); }
    if (left <= 0) next(false);
  }
  function next() {
    i++;
    if (i >= segments.length) return finish(true);
    show();
  }
  function togglePause() {
    paused = !paused;
    if (paused) pausedLeft = end - Date.now(); else end = Date.now() + pausedLeft;
    pauseBtn.replaceChildren(icon(paused ? 'play' : 'pause', 18), paused ? ' Resume' : ' Pause');
  }
  function finish(completed) {
    if (finished) return;
    finished = true;
    clearInterval(tick);
    wake?.release?.();
    if (completed) sfx.done();
    overlay.classList.remove('in');
    document.body.classList.remove('no-scroll');
    setTimeout(() => overlay.remove(), 250);
    if (completed) onDone?.();
  }
  show();
  tick = setInterval(frame, 200);
  frame();
  return { close: () => finish(false) };
}
