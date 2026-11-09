import * as store from './store.js';
import { currentWeek } from './schedule.js';
import { getWeek } from '../config/weeks/index.js';

/** Saves { date: steps } and ticks the step-goal habit when the goal for that week is met. Returns days saved. */
export function applySteps(map) {
  let n = 0;
  store.update((s) => {
    for (const [d, v] of Object.entries(map)) {
      s.steps[d] = v;
      const w = s.profile ? currentWeek(s, d) : 0;
      const goal = w >= 1 && w <= 12 ? getWeek(w).steps : 7000;
      (s.habits[d] ||= {}).steps = v >= goal;
      n++;
    }
  });
  return n;
}
