// "Does it add up?" Estimates what you burn each day and compares it with what you logged eating.
// Rough maths on purpose: resting needs x 1.2 for normal daily life, plus steps above 3,000, plus workouts.
import { dailyTargets, dayTotals } from './food.js';
import { weightTrend } from './logic.js';
import { getWeek } from '../config/weeks/index.js';
import { estimateMinutes } from '../screens/workout.js';
import { addDays, diffDays, today } from './dates.js';

const KCAL_PER_KG = 7700;

export function workoutKcal(state, date, kg) {
  let kcal = 0, sessions = 0;
  for (const s of Object.values(state.sessions)) {
    if (!s.completedAt || s.date !== date) continue;
    const day = getWeek(s.week)?.days[s.key];
    if (!day) continue;
    const f = day.finisher;
    const fin = f.kind === 'interval' ? Math.round((f.rounds * (f.work + f.easy)) / 60) : f.minutes;
    const strength = Math.max(0, estimateMinutes(day) - fin);
    // net METs above resting: lifting about 3, hard finisher about 7
    kcal += kg * ((strength / 60) * 3 + (fin / 60) * 7);
    sessions++;
  }
  return { kcal: Math.round(kcal), sessions };
}

export function dayEnergy(state, date) {
  const t = dailyTargets(state);
  const base = t.bmr * 1.2;
  const stepsKcal = Math.max(0, (state.steps[date] || 0) - 3000) * 0.04 * (t.kg / 70);
  const w = workoutKcal(state, date, t.kg);
  const burn = Math.round(base + stepsKcal + w.kcal);
  const eaten = dayTotals(state, date).kcal;
  return { date, base: Math.round(base), steps: Math.round(stepsKcal), workout: w.kcal, sessions: w.sessions, burn, eaten, gap: burn - eaten, logged: eaten >= 1000 };
}

export function energyReport(state, now = today(), span = 7) {
  const rows = Array.from({ length: span }, (_, i) => dayEnergy(state, addDays(now, i - span + 1)));
  const done = rows.filter((r) => r.logged && r.date < now); // skip today: the day is not over
  const total = done.reduce((a, r) => a + r.gap, 0);
  const avg = done.length ? total / done.length : null;
  const workoutTotal = done.reduce((a, r) => a + r.workout, 0);
  const workoutAll = rows.reduce((a, r) => a + r.workout, 0);

  // reality check against the 7-day-average weight trend over the last 14 days
  let check = null;
  const tr = weightTrend(state).filter((t) => diffDays(now, t.date) <= 14 && diffDays(now, t.date) >= 0);
  if (tr.length >= 2 && done.length >= 4) {
    const a = tr[0], b = tr[tr.length - 1];
    const days = diffDays(b.date, a.date);
    if (days >= 6) {
      const actual = b.trend - a.trend;
      const predicted = -(avg * days) / KCAL_PER_KG;
      check = { actual, predicted, days };
    }
  }
  return { rows, loggedDays: done.length, avg, total, projectedKg: total / KCAL_PER_KG, workoutTotal, workoutAll, share: total > 0 ? workoutTotal / total : null, check };
}
