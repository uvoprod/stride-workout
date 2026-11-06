// Single JSON blob in localStorage. Everything the app knows lives here.
const KEY = 'stride.v1';

const defaults = () => ({
  v: 1,
  profile: null, // { name, startDate, startWeight, trainDays:[1,3,5], optionalDay:6 }
  weights: {},   // 'YYYY-MM-DD' -> kg
  waist: {},     // 'YYYY-MM-DD' -> cm
  jumps: [],     // { date, cm, week }
  sessions: {},  // `${week}-${key}` -> session (see screens/workout.js)
  journal: {},   // date -> { energy, sleep, mood, note, wentWell, prompt }
  habits: {},    // date -> { steps:bool, water:bool, protein:bool, sleep:bool, veg:bool }
  steps: {},     // date -> number
  ate: {},       // date -> true  ("ate too much" reset used)
  badges: {},    // id -> date unlocked
  prLog: [],     // { date, ex, kg, reps }
  swaps: {},     // `${week}-${key}-${slot}` -> exercise id
  settings: { sound: true, haptics: true },
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...JSON.parse(raw), settings: { ...defaults().settings, ...(JSON.parse(raw).settings || {}) } };
  } catch {
    return defaults();
  }
}

let state = load();
const listeners = new Set();
let timer = null;

function persist() {
  clearTimeout(timer);
  timer = null;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
}

export const get = () => state;

export function update(fn) {
  fn(state);
  clearTimeout(timer);
  timer = setTimeout(persist, 120);
  listeners.forEach((l) => l(state));
}

export const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));

export function flush() { if (timer) persist(); }
addEventListener('pagehide', flush);
addEventListener('visibilitychange', () => document.hidden && flush());

// ── Export / import ─────────────────────────────────────────────────────────
export function exportJSON() {
  return JSON.stringify({ app: 'stride', version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2);
}

export function importJSON(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('That file is not valid JSON.'); }
  const data = parsed && parsed.app === 'stride' ? parsed.data : parsed;
  if (!data || typeof data !== 'object' || typeof data.sessions !== 'object' || !('weights' in data)) {
    throw new Error('This does not look like a Stride backup.');
  }
  state = { ...defaults(), ...data, settings: { ...defaults().settings, ...(data.settings || {}) } };
  persist();
  listeners.forEach((l) => l(state));
}

export function resetAll() {
  state = defaults();
  persist();
  listeners.forEach((l) => l(state));
}
