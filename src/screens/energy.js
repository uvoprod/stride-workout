import { energyReport } from '../core/energy.js';
import { fmtDay, today } from '../core/dates.js';
import { fmtNum } from '../core/util.js';
import { h } from '../ui/kit.js';

export function energyCard(state) {
  const r = energyReport(state);
  const card = h('section', { class: 'card energy' }, h('div', { class: 'sec-head' }, h('h2', null, 'Does it add up?')));
  if (r.ready === false) {
    card.append(h('p', { class: 'muted' }, 'To estimate what you burn, the app needs your weight, height and age. Add them in Food, then Targets & AI.'), h('a', { class: 'btn', href: '#/food' }, 'Open Food'));
    return card;
  }
  if (!r.loggedDays) {
    card.append(h('p', { class: 'muted' }, 'Log your food for a few full days (tap Food) and this shows whether what you eat plus your workouts leaves you in a deficit.'));
    return card;
  }
  const now = today();
  card.append(h('div', { class: 'metric' },
    h('span', { class: 'display-xl' }, `${r.avg >= 0 ? '' : '+'}${Math.abs(Math.round(r.avg)).toLocaleString()}`, h('small', null, r.avg >= 0 ? ' kcal/day deficit' : ' kcal/day surplus')),
    h('span', { class: `delta ${r.avg > 0 ? 'good' : ''}` }, `${r.loggedDays} logged day${r.loggedDays === 1 ? '' : 's'}`)));
  card.append(h('p', { class: 'muted' }, r.total > 0
    ? `At this pace that is roughly ${fmtNum(r.projectedKg, 2)} kg of fat over these days. A steady 0.25–0.5 kg a week is the target.`
    : 'You are eating about what you burn. That is maintenance. A small, steady gap is what drives fat loss.'));

  // per-day rows
  card.append(h('div', { class: 'en-grid hdr' }, h('span', null, 'Day'), h('span', null, 'Ate'), h('span', null, 'Burned'), h('span', null, 'Gap')));
  r.rows.forEach((x) => {
    const empty = !x.logged || x.date === now;
    card.append(h('div', { class: `en-grid${empty ? ' dim' : ''}` },
      h('span', null, h('b', null, fmtDay(x.date, { weekday: 'short' })), x.sessions ? h('i', { class: 'gym-dot', title: 'Workout day' }) : null),
      h('span', null, x.eaten ? x.eaten.toLocaleString() : '–'),
      h('span', null, x.burn.toLocaleString()),
      h('span', { class: x.logged && x.date !== now ? (x.gap > 0 ? 'pos' : 'neg') : '' }, x.logged && x.date !== now ? `${x.gap > 0 ? '−' : '+'}${Math.abs(x.gap).toLocaleString()}` : x.date === now ? 'today' : 'not logged')));
  });
  card.append(h('p', { class: 'muted small' }, 'Dot = workout day. "Burned" is resting needs plus normal daily life, steps and workouts. Days with under 1,000 kcal logged are skipped, because a half-empty log looks like a huge deficit.'));

  // workouts vs deficit
  const perDay = r.workoutAll / 7;
  card.append(h('div', { class: 'note-card' },
    h('b', null, `Your workouts burned about ${Math.round(r.workoutAll).toLocaleString()} kcal this week.`),
    h('span', null, ` That is roughly ${Math.round(perDay)} kcal a day. ${r.share != null && r.total > 0 ? `About ${Math.round(r.share * 100)}% of your deficit came from training` : 'Training helps'}, and most of the rest comes from how much you eat. Training also keeps your muscle while you lose fat and trains the jump.`)));

  // reality check
  if (r.check) {
    const { actual, predicted, days } = r.check;
    const gap = actual - predicted;
    const msg = gap > 0.4 ? 'You are losing slower than the maths predicts. The usual cause is missing food in the log (oil, ghee, snacks, drinks, bites). Log everything for a week and compare again.'
      : gap < -0.4 ? 'You are losing faster than predicted. Fine, but make sure you are eating enough protein and not skipping meals.'
      : 'Your scale trend matches the maths. The logging is accurate enough to trust.';
    card.append(h('div', { class: 'eyebrow' }, 'Reality check'),
      h('p', null, h('b', null, `Last ${days} days: `), `scale trend ${actual > 0 ? '+' : '−'}${fmtNum(Math.abs(actual), 1)} kg, maths predicted ${predicted > 0 ? '+' : '−'}${fmtNum(Math.abs(predicted), 1)} kg.`),
      h('p', { class: 'muted' }, msg));
  } else {
    card.append(h('p', { class: 'muted small' }, 'After about a week of food logs and weigh-ins, a reality check appears here: does the scale trend match the maths?'));
  }
  return card;
}
