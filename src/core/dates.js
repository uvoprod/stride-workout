// Local-time date helpers. Dates are 'YYYY-MM-DD' strings.
const pad = (n) => String(n).padStart(2, '0');

export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (s, n) => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / 86400000); // a − b

// ?today=YYYY-MM-DD pretends it is that day (handy for testing later weeks).
let override = null;
try {
  const q = new URLSearchParams(location.search).get('today');
  if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) sessionStorage.setItem('stride.today', q);
  if (q === 'off') sessionStorage.removeItem('stride.today');
  override = sessionStorage.getItem('stride.today');
} catch { /* storage blocked: ignore */ }

export const today = () => override || iso(new Date());
export const weekdayOf = (s) => parse(s).getDay();
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const fmtDay = (s, o) => parse(s).toLocaleDateString('en-GB', o || { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtShort = (s) => parse(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const dayOfYear = (s) => diffDays(s, `${s.slice(0, 4)}-01-01`);
