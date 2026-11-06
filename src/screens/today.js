// Today: ring hero, today's session, daily check-in, quote, reset button.
import * as store from '../core/store.js';
import { quotes, resetMessages, resetAction, stepsNote } from '../config/content.js';
import { mobility } from '../config/stretches.js';
import { phaseOfWeek } from '../config/phases.js';
import { getWeek } from '../config/weeks/index.js';
import { addDays, dayOfYear, fmtDay, fmtShort, iso, parse, today } from '../core/dates.js';
import { fmtNum } from '../core/util.js';
import { TOTAL_WEEKS, isDone, todayView, weekDoneCount } from '../core/schedule.js';
import { habitStreak, progressCallout, sessionStreak, waistDue, checkBadges, programPct } from '../core/logic.js';
import { h, icon, openSheet, runSegments, tilt, toast } from '../ui/kit.js';
import { createRing } from '../three/scenes.js';
import { renderWorkout, stretchSegments } from './workout.js';
import { sfx } from '../audio/sfx.js';

export const stepGoal = (state, date = today()) => {
  const v = todayView(state, date);
  return v.week ? getWeek(v.week).steps : 7000;
};

export function weeksState(state, w) {
  return Array.from({ length: 12 }, (_, i) => (weekDoneCount(state, i + 1) === 3 ? 'done' : i + 1 === w ? 'current' : ''));
}

export function renderToday(root, cleanups) {
  const state = store.get();
  const now = today();
  const view = todayView(state, now);
  const wrap = h('div', { class: 'screen today' });
  root.append(wrap);

  const name = state.profile.name?.trim();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  wrap.append(h('header', { class: 'top' },
    h('div', { class: 'eyebrow' }, fmtDay(now, { weekday: 'long', day: 'numeric', month: 'long' })),
    h('h1', { class: 'display-l' }, name ? `${greet}, ${name}` : greet)));

  // hero ring
  const w = view.week;
  const phase = w ? phaseOfWeek(w) : null;
  const pct = programPct(state);
  const ringBox = h('div', { class: 'hero-ring' });
  const hero = h('section', { class: 'hero card' },
    ringBox,
    h('div', { class: 'hero-info' },
      h('div', { class: 'eyebrow' }, w ? `Week ${w} of ${TOTAL_WEEKS}` : view.kind === 'before' ? 'Not started' : 'Programme complete'),
      h('div', { class: 'hero-phase' }, phase ? phase.name : 'Stride'),
      h('div', { class: 'hero-stats' },
        stat('flame', sessionStreak(state), 'in a row'),
        stat('check', habitStreak(state), 'day habit streak'))));
  wrap.append(hero);
  tilt(hero, 4);
  requestAnimationFrame(() => {
    const ring = createRing(ringBox, { progress: pct, weeks: weeksState(state, w) });
    ringBox.append(h('div', { class: 'ring-center' }, h('span', { class: 'big-num' }, `${Math.round(pct * 100)}`, h('small', null, '%')), h('span', { class: 'muted small' }, 'done')));
    cleanups.push(() => ring.dispose());
  });

  // quote
  const q = quotes[(dayOfYear(now) + (state.profile.name?.length || 0)) % quotes.length];
  wrap.append(h('blockquote', { class: 'quote' }, q));

  // body by state
  if (view.kind === 'before') {
    wrap.append(h('div', { class: 'card' }, h('h2', null, 'Your plan starts soon'), h('p', { class: 'muted' }, `Week 1 begins on ${fmtDay(state.profile.startDate)}. Want to start today instead?`),
      h('button', { class: 'btn primary', onclick: () => { store.update((s) => { s.profile.startDate = now; }); location.hash = '#/today'; location.reload(); } }, 'Start today')));
  } else if (view.kind === 'finished') {
    wrap.append(h('div', { class: 'card' }, h('h2', null, 'Twelve weeks done'), h('p', { class: 'muted' }, 'You finished the programme. Check your Progress tab for the full story, and think about what you want next.'), h('a', { class: 'btn primary', href: '#/progress' }, 'See progress')));
  } else {
    const e = view.entry;
    const missed = view.plan.filter((x) => x.key && !x.optional && x.date < now && !isDone(state, w, x.key));
    if (missed.length) {
      wrap.append(h('div', { class: 'note-card' }, h('b', null, `${getWeek(w).days[missed[0].key].title} is still open.`), h('span', null, ' Missed sessions are never lost. Fit it into a rest day this week.'), h('a', { class: 'link-btn', href: `#/session/${w}/${missed[0].key}` }, `Open ${getWeek(w).days[missed[0].key].title}`)));
    }
    if (e?.key) {
      const holder = h('div');
      wrap.append(holder);
      renderWorkout(holder, w, e.key);
    } else {
      wrap.append(restDay(state, view, now));
    }
  }

  if (state.profile) wrap.append(checkin(state, now, view));

  const call = progressCallout(state);
  wrap.append(h('section', { class: `callout card ${call.tone}` }, h('div', { class: 'eyebrow' }, 'Your progress'), h('div', { class: 'callout-row' }, h('span', { class: 'display-xl' }, call.big), h('span', { class: 'callout-text' }, call.text))));

  wrap.append(h('button', { class: 'reset-btn', onclick: openReset }, 'I ate too much yesterday'));
}

const stat = (ic, n, label) => h('div', { class: 'hstat' }, icon(ic, 18), h('b', null, String(n)), h('span', null, label));

function restDay(state, view, now) {
  const { week: w, plan } = view;
  const next = plan.find((x) => x.key && !isDone(state, w, x.key) && x.date > now);
  const open = plan.find((x) => x.key && !x.optional && !isDone(state, w, x.key) && x.date <= now);
  const cond = plan.find((x) => x.key === 'cond' && !isDone(state, w, 'cond'));
  const c = h('section', { class: 'card rest' },
    h('div', { class: 'eyebrow' }, 'Rest day'),
    h('h2', { class: 'display-l' }, 'Recover. Walk. Eat well.'),
    h('p', { class: 'muted' }, next ? `Next up: ${getWeek(w).days[next.key].title} on ${fmtDay(next.date)}.` : 'No sessions left this week.'),
    h('div', { class: 'row-actions' },
      h('button', { class: 'btn primary', onclick: () => { sfx.unlock(); runSegments(mobility.title, stretchSegments(mobility.moves)); } }, icon('stretch', 18), ' Mobility reset · 6 min'),
      open && h('a', { class: 'btn', href: `#/session/${w}/${open.key}` }, `Train ${getWeek(w).days[open.key].title} anyway`),
      !open && next && next.key !== 'cond' && h('a', { class: 'btn', href: `#/session/${w}/${next.key}` }, `Do ${getWeek(w).days[next.key].title} early`),
      cond && h('a', { class: 'btn', href: `#/session/${w}/cond` }, 'Optional conditioning')));
  c.append(h('ul', { class: 'stretch-list compact' }, mobility.moves.map((s) => h('li', null, h('div', null, h('b', null, s.name)), h('span', { class: 'hold' }, `${s.hold} s${s.sides === 2 ? ' × 2' : ''}`)))));
  return c;
}

// ── daily check-in ──────────────────────────────────────────────────────────
export function checkin(state, now, view) {
  const goal = stepGoal(state, now);
  const steps = state.steps[now] || 0;
  const w = view?.week || 0;
  const card = h('section', { class: 'card checkin' }, h('div', { class: 'sec-head' }, h('h2', null, 'Daily check-in')));

  // steps
  const bar = h('div', { class: 'steps-fill', style: { transform: `scaleX(${Math.min(1, steps / goal)})` } });
  const stepsIn = h('input', { class: 'num-in', type: 'text', inputmode: 'numeric', 'aria-label': 'Steps today', placeholder: '0', value: steps ? String(steps) : '' });
  const label = h('span', { class: 'muted' }, `${steps.toLocaleString()} / ${goal.toLocaleString()}`);
  const saveSteps = () => {
    const v = parseInt(stepsIn.value.replace(/[^\d]/g, ''), 10) || 0;
    store.update((s) => { s.steps[now] = v; (s.habits[now] ||= {}).steps = v >= goal; });
    bar.style.transform = `scaleX(${Math.min(1, v / goal)})`;
    label.textContent = `${v.toLocaleString()} / ${goal.toLocaleString()}`;
    if (v >= goal) { sfx.set(4); toast('Step goal hit'); } else sfx.tick();
  };
  stepsIn.addEventListener('change', saveSteps);
  card.append(h('div', { class: 'ci-row' }, h('div', { class: 'ci-label' }, icon('steps', 20), h('div', null, h('b', null, 'Steps'), label)), stepsIn, h('button', { class: 'btn small', onclick: saveSteps }, 'Save')),
    h('div', { class: 'steps-track' }, bar), h('p', { class: 'muted small' }, stepsNote));

  // weight
  const wt = state.weights[now];
  const wIn = h('input', { class: 'num-in', type: 'text', inputmode: 'decimal', 'aria-label': 'Body weight in kilograms', placeholder: 'kg', value: wt ? String(wt) : '' });
  const saveW = () => {
    const v = parseFloat(wIn.value.replace(',', '.'));
    if (!v || v < 30 || v > 250) { toast('Enter your weight in kg.'); return; }
    store.update((s) => { s.weights[now] = v; });
    sfx.tick();
    toast('Logged. Only your 7-day trend matters.');
  };
  card.append(h('div', { class: 'ci-row' }, h('div', { class: 'ci-label' }, icon('progress', 20), h('div', null, h('b', null, 'Weigh-in'), h('span', { class: 'muted' }, 'Optional, morning is best'))), wIn, h('button', { class: 'btn small', onclick: saveW }, 'Save')));

  // waist
  if (w && waistDue(state, w)) {
    const cm = h('input', { class: 'num-in', type: 'text', inputmode: 'decimal', 'aria-label': 'Waist in centimetres', placeholder: 'cm' });
    card.append(h('div', { class: 'ci-row due' }, h('div', { class: 'ci-label' }, icon('dumbbell', 20), h('div', null, h('b', null, 'Waist check-in due'), h('span', { class: 'muted' }, 'Relaxed, at the belly button'))), cm, h('button', { class: 'btn small', onclick: () => {
      const v = parseFloat(cm.value.replace(',', '.'));
      if (!v || v < 40 || v > 200) { toast('Enter your waist in cm.'); return; }
      store.update((s) => { s.waist[now] = v; checkBadges(s); });
      sfx.set(2); toast('Waist logged'); cm.disabled = true;
    } }, 'Save')));
  }
  card.append(h('a', { class: 'link-btn', href: '#/journal' }, 'Open habits and journal'));
  return card;
}

function openReset() {
  const m = resetMessages[Math.floor(Math.random() * resetMessages.length)];
  const sheet = openSheet('Reset', [
    h('h2', { class: 'display-l' }, m.title),
    h('p', null, m.body),
    h('p', { class: 'reset-action' }, resetAction),
    h('p', { class: 'muted small' }, 'No punishment workouts. No skipping meals. Same plan, today.'),
    h('button', { class: 'btn primary big', onclick: () => { store.update((s) => { s.ate[addDays(today(), -1)] = true; }); sfx.set(1); sheet.close(); toast('Back on plan. Let’s go.'); } }, 'Back on plan today'),
  ]);
}
