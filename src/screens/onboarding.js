import * as store from '../core/store.js';
import { WEEKDAYS, today } from '../core/dates.js';
import { h } from '../ui/kit.js';
import { sfx } from '../audio/sfx.js';
import { theme } from '../config/theme.js';

export function renderOnboarding(root, done) {
  const sel = { trainDays: [1, 3, 5], optionalDay: 6 };
  const name = h('input', { class: 'txt-in', type: 'text', placeholder: 'Your name (optional)', 'aria-label': 'Name' });
  const date = h('input', { class: 'txt-in', type: 'date', value: today(), 'aria-label': 'Start date' });
  const weight = h('input', { class: 'txt-in', type: 'text', inputmode: 'decimal', placeholder: 'Optional, e.g. 85', 'aria-label': 'Starting weight in kg' });
  const days = h('div', { class: 'wd-pick' });
  const draw = () => days.replaceChildren(...[1, 2, 3, 4, 5, 6, 0].map((d) => h('button', { class: `wd${sel.trainDays.includes(d) ? ' core' : ''}${sel.optionalDay === d ? ' opt' : ''}`, 'aria-pressed': String(sel.trainDays.includes(d) || sel.optionalDay === d), onclick: () => {
    if (sel.trainDays.includes(d)) { if (sel.trainDays.length > 3) sel.trainDays = sel.trainDays.filter((x) => x !== d); }
    else if (sel.optionalDay === d) sel.optionalDay = null;
    else if (sel.trainDays.length < 3) sel.trainDays = [...sel.trainDays, d].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
    else sel.optionalDay = d;
    draw();
  } }, WEEKDAYS[d])));
  draw();
  const screen = h('div', { class: 'onboard' },
    h('div', { class: 'ob-brand' }, theme.brand),
    h('h1', { class: 'display-xl' }, '12 weeks.', h('br'), 'Lean, strong,', h('br'), 'higher jump.'),
    h('p', { class: 'muted' }, 'A Push / Pull / Legs plan built for a beginner. Three sessions a week, an optional fourth, and a daily dashboard to keep you honest.'),
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Name'), name),
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Start date'), date),
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Starting weight (kg)'), weight),
    h('div', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Training days'), days, h('p', { class: 'muted small' }, 'Dark = Push, Pull, Legs in order. Orange outline = optional conditioning. Tap a day to move things around.')),
    h('button', { class: 'btn primary big', onclick: () => {
      sfx.unlock(); sfx.set(3);
      store.update((s) => {
        s.profile = { name: name.value.trim(), startDate: date.value || today(), startWeight: parseFloat(weight.value.replace(',', '.')) || null, trainDays: sel.trainDays, optionalDay: sel.optionalDay };
      });
      screen.remove();
      done();
    } }, 'Start week 1'));
  root.append(screen);
}
