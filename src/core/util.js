export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const roundTo = (v, step) => (step > 0 ? Math.round(v / step) * step : v);
export const fmtNum = (v, d = 1) => {
  if (v == null || Number.isNaN(v)) return '–';
  const r = Number(v.toFixed(d));
  return String(r);
};
export const mmss = (sec) => {
  sec = Math.max(0, Math.ceil(sec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
};
export const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
export const e1rm = (kg, reps) => kg * (1 + reps / 30);
export const plural = (n, s, p) => `${n} ${n === 1 ? s : p || s + 's'}`;
export const sum = (arr) => arr.reduce((a, b) => a + b, 0);
