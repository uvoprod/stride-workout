// One-time generator that writes the 12 explicit week files in src/config/weeks/.
// After generating, the week files are plain data — edit them by hand.
// WARNING: running `npm run weeks` again overwrites any hand edits.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'config', 'weeks');
mkdirSync(out, { recursive: true });

const phaseOf = (w) => (w <= 4 ? 'foundation' : w <= 8 ? 'build' : 'peak');
const DELOAD = new Set([4, 8]);

// sets per week: [main, accessory]
const SETS = { 1: [2, 2], 2: [3, 2], 3: [3, 3], 4: [2, 2], 5: [3, 3], 6: [3, 3], 7: [4, 3], 8: [2, 2], 9: [4, 3], 10: [4, 4], 11: [4, 4], 12: [3, 3] };
const REST_MAIN = { 1: 90, 2: 75, 3: 75, 4: 90, 5: 75, 6: 60, 7: 60, 8: 75, 9: 60, 10: 60, 11: 60, 12: 75 };
const REST_ACC = { 1: 60, 2: 60, 3: 60, 4: 60, 5: 60, 6: 45, 7: 45, 8: 60, 9: 45, 10: 45, 11: 45, 12: 60 };
const REST_PAIR = { 9: 60, 10: 45, 11: 45 }; // rest after finishing both moves of a superset
const RPE = { 1: '6', 2: '6–7', 3: '7', 4: '5–6', 5: '7', 6: '7–8', 7: '8', 8: '6', 9: '8', 10: '8', 11: '8–9', 12: '7–8' };
const STEPS = { 1: 7000, 2: 7000, 3: 7500, 4: 7500, 5: 8500, 6: 8500, 7: 9000, 8: 9000, 9: 10000, 10: 10000, 11: 10000, 12: 10000 };
const PLANK = { 1: [20, 30], 2: [25, 35], 3: [30, 40], 4: [20, 30], 5: [30, 45], 6: [35, 50], 7: [40, 55], 8: [30, 40], 9: [45, 60], 10: [50, 65], 11: [55, 70], 12: [45, 60] };

const MAIN = [8, 10];
const ACC = [10, 12];

const COACH = {
  1: ['Learn the movements', 'Leave 3–4 reps in the tank on every set. This week is for clean form and finishing every session, not for heavy weights.'],
  2: ['Add a set', 'A third set on the big lifts. Same easy effort. If your form slips, end the set.'],
  3: ['Own the rhythm', 'Rest drops a little. If a lift felt easy last time, add 1–2 reps before you add weight.'],
  4: ['Deload week', 'An easier week on purpose: fewer sets, lighter weights. Recovery is when the gains lock in. It is also jump retest week.'],
  5: ['Build begins', 'Phase 2: more sets, more weight where the app suggests it, and shorter rests. Finishers get tougher.'],
  6: ['Tighter rests', 'Rest drops to about 60 s. Keep your form tidy even when you are breathing hard.'],
  7: ['Hardest week of Build', 'Big lifts get a 4th set. Expect it to be hard. End a set one rep before form breaks.'],
  8: ['Deload week', 'Lighter again, with a jump retest. You are two-thirds done. Be proud of that.'],
  9: ['Supersets begin', 'Exercises come in pairs: do both back to back, then rest. Move briskly between them.'],
  10: ['Highest workload', 'The most work of the whole plan. Eat, drink, sleep and hit your steps so you can handle it.'],
  11: ['Final push', 'Last hard week. Chase small wins: one more rep, one more round, one cleaner jump.'],
  12: ['Test week', 'Volume comes down so you are fresh. Do the jump test on Day 3 and compare it with week 1.'],
};

const x = (ex, sets, reps, rest, extra = {}) => ({ ex, sets, reps, rest, ...extra });

function pair(letter, a, b, w) {
  return [{ ...a, group: letter + '1', rest: 0 }, { ...b, group: letter + '2', rest: REST_PAIR[w] }];
}

function pushSlots(w) {
  const p = phaseOf(w), [m, a] = SETS[w], rm = REST_MAIN[w], ra = REST_ACC[w], rpe = RPE[w];
  const R = (o) => ({ rpe, ...o });
  if (p === 'foundation') return [
    x('chest-press-machine', m, MAIN, rm, R({ note: 'Find a weight that leaves 3–4 reps in the tank.' })),
    x('incline-db-press', m, MAIN, rm, R()),
    x('shoulder-press-machine', m, MAIN, rm, R()),
    x('lateral-raise', a, [12, 15], ra, R()),
    x('triceps-pushdown', a, ACC, ra, R()),
  ];
  if (p === 'build') return [
    x('chest-press-machine', m, MAIN, rm, R({ note: 'Tempo: 2 s down, 1 s up.' })),
    x('incline-db-press', m, MAIN, rm, R()),
    x('db-shoulder-press', m, MAIN, rm, R()),
    x('cable-fly', a, [12, 15], ra, R()),
    x('lateral-raise', a, [12, 15], ra, R()),
    x('triceps-rope', a, ACC, ra, R()),
  ];
  return [
    x('incline-db-press', m, MAIN, rm, R({ note: 'Your heavy lift. Stay clean.' })),
    ...pair('A', x('chest-press-machine', a, [10, 12], 0, R()), x('lateral-raise', a, [12, 15], 0, R()), w),
    ...pair('B', x('db-shoulder-press', a, MAIN, 0, R()), x('triceps-rope', a, [12, 15], 0, R()), w),
  ];
}

function pullSlots(w) {
  const p = phaseOf(w), [m, a] = SETS[w], rm = REST_MAIN[w], ra = REST_ACC[w], rpe = RPE[w];
  const R = (o) => ({ rpe, ...o });
  if (p === 'foundation') return [
    x('lat-pulldown', m, MAIN, rm, R({ note: 'Think elbows to pockets, not hands to chest.' })),
    x('seated-cable-row', m, MAIN, rm, R()),
    x('face-pull', a, [12, 15], ra, R({ rpe: '5–6', note: 'Light. This is for shoulder health.' })),
    x('db-curl', a, ACC, ra, R()),
    x('dead-bug', a, [6, 8], ra, R({ rpe: '—', note: 'Reps per side. Slow.' })),
    x('plank', a, PLANK[w], ra, R({ rpe: '—', note: 'Seconds.' })),
  ];
  if (p === 'build') return [
    x('lat-pulldown', m, MAIN, rm, R({ note: 'Tempo: 2 s down, 1 s up.' })),
    x('chest-supported-row', m, MAIN, rm, R()),
    x('face-pull', a, [12, 15], ra, R({ rpe: '6' })),
    x('hammer-curl', a, ACC, ra, R()),
    x('pallof-press', a, [10, 12], ra, R({ rpe: '6–7', note: 'Reps per side.' })),
    x('plank', a, PLANK[w], ra, R({ rpe: '—', note: 'Seconds.' })),
  ];
  return [
    x('lat-pulldown', m, MAIN, rm, R({ note: 'Your heavy lift. Stay clean.' })),
    ...pair('A', x('chest-supported-row', a, [10, 12], 0, R()), x('face-pull', a, [12, 15], 0, R({ rpe: '6' })), w),
    ...pair('B', x('db-curl', a, [10, 12], 0, R()), x('cable-crunch', a, [12, 15], 0, R()), w),
    x('plank', a, PLANK[w], ra, R({ rpe: '—', note: 'Seconds.' })),
  ];
}

const JUMPS = {
  1: [x('jump-test', 1, [3, 3], 45, { rpe: '—', attempts: 3, note: 'Baseline. Best of 3 — your starting number.' }), x('vertical-jump', 2, [3, 3], 60, { rpe: '—', note: 'Soft landings. Stick each one for 1 s.' })],
  2: [x('vertical-jump', 3, [3, 3], 60, { rpe: '—', note: 'Soft landings. Stick each one for 1 s.' })],
  3: [x('vertical-jump', 4, [3, 3], 60, { rpe: '—', note: 'Reset fully between jumps.' })],
  4: [x('jump-test', 1, [3, 3], 45, { rpe: '—', attempts: 3, note: 'Deload-week retest. You are fresh, so give it a go.' })],
  5: [x('vertical-jump', 4, [3, 3], 60, { rpe: '—', note: 'Max intent, quiet landing.' })],
  6: [x('vertical-jump', 3, [3, 3], 60, { rpe: '—' }), x('broad-jump', 2, [3, 3], 60, { rpe: '—', note: 'Stick the landing in a quarter squat.' })],
  7: [x('vertical-jump', 3, [3, 3], 60, { rpe: '—' }), x('broad-jump', 2, [3, 3], 60, { rpe: '—', note: 'Stick the landing in a quarter squat.' })],
  8: [x('jump-test', 1, [3, 3], 45, { rpe: '—', attempts: 3, note: 'Deload-week retest. Compare with week 4.' })],
  9: [x('vertical-jump', 3, [3, 3], 60, { rpe: '—' }), x('pogo-hops', 1, [6, 6], 60, { rpe: '—', note: 'Small, stiff-ankle hops. Stop if shins complain.' })],
  10: [x('vertical-jump', 3, [3, 3], 60, { rpe: '—' }), x('broad-jump', 2, [3, 3], 60, { rpe: '—' })],
  11: [x('vertical-jump', 3, [4, 4], 60, { rpe: '—', note: '4 jumps per set. Quality only.' }), x('broad-jump', 1, [3, 3], 60, { rpe: '—' })],
  12: [x('jump-test', 1, [3, 3], 45, { rpe: '—', attempts: 5, note: 'FINAL TEST. Up to 5 tries — best one counts. Compare with week 1.' })],
};

function legsSlots(w) {
  const p = phaseOf(w), [m, a] = SETS[w], rm = REST_MAIN[w], ra = REST_ACC[w], rpe = RPE[w];
  const R = (o) => ({ rpe, ...o });
  const jumps = JUMPS[w];
  if (p === 'foundation') return [
    ...jumps,
    x('goblet-squat', m, MAIN, rm, R({ note: 'Sit between your hips. Chest tall.' })),
    x('db-rdl', m, MAIN, rm, R()),
    x('reverse-lunge', a, [6, 8], ra, R({ note: w === 1 ? 'Bodyweight, hold a rail. Reps per leg.' : 'Reps per leg. Add light dumbbells when it feels easy.' })),
    x('leg-press', a, ACC, ra, R()),
    x('calf-raise-standing', a, [12, 15], ra, R()),
  ];
  if (p === 'build') return [
    ...jumps,
    x('goblet-squat', m, MAIN, rm, R({ note: 'Tempo: 2 s down, 1 s up.' })),
    x('db-rdl', m, MAIN, rm, R()),
    x('split-squat', a, [8, 10], ra, R({ note: 'Reps per leg.' })),
    x('leg-press', a, ACC, ra, R()),
    x('glute-bridge', a, [12, 15], ra, R({ rpe: '6–7' })),
    x('calf-raise-standing', a, [12, 15], ra, R()),
  ];
  return [
    ...jumps,
    x('goblet-squat', m, MAIN, rm, R({ note: 'Your heavy lift. Stay clean.' })),
    ...pair('A', x('db-rdl', a, MAIN, 0, R()), x('calf-raise-standing', a, [12, 15], 0, R()), w),
    ...pair('B', x('walking-lunge', a, [8, 10], 0, R({ note: 'Reps per leg.' })), x('glute-bridge', a, [12, 15], 0, R({ rpe: '6–7' })), w),
    x('leg-press', a, [10, 12], ra, R()),
  ];
}

const CIRC = {
  foundation: { 'goblet-squat': [10, 10], 'db-row': [10, 10], 'incline-pushup': [8, 8], 'farmer-carry': [30, 30], 'dead-bug': [6, 6] },
  build: { 'goblet-squat': [12, 12], 'db-row': [12, 12], 'incline-pushup': [10, 10], 'farmer-carry': [40, 40], 'dead-bug': [8, 8] },
  peak: { 'goblet-squat': [12, 12], 'db-row': [12, 12], 'incline-pushup': [12, 12], 'farmer-carry': [40, 40], 'dead-bug': [10, 10] },
};
const CIRC_ROUNDS = { 1: 2, 2: 2, 3: 3, 4: 2, 5: 3, 6: 3, 7: 3, 8: 2, 9: 4, 10: 4, 11: 4, 12: 3 };
const COND_INT = { 1: [6, 30, 60], 2: [7, 30, 60], 3: [8, 30, 60], 4: [5, 30, 60], 5: [8, 30, 45], 6: [9, 30, 45], 7: [10, 30, 45], 8: [6, 30, 45], 9: [10, 40, 50], 10: [11, 40, 50], 11: [12, 40, 50], 12: [10, 40, 50] };

function condSlots(w) {
  const p = phaseOf(w), [rounds, work, easy] = COND_INT[w];
  const mv = CIRC[p];
  return [
    { block: 'interval', ex: 'bike-intervals', title: 'Bike intervals', rounds, work, easy, workLabel: 'Hard', easyLabel: 'Easy spin', rpe: '8 on the hard bursts, 3 on the easy ones', note: 'Low impact on the knees. Raise the resistance slightly each time it feels easy.' },
    {
      block: 'circuit', title: 'Light full-body circuit', rounds: CIRC_ROUNDS[w], restBetween: p === 'foundation' ? 60 : 45, rpe: '6',
      moves: Object.entries(mv).map(([ex, [lo, hi]]) => (ex === 'farmer-carry' ? { ex, seconds: hi } : { ex, reps: [lo, hi] })),
      note: 'Light dumbbells. Move steadily and take 20 s between moves, then rest between rounds.',
    },
  ];
}

const BIKE = { 1: [5, 20, 40], 2: [6, 20, 40], 3: [6, 25, 35], 4: [5, 20, 40], 5: [7, 30, 30], 6: [8, 30, 30], 7: [8, 35, 25], 8: [6, 30, 30], 9: [9, 30, 30], 10: [10, 30, 30], 11: [10, 40, 20], 12: [10, 40, 20] };
const WALK = { 1: [5, 4, 4.5], 2: [6, 5, 4.5], 3: [7, 6, 4.5], 4: [5, 5, 4.5], 5: [8, 7, 4.8], 6: [8, 8, 4.8], 7: [9, 8, 5.0], 8: [6, 7, 4.8], 9: [10, 9, 5.0], 10: [10, 10, 5.0], 11: [10, 10, 5.2], 12: [10, 10, 5.2] };
const CARRY = { 1: [5, 20, 40], 2: [5, 25, 35], 3: [6, 25, 35], 4: [5, 20, 40], 5: [6, 30, 30], 6: [7, 30, 30], 7: [8, 30, 30], 8: [6, 30, 30], 9: [8, 35, 25], 10: [9, 35, 25], 11: [10, 35, 25], 12: [10, 40, 20] };
const EASY = { 1: 5, 2: 5, 3: 6, 4: 5, 5: 7, 6: 7, 7: 8, 8: 6, 9: 9, 10: 9, 11: 10, 12: 8 };

function finisher(day, w) {
  if (day === 'push') {
    const [rounds, work, easy] = BIKE[w];
    return { kind: 'interval', title: 'Bike sprints', rounds, work, easy, workLabel: 'Hard', easyLabel: 'Easy spin', effort: 'Hard bursts at RPE 8–9, easy spins at RPE 3.', alt: 'No bike? Rower or elliptical, same timing.' };
  }
  if (day === 'pull') {
    const [minutes, incline, speed] = WALK[w];
    const f = { kind: 'steady', title: 'Incline walk', minutes, incline, speed, effort: `Treadmill at ${incline}% incline, about ${speed} km/h. Do not hold the rails. You can speak in short sentences.`, alt: 'No treadmill? Stairmaster or stairs at a steady pace.' };
    if (w >= 11) f.pickups = { every: 150, sec: 30, note: 'Every 2½ min, walk 30 s faster.' };
    return f;
  }
  if (day === 'legs') {
    const [rounds, work, easy] = CARRY[w];
    return { kind: 'interval', title: 'Carry + sled rounds', rounds, work, easy, workLabel: 'Carry or sled push', easyLabel: 'Walk it off', effort: 'Moderate-heavy farmer carries or a light sled push. Tall posture, steady steps.', alt: 'No sled? Farmer carries or a weighted walk with dumbbells.' };
  }
  return { kind: 'steady', title: 'Easy cardio', minutes: EASY[w], incline: 0, speed: null, effort: 'Easy bike or walk at talk pace (RPE 4). Let your heart rate settle.', alt: 'Any easy cardio machine works.' };
}

const DAYS = {
  push: { title: 'Push', subtitle: 'Chest · Shoulders · Triceps', slots: pushSlots },
  pull: { title: 'Pull', subtitle: 'Back · Biceps · Core', slots: pullSlots },
  legs: { title: 'Legs + Jump', subtitle: 'Jump · Squat · Hinge · Lunge · Calves', slots: legsSlots },
  cond: { title: 'Conditioning', subtitle: 'Cardio intervals · Light circuit', slots: condSlots, optional: true },
};

const fmtSlot = (s) => '        ' + JSON.stringify(s).replace(/"(\w+)":/g, '$1: ').replace(/,(?=\S)/g, ', ').replace(/\{/g, '{ ').replace(/\}$/, ' }') + ',';

function fmtObj(o) { return JSON.stringify(o).replace(/"(\w+)":/g, '$1: ').replace(/,(?=\S)/g, ', ').replace(/^\{/, '{ ').replace(/\}$/, ' }'); }

const names = [];
for (let w = 1; w <= 12; w++) {
  const [focus, coach] = COACH[w];
  let t = `// Week ${w} · ${phaseOf(w)[0].toUpperCase() + phaseOf(w).slice(1)}${DELOAD.has(w) ? ' · DELOAD' : ''}\n`;
  t += `export default {\n  week: ${w},\n  phase: '${phaseOf(w)}',\n  deload: ${DELOAD.has(w)},\n  steps: ${STEPS[w]},\n  focus: ${JSON.stringify(focus)},\n  coach: ${JSON.stringify(coach)},\n  days: {\n`;
  for (const [key, d] of Object.entries(DAYS)) {
    t += `    ${key}: {\n      title: ${JSON.stringify(d.title)},\n      subtitle: ${JSON.stringify(d.subtitle)},\n${d.optional ? '      optional: true,\n' : ''}      slots: [\n`;
    t += d.slots(w).map((s) => '        ' + fmtObj(s) + ',').join('\n') + '\n      ],\n';
    t += `      finisher: ${fmtObj(finisher(key, w))},\n    },\n`;
  }
  t += '  },\n};\n';
  const name = `week${String(w).padStart(2, '0')}`;
  names.push(name);
  writeFileSync(join(out, name + '.js'), t);
}

writeFileSync(
  join(out, 'index.js'),
  names.map((n) => `import ${n} from './${n}.js';`).join('\n') + `\n\nexport const weeks = [\n  ${names.join(',\n  ')},\n];\n\nexport const getWeek = (n) => weeks[n - 1];\n`,
);
console.log('Wrote', names.length, 'week files to', out);
