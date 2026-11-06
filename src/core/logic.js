// Progression suggestions, stats, streaks and badge checks.
import { exercises } from '../config/exercises.js';
import { badges } from '../config/badges.js';
import { addDays, diffDays, today } from './dates.js';
import { CORE, TOTAL_WEEKS, allSessionsDone, coreSessionsDone, currentWeek, entryStatus, isWeekDone, weekPlan } from './schedule.js';
import { avg, e1rm, fmtNum, roundTo } from './util.js';
import { habits as habitDefs } from '../config/content.js';

// ── History & progression ───────────────────────────────────────────────────
export function history(state, exId) {
  const out = [];
  for (const s of Object.values(state.sessions)) {
    for (const slot of Object.values(s.slots || {})) {
      if (slot.ex !== exId) continue;
      const done = (slot.sets || []).filter((x) => x.done);
      if (done.length) out.push({ date: s.date, week: s.week, sets: done, effort: slot.effort });
    }
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

const topKg = (h) => Math.max(...h.sets.map((s) => s.kg || 0));

/** What should I lift today? Returns { kg, reps, action, reason } */
export function suggest(state, exId, slot, deload) {
  const ex = exercises[exId];
  const [lo, hi] = slot.reps;
  const hist = history(state, exId);
  const last = hist[hist.length - 1];
  const prev = hist[hist.length - 2];
  const dir = ex.assisted ? -1 : 1;
  const inc = ex.inc || 0;

  if (ex.mode !== 'kg') {
    if (!last) return { kg: null, reps: lo, action: 'start', reason: ex.mode === 'time' ? 'Hold with good form. Stop when your hips sag.' : 'Go for clean, controlled reps.' };
    const lastReps = Math.max(...last.sets.map((s) => s.reps || 0));
    if (deload) return { kg: null, reps: lo, action: 'deload', reason: 'Deload week: easy and smooth.' };
    return { kg: null, reps: Math.min(hi, lastReps + 1), action: 'rep', reason: `Last time your best was ${lastReps}. Aim for ${Math.min(hi, lastReps + 1)}.` };
  }

  if (!last) {
    const guess = ex.startKg;
    return {
      kg: guess, reps: lo, action: 'start',
      reason: guess != null
        ? `A starting guess: ${fmtNum(guess)} kg${ex.each ? ' each' : ''}. Pick a weight where you could do 3–4 more reps (RPE 6) and adjust.`
        : 'Start light. You should be able to do 3–4 more reps.',
    };
  }
  const t = topKg(last);
  const topSets = last.sets.filter((s) => (s.kg || 0) === t);
  const hitTop = last.sets.length >= Math.min(2, slot.sets) && last.sets.every((s) => s.reps >= hi);
  const missedLo = (h) => h.sets.some((s) => s.reps < lo);

  if (deload) {
    return { kg: Math.max(inc, roundTo(t * 0.85, inc || 1)), reps: lo, action: 'deload', reason: `Deload: about 15% lighter than your usual ${fmtNum(t)} kg. Make every rep smooth.` };
  }
  if (prev && missedLo(last) && missedLo(prev) && topKg(prev) === t) {
    return { kg: Math.max(inc, roundTo(t * 0.92, inc || 1)), reps: lo, action: 'drop', reason: `You fell short twice at ${fmtNum(t)} kg. Drop a little to ${fmtNum(roundTo(t * 0.92, inc || 1))} kg and rebuild.` };
  }
  if (hitTop && last.effort !== 'hard') {
    const next = Math.max(0, t + dir * inc);
    return { kg: next, reps: lo, action: 'add', reason: ex.assisted ? `You hit ${hi} reps on every set. Use less assistance: ${fmtNum(next)} kg.` : `You hit ${hi} reps on every set. Add weight: ${fmtNum(next)} kg.` };
  }
  if (last.effort === 'easy' && prev?.effort === 'easy') {
    const next = Math.max(0, t + dir * inc);
    return { kg: next, reps: lo, action: 'add', reason: `Felt easy twice in a row. Try ${fmtNum(next)} kg.` };
  }
  const bestReps = Math.max(...topSets.map((s) => s.reps || 0));
  if (hitTop && last.effort === 'hard') {
    return { kg: t, reps: hi, action: 'hold', reason: `You hit the top reps but it felt hard. Repeat ${fmtNum(t)} kg until it feels solid.` };
  }
  const target = Math.min(hi, bestReps + 1);
  return { kg: t, reps: target, action: 'rep', reason: `Same weight (${fmtNum(t)} kg). Last best: ${bestReps} reps. Aim for ${target}.` };
}

export function detectPRs(state, session) {
  const prs = [];
  for (const slot of Object.values(session.slots || {})) {
    const ex = exercises[slot.ex];
    if (!ex || ex.mode !== 'kg' || ex.assisted) continue;
    const mine = (slot.sets || []).filter((s) => s.done && s.kg > 0 && s.reps > 0);
    if (!mine.length) continue;
    const best = mine.reduce((a, s) => (e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) ? s : a));
    let prior = 0, priorCount = 0;
    for (const s of Object.values(state.sessions)) {
      if (s === session) continue;
      for (const sl of Object.values(s.slots || {})) {
        if (sl.ex !== slot.ex) continue;
        for (const x of sl.sets || []) if (x.done && x.kg > 0) { prior = Math.max(prior, e1rm(x.kg, x.reps)); priorCount++; }
      }
    }
    if (priorCount && e1rm(best.kg, best.reps) > prior + 0.01) prs.push({ ex: slot.ex, kg: best.kg, reps: best.reps });
  }
  return prs;
}

// ── Stats ───────────────────────────────────────────────────────────────────
export function weightTrend(state) {
  const dates = Object.keys(state.weights).sort();
  return dates.map((d) => {
    const win = dates.filter((x) => x <= d && diffDays(d, x) <= 6).map((x) => state.weights[x]);
    return { date: d, trend: avg(win), n: win.length };
  });
}
export function weightBaseline(state) {
  const dates = Object.keys(state.weights).sort();
  if (!dates.length) return state.profile?.startWeight ?? null;
  const first = dates[0];
  return avg(dates.filter((d) => diffDays(d, first) <= 6).map((d) => state.weights[d]));
}
export function weightSummary(state) {
  const t = weightTrend(state);
  const base = weightBaseline(state);
  const now = t.length ? t[t.length - 1].trend : null;
  return { trend: t, base, now, change: now != null && base != null ? now - base : null, enough: t.length >= 3 };
}

export function waistSeries(state) {
  return Object.keys(state.waist).sort().map((d) => ({ date: d, cm: state.waist[d] }));
}
export function waistDelta(state) {
  const s = waistSeries(state);
  if (s.length < 2) return null;
  return s[s.length - 1].cm - s[0].cm;
}
export const waistDueWeeks = [1, 3, 5, 7, 9, 11, 12];
export function waistDue(state, w) {
  if (!waistDueWeeks.includes(w)) return false;
  const dates = Object.keys(state.waist);
  const start = addDays(state.profile.startDate, (w - 1) * 7);
  const end = addDays(start, 6);
  return !dates.some((d) => d >= start && d <= end);
}

export function liftSeries(state, exId) {
  return history(state, exId).map((h) => {
    const t = topKg(h);
    const reps = Math.max(...h.sets.filter((s) => s.kg === t).map((s) => s.reps));
    return { date: h.date, kg: t, reps, e1rm: e1rm(t, reps) };
  });
}
export function liftsWithData(state) {
  const ids = new Set();
  for (const s of Object.values(state.sessions)) for (const sl of Object.values(s.slots || {})) {
    if (exercises[sl.ex]?.mode === 'kg' && (sl.sets || []).some((x) => x.done && x.kg > 0)) ids.add(sl.ex);
  }
  return [...ids].sort((a, b) => history(state, b).length - history(state, a).length);
}

export const jumpSeries = (state) => [...state.jumps].sort((a, b) => (a.date < b.date ? -1 : 1));
export function jumpGain(state) {
  const j = jumpSeries(state);
  return j.length >= 2 ? Math.max(...j.map((x) => x.cm)) - j[0].cm : 0;
}

export function strengthGain(state) {
  // biggest kg gain since first logged on any lift
  let best = null;
  for (const id of liftsWithData(state)) {
    const s = liftSeries(state, id);
    if (s.length < 2) continue;
    const gain = s[s.length - 1].kg - s[0].kg;
    if (gain > 0 && (!best || gain > best.gain)) best = { ex: id, gain };
  }
  return best;
}

export function habitCount(state, date) {
  const h = state.habits[date] || {};
  return habitDefs.filter((d) => h[d.id]).length;
}
export function habitStreak(state, now = today()) {
  let d = habitCount(state, now) >= 3 ? now : addDays(now, -1);
  let n = 0;
  while (habitCount(state, d) >= 3) { n++; d = addDays(d, -1); }
  return n;
}

/** consecutive core sessions done, counting back from the latest due session */
export function sessionStreak(state, now = today()) {
  if (!state.profile) return 0;
  const w = Math.min(TOTAL_WEEKS, currentWeek(state, now));
  const list = [];
  for (let i = 1; i <= w; i++) for (const e of weekPlan(state, i)) {
    if (!e.key || e.optional) continue;
    const st = entryStatus(state, i, e, now);
    if (st === 'done' || st === 'missed') list.push(st);
  }
  let n = 0;
  for (let i = list.length - 1; i >= 0 && list[i] === 'done'; i--) n++;
  return n;
}

export function programPct(state) {
  return coreSessionsDone(state) / (TOTAL_WEEKS * 3);
}

export function progressCallout(state) {
  const wd = waistDelta(state);
  if (wd != null && wd < 0) return { big: `${fmtNum(Math.abs(wd))} cm`, text: 'off your waist since week 1', tone: 'good' };
  const sg = strengthGain(state);
  if (sg) return { big: `+${fmtNum(sg.gain)} kg`, text: `on ${exercises[sg.ex].name.toLowerCase()} since you started`, tone: 'good' };
  const jg = jumpGain(state);
  if (jg > 0) return { big: `+${fmtNum(jg)} cm`, text: 'on your vertical jump', tone: 'good' };
  const n = allSessionsDone(state);
  if (n > 0) return { big: String(n), text: n === 1 ? 'session done. The hardest one is behind you.' : 'sessions done. Keep stacking them.', tone: 'neutral' };
  return { big: '0', text: 'sessions so far. Today is a great day to make it 1.', tone: 'neutral' };
}

export const journalCount = (state) => Object.values(state.journal).filter((j) => j.note || j.wentWell || j.energy).length;

// ── Badges ──────────────────────────────────────────────────────────────────
export function badgeEarned(state, rule) {
  switch (rule.type) {
    case 'sessions': return (rule.core ? coreSessionsDone(state) : allSessionsDone(state)) >= rule.n;
    case 'weekDone': return isWeekDone(state, rule.w);
    case 'phaseDone': {
      const [a, b] = rule.key === 'foundation' ? [1, 4] : rule.key === 'build' ? [5, 8] : [9, 12];
      for (let w = a; w <= b; w++) if (!isWeekDone(state, w)) return false;
      return true;
    }
    case 'pr': return state.prLog.length >= rule.n;
    case 'jumpTests': return state.jumps.length >= rule.n;
    case 'jumpGain': return jumpGain(state) >= rule.cm;
    case 'habitStreak': return habitStreak(state) >= rule.n;
    case 'waistLost': return (waistDelta(state) ?? 0) <= -rule.cm;
    case 'journal': return journalCount(state) >= rule.n;
    case 'weighIns': return Object.keys(state.weights).length >= rule.n;
    default: return false;
  }
}

/** Unlocks any newly earned badges. Returns the list of newly unlocked badge defs. */
export function checkBadges(state) {
  const fresh = [];
  for (const b of badges) {
    if (!state.badges[b.id] && badgeEarned(state, b.rule)) {
      state.badges[b.id] = today();
      fresh.push(b);
    }
  }
  return fresh;
}

export const CORE_KEYS = CORE;
