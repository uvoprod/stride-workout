// Best-effort step import from a file exported from Fitbit / Google Health or any spreadsheet.
// Accepts: JSON like [{dateTime, value}] (minute or daily), {"activities-steps":[...]}, or CSV with Date + Steps columns.
// Returns { 'YYYY-MM-DD': steps }.
const pad = (n) => String(n).padStart(2, '0');

function toIsoDate(raw) {
  const s = String(raw).trim().replace(/^"|"$/g, '');
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/); // MM/DD/YY(YY) as in Fitbit exports
  if (m) { const y = m[3].length === 2 ? `20${m[3]}` : m[3]; return `${y}-${pad(m[1])}-${pad(m[2])}`; }
  m = s.match(/^(\d{1,2})[-.](\d{1,2})[-.](\d{4})/); // DD-MM-YYYY
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const num = (v) => { const n = Number(String(v).replace(/[,\s"]/g, '')); return Number.isFinite(n) ? n : null; };

function fromRecords(list) {
  const out = {};
  for (const r of list) {
    if (!r || typeof r !== 'object') continue;
    const dateRaw = r.dateTime ?? r.date ?? r.Date ?? r.day ?? r.startTime;
    const val = num(r.value ?? r.steps ?? r.Steps ?? r.count);
    const d = dateRaw != null ? toIsoDate(dateRaw) : null;
    if (d && val != null) out[d] = (out[d] || 0) + val; // minute-level rows add up to the day
  }
  return out;
}

function splitCsv(line) {
  const cells = []; let cur = '', q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { cells.push(cur); cur = ''; } else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

function fromCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const head = splitCsv(lines[i]).map((c) => c.toLowerCase());
    const di = head.findIndex((c) => /^(date|day|datetime|start)/.test(c));
    const si = head.findIndex((c) => c.includes('step'));
    if (di < 0 || si < 0) continue;
    const out = {};
    for (const line of lines.slice(i + 1)) {
      const cells = splitCsv(line);
      const d = toIsoDate(cells[di] ?? ''), v = num(cells[si]);
      if (d && v != null) out[d] = (out[d] || 0) + v;
    }
    return out;
  }
  return {};
}

export function parseSteps(text) {
  const t = text.trim();
  if (!t) throw new Error('That file is empty.');
  let out = {};
  if (t[0] === '[' || t[0] === '{') {
    let j;
    try { j = JSON.parse(t); } catch { throw new Error('That JSON file could not be read.'); }
    out = fromRecords(Array.isArray(j) ? j : j['activities-steps'] || j.steps || j.data || []);
  } else out = fromCsv(t);
  const clean = {};
  for (const [d, v] of Object.entries(out)) if (v > 0 && v < 100000) clean[d] = Math.round(v);
  if (!Object.keys(clean).length) throw new Error('No daily step counts found. The file needs dates and steps.');
  return clean;
}
