import * as store from '../core/store.js';
import { phases, phaseOfWeek } from '../config/phases.js';
import { getWeek } from '../config/weeks/index.js';
import { fmtDay, today } from '../core/dates.js';
import { TOTAL_WEEKS, currentWeek, entryStatus, weekDoneCount, weekPlan } from '../core/schedule.js';
import { h, icon } from '../ui/kit.js';
import { estimateMinutes } from './workout.js';
import { sfx } from '../audio/sfx.js';

let viewWeek = null;
const STATUS = { done: ['Done', 'good'], missed: ['Missed', 'warn'], today: ['Today', 'accent'], upcoming: ['Planned', ''], skipped: ['Skipped', ''], rest: ['Rest', 'ghost'] };

export function renderWeek(root) {
  const state = store.get();
  const cw = currentWeek(state);
  if (viewWeek == null) viewWeek = Math.min(TOTAL_WEEKS, Math.max(1, cw));
  const wrap = h('div', { class: 'screen week' });
  root.append(wrap);
  draw();

  function draw() {
    wrap.replaceChildren();
    const w = viewWeek, wk = getWeek(w), phase = phaseOfWeek(w);
    const plan = weekPlan(state, w);

    wrap.append(h('header', { class: 'top' }, h('div', { class: 'eyebrow' }, `Phase ${phase.index} · ${phase.name}`), h('h1', { class: 'display-l' }, `Week ${w}`)));

    // roadmap
    wrap.append(h('div', { class: 'roadmap', role: 'tablist', 'aria-label': 'Programme weeks' }, Array.from({ length: 12 }, (_, i) => {
      const n = i + 1, done = weekDoneCount(state, n);
      return h('button', { class: `rm${n === w ? ' on' : ''}${n === cw ? ' now' : ''}${done === 3 ? ' full' : ''}${[4, 8].includes(n) ? ' dl' : ''}`, role: 'tab', 'aria-selected': String(n === w), 'aria-label': `Week ${n}`, onclick: () => { viewWeek = n; sfx.tick(); draw(); } },
        h('span', null, String(n)), h('i', { style: { transform: `scaleY(${done / 3})` } }));
    })));
    wrap.append(h('div', { class: 'phase-legend' }, ['Foundation 1–4', 'Build 5–8', 'Peak 9–12'].map((t) => h('span', null, t))));

    wrap.append(h('div', { class: 'week-nav' },
      h('button', { class: 'icon-btn', 'aria-label': 'Previous week', disabled: w <= 1, onclick: () => { viewWeek--; draw(); } }, icon('back', 20)),
      h('div', { class: 'center' }, h('b', null, wk.focus), h('span', { class: 'muted small' }, `${weekDoneCount(state, w)}/3 core sessions${wk.deload ? ' · Deload' : ''}`)),
      h('button', { class: 'icon-btn', 'aria-label': 'Next week', disabled: w >= TOTAL_WEEKS, onclick: () => { viewWeek++; draw(); } }, icon('chev', 20))));

    wrap.append(h('div', { class: 'coach card flat' }, h('p', null, wk.coach), h('p', { class: 'muted small' }, `Step goal: ${wk.steps.toLocaleString()} a day`)));

    const now = today();
    wrap.append(h('ul', { class: 'days' }, plan.map((e) => {
      const st = entryStatus(state, w, e, now);
      const [label, tone] = STATUS[st];
      const d = e.key ? wk.days[e.key] : null;
      const body = [
        h('div', { class: 'day-date' }, h('b', null, fmtDay(e.date, { weekday: 'short' })), h('span', null, fmtDay(e.date, { day: 'numeric', month: 'short' }))),
        h('div', { class: 'day-main' }, h('b', null, d ? d.title : 'Rest day'), h('span', { class: 'muted' }, d ? `${d.subtitle} · ~${estimateMinutes(d)} min${e.optional ? ' · optional' : ''}` : 'Walk, stretch, recover')),
        h('span', { class: `chip ${tone}` }, e.optional && st === 'upcoming' ? 'Optional' : label),
      ];
      return h('li', { class: `day ${st}` }, e.key ? h('a', { class: 'day-link', href: `#/session/${w}/${e.key}` }, body, icon('chev', 18)) : h('div', { class: 'day-link' }, body));
    })));

    wrap.append(h('section', { class: 'card' }, h('div', { class: 'eyebrow' }, `${phase.name} rules`), h('p', { class: 'muted' }, phase.blurb), h('ul', { class: 'tips' }, phase.rules.map((r) => h('li', null, r))), h('p', { class: 'muted small' }, `Sessions run about ${phase.minutes} minutes, finisher included.`)));
  }
}
