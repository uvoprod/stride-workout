// All sounds are synthesised with WebAudio: no audio files needed.
import * as store from '../core/store.js';

let ctx = null;
const getCtx = () => {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const on = () => store.get().settings.sound;

function tone({ f = 440, t = 0, d = 0.12, type = 'sine', v = 0.18, slide = 0 }) {
  const c = getCtx();
  if (!c || !on()) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t0 = c.currentTime + t;
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t0 + d);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + d + 0.02);
}

const buzz = (p) => { try { if (store.get().settings.haptics) navigator.vibrate?.(p); } catch { /* ignore */ } };

export const sfx = {
  unlock: () => getCtx(),
  tick: () => tone({ f: 900, d: 0.04, type: 'square', v: 0.05 }),
  // pitch climbs with each set so the workout feels like it builds
  set: (i = 0) => {
    const base = 520 * Math.pow(1.122, Math.min(i, 8));
    tone({ f: base, d: 0.09, type: 'triangle', v: 0.2 });
    tone({ f: base * 1.5, t: 0.07, d: 0.14, type: 'triangle', v: 0.16 });
    buzz(18);
  },
  unset: () => tone({ f: 300, d: 0.06, type: 'triangle', v: 0.1 }),
  beep: () => tone({ f: 880, d: 0.09, type: 'square', v: 0.09 }),
  go: () => { tone({ f: 1175, d: 0.28, type: 'square', v: 0.1 }); buzz([80, 40, 120]); },
  rest: () => { tone({ f: 700, d: 0.1, type: 'sine', v: 0.2 }); tone({ f: 1050, t: 0.1, d: 0.16, type: 'sine', v: 0.2 }); buzz([120, 60, 120]); },
  done: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone({ f, t: i * 0.09, d: 0.3, type: 'triangle', v: 0.2 }));
    tone({ f: 1568, t: 0.4, d: 0.6, type: 'sine', v: 0.14 });
    buzz([60, 40, 60, 40, 200]);
  },
  badge: () => {
    [784, 988, 1175, 1568, 1976].forEach((f, i) => tone({ f, t: i * 0.07, d: 0.4, type: 'sine', v: 0.14 }));
    buzz([40, 30, 40]);
  },
  pr: () => { tone({ f: 660, d: 0.1, type: 'square', v: 0.08 }); tone({ f: 990, t: 0.1, d: 0.2, type: 'square', v: 0.08 }); },
  pop: () => tone({ f: 600, d: 0.05, type: 'sine', v: 0.12, slide: 1.6 }),
};

export function setSound(v) {
  store.update((s) => { s.settings.sound = v; });
  if (v) { sfx.unlock(); sfx.pop(); }
}
addEventListener('pointerdown', () => getCtx(), { once: true });
