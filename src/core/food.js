// Food logging: targets, totals, and the AI estimator (bring-your-own Claude API key).
import * as store from './store.js';
import { models, targets, SYSTEM_PROMPT } from '../config/foods.js';
import { weightSummary } from './logic.js';

// The API key lives in its own localStorage entry so it is never part of the JSON export.
const KEY_NAME = 'stride.apikey';
export const getKey = () => { try { return localStorage.getItem(KEY_NAME) || ''; } catch { return ''; } };
export const setKey = (k) => { try { k ? localStorage.setItem(KEY_NAME, k.trim()) : localStorage.removeItem(KEY_NAME); } catch { /* blocked */ } };

export const getModel = () => store.get().settings.foodModel || models[0].id;
export const getDeficit = () => Math.min(targets.deficitMax, Math.max(targets.deficitMin, store.get().settings.deficit || targets.deficitDefault));

/** Estimated daily numbers. Rough on purpose: shown as "about". */
export function dailyTargets(state = store.get()) {
  const p = state.profile || {};
  const kg = weightSummary(state).now ?? p.startWeight ?? null;
  const missing = [];
  if (!kg) missing.push('weight');
  if (!p.heightCm) missing.push('height');
  if (!p.age) missing.push('age');
  if (missing.length) return { ready: false, missing };
  const bmr = 10 * kg + 6.25 * p.heightCm - 5 * p.age + 5;
  const maintenance = bmr * targets.activity;
  const deficit = getDeficit();
  const kcal = Math.round(Math.max(maintenance - deficit, bmr) / 10) * 10; // never below BMR
  return { ready: true, kcal, maintenance: Math.round(maintenance / 10) * 10, bmr: Math.round(bmr), deficit: Math.round(maintenance - kcal), protein: Math.round((targets.proteinPerKg * kg) / 5) * 5, kg };
}

export const dayItems = (state, date) => state.food?.[date] || [];
export function dayTotals(state, date) {
  const t = { kcal: 0, protein: 0, carbs: 0, fat: 0, n: 0 };
  for (const i of dayItems(state, date)) { t.kcal += i.kcal || 0; t.protein += i.protein || 0; t.carbs += i.carbs || 0; t.fat += i.fat || 0; t.n++; }
  return t;
}

export function addItems(date, items, meal) {
  store.update((s) => {
    s.food ||= {};
    const list = (s.food[date] ||= []);
    for (const it of items) list.push({ id: Math.random().toString(36).slice(2, 9), t: Date.now(), meal, ...it });
  });
}
export const removeItem = (date, id) => store.update((s) => { s.food[date] = (s.food[date] || []).filter((x) => x.id !== id); });
export const updateItem = (date, id, patch) => store.update((s) => { const it = (s.food[date] || []).find((x) => x.id === id); if (it) Object.assign(it, patch); });

export const mealForNow = () => { const h = new Date().getHours(); return h < 11 ? 'Breakfast' : h < 16 ? 'Lunch' : h < 19 ? 'Snack' : 'Dinner'; };

export function recents(state, n = 8) {
  const seen = new Map();
  Object.keys(state.food || {}).sort().reverse().slice(0, 14).forEach((d) => (state.food[d] || []).forEach((i) => { if (!seen.has(i.name.toLowerCase())) seen.set(i.name.toLowerCase(), i); }));
  return [...seen.values()].slice(0, n);
}

// ── image → small JPEG ──────────────────────────────────────────────────────
export function fileToJpeg(file, max = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that photo.')); };
    img.src = url;
  });
}

// ── AI estimate ─────────────────────────────────────────────────────────────
export async function estimateMeal({ text, image, where }) {
  const key = getKey();
  if (!key) throw Object.assign(new Error('Add your Claude API key in Food settings first.'), { code: 'NO_KEY' });
  const content = [];
  if (image) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image.split(',')[1] } });
  content.push({ type: 'text', text: `Where it was made: ${where || 'home'}\nWhat I ate: ${text?.trim() || '(see the photo)'}` });
  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: getModel(), max_tokens: 1200, system: SYSTEM_PROMPT, messages: [{ role: 'user', content }] }),
    });
  } catch {
    throw new Error('Could not reach the AI. Check your internet connection.');
  }
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    const msg = e?.error?.message || `Request failed (${res.status})`;
    throw Object.assign(new Error(res.status === 401 ? 'That API key was not accepted. Check it in Food settings.' : msg), { code: res.status });
  }
  const data = await res.json();
  return parseItems((data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join(''));
}

export function parseItems(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('The AI reply was not understandable. Try again or add it by hand.');
  let obj;
  try { obj = JSON.parse(m[0]); } catch { throw new Error('The AI reply was not understandable. Try again or add it by hand.'); }
  const items = (obj.items || []).map((i) => ({
    name: String(i.name || 'Food').slice(0, 80), portion: String(i.portion || ''),
    kcal: Math.max(0, Math.round(Number(i.kcal) || 0)), protein: Math.max(0, Math.round(Number(i.protein) || 0)),
    carbs: Math.max(0, Math.round(Number(i.carbs) || 0)), fat: Math.max(0, Math.round(Number(i.fat) || 0)),
    confidence: ['high', 'medium', 'low'].includes(i.confidence) ? i.confidence : 'medium', note: String(i.note || ''), source: 'ai',
  })).filter((i) => i.kcal > 0 || i.protein > 0);
  if (!items.length) throw new Error('Nothing was recognised. Try describing it differently.');
  return items;
}
