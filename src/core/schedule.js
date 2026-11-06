// Turns the start date + chosen training weekdays into a calendar.
import { addDays, diffDays, today, weekdayOf } from './dates.js';
import { getWeek } from '../config/weeks/index.js';

export const CORE = ['push', 'pull', 'legs'];
export const TOTAL_WEEKS = 12;
export const sessionId = (w, key) => `${w}-${key}`;

/** 0 = not started yet, 1–12 = in programme, 13 = programme finished */
export function currentWeek(state, date = today()) {
  if (!state.profile) return 0;
  const d = diffDays(date, state.profile.startDate);
  if (d < 0) return 0;
  return Math.min(TOTAL_WEEKS + 1, Math.floor(d / 7) + 1);
}

export const weekDates = (state, w) => Array.from({ length: 7 }, (_, i) => addDays(state.profile.startDate, (w - 1) * 7 + i));

/** [{ date, key|null, optional }] for the 7 days of programme week w */
export function weekPlan(state, w) {
  const { trainDays, optionalDay } = state.profile;
  const train = new Set(trainDays);
  let i = 0;
  return weekDates(state, w).map((date) => {
    const wd = weekdayOf(date);
    if (train.has(wd) && i < 3) return { date, key: CORE[i++], optional: false };
    if (optionalDay != null && wd === optionalDay) return { date, key: 'cond', optional: true };
    return { date, key: null, optional: false };
  });
}

export const getSession = (state, w, key) => state.sessions[sessionId(w, key)];
export const isDone = (state, w, key) => !!getSession(state, w, key)?.completedAt;

/** done | today | missed | upcoming | rest | skipped */
export function entryStatus(state, w, entry, now = today()) {
  if (!entry.key) return 'rest';
  if (isDone(state, w, entry.key)) return 'done';
  if (entry.date === now) return 'today';
  if (entry.date < now) return entry.optional ? 'skipped' : 'missed';
  return 'upcoming';
}

export function weekDoneCount(state, w) {
  return CORE.filter((k) => isDone(state, w, k)).length;
}
export const isWeekDone = (state, w) => weekDoneCount(state, w) === 3;

export function coreSessionsDone(state) {
  let n = 0;
  for (let w = 1; w <= TOTAL_WEEKS; w++) n += weekDoneCount(state, w);
  return n;
}
export function allSessionsDone(state) {
  return Object.values(state.sessions).filter((s) => s.completedAt).length;
}

/** What should the Today screen show? */
export function todayView(state, now = today()) {
  const w = currentWeek(state, now);
  if (w === 0) return { kind: 'before', week: 0 };
  if (w > TOTAL_WEEKS) return { kind: 'finished', week: TOTAL_WEEKS };
  const plan = weekPlan(state, w);
  const entry = plan.find((e) => e.date === now);
  const open = plan.find((e) => e.key && !e.optional && !isDone(state, w, e.key) && e.date <= now);
  const next = plan.find((e) => e.key && !isDone(state, w, e.key) && e.date > now);
  return { kind: 'week', week: w, plan, entry, open, next };
}

export function weekInfo(w) {
  return getWeek(w);
}
