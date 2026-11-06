import * as store from '../core/store.js';
import { habits, prompts } from '../config/content.js';
import { addDays, dayOfYear, fmtDay, today } from '../core/dates.js';
import { habitCount, checkBadges } from '../core/logic.js';
import { h, icon, barChart, toast } from '../ui/kit.js';
import { stepGoal } from './today.js';
import { sfx } from '../audio/sfx.js';

let day = null;

export function renderJournal(root) {
  const wrap = h('div', { class: 'screen journal' });
  root.append(wrap);
  if (!day) day = today();
  draw();

  function draw() {
    const state = store.get();
    wrap.replaceChildren();
    const isToday = day === today();
    wrap.append(h('header', { class: 'top' }, h('div', { class: 'eyebrow' }, 'Habits & journal'), h('h1', { class: 'display-l' }, isToday ? 'Today' : fmtDay(day, { weekday: 'long' }))));
    wrap.append(h('div', { class: 'week-nav' },
      h('button', { class: 'icon-btn', 'aria-label': 'Previous day', onclick: () => { day = addDays(day, -1); draw(); } }, icon('back', 20)),
      h('div', { class: 'center' }, h('b', null, fmtDay(day, { weekday: 'short', day: 'numeric', month: 'long' }))),
      h('button', { class: 'icon-btn', 'aria-label': 'Next day', disabled: isToday, onclick: () => { day = addDays(day, 1); draw(); } }, icon('chev', 20))));

    // habits
    const hab = state.habits[day] || {};
    const count = h('span', { class: 'muted' }, `${habitCount(state, day)}/${habits.length}`);
    const list = h('div', { class: 'habit-list' });
    habits.forEach((d) => {
      const on = !!hab[d.id];
      const btn = h('button', { class: 'check-row big', 'aria-pressed': String(on), onclick: () => {
        const v = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', v);
        v ? sfx.set(habitCount(store.get(), day)) : sfx.unset();
        store.update((s) => { (s.habits[day] ||= {})[d.id] = v; checkBadges(s); });
        count.textContent = `${habitCount(store.get(), day)}/${habits.length}`;
      } }, h('span', { class: 'box' }, icon('check', 18)), h('span', null, d.id === 'steps' ? `Hit the step goal (${stepGoal(state, day).toLocaleString()})` : d.label));
      list.append(btn);
    });
    wrap.append(h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Habits'), count), list, h('p', { class: 'muted small' }, 'Aim for most of them, not all of them. Three or more keeps your habit streak alive.')));

    // ratings
    const j = state.journal[day] || {};
    const save = (patch) => store.update((s) => { s.journal[day] = { ...(s.journal[day] || {}), ...patch }; checkBadges(s); });
    const rate = (key, label, hints) => {
      const row = h('div', { class: 'rate' }, h('div', { class: 'rate-head' }, h('b', null, label), h('span', { class: 'muted small' }, hints)), h('div', { class: 'seg five' }));
      const seg = row.querySelector('.seg');
      [1, 2, 3, 4, 5].forEach((n) => seg.append(h('button', { class: `seg-btn${(store.get().journal[day] || {})[key] === n ? ' on' : ''}`, 'aria-pressed': String((store.get().journal[day] || {})[key] === n), 'aria-label': `${label} ${n} of 5`, onclick: () => {
        sfx.tick(); save({ [key]: n });
        seg.querySelectorAll('.seg-btn').forEach((b, i) => { b.classList.toggle('on', i + 1 === n); b.setAttribute('aria-pressed', String(i + 1 === n)); });
      } }, String(n))));
      return row;
    };
    const prompt = j.prompt || prompts[(dayOfYear(day) + 1) % prompts.length];
    const wentWell = h('textarea', { class: 'txt', rows: 3, placeholder: 'Write a line or two…', 'aria-label': prompt }, j.wentWell || '');
    const note = h('textarea', { class: 'txt', rows: 3, placeholder: 'Anything else: how your body feels, what you ate, what is on your mind', 'aria-label': 'Note' }, j.note || '');
    let t;
    const debounced = (patch) => { clearTimeout(t); t = setTimeout(() => save(patch), 300); };
    wentWell.addEventListener('input', () => debounced({ wentWell: wentWell.value, prompt }));
    note.addEventListener('input', () => debounced({ note: note.value }));
    wrap.append(h('section', { class: 'card' },
      h('div', { class: 'sec-head' }, h('h2', null, 'How was today?')),
      rate('energy', 'Energy', '1 flat · 5 buzzing'), rate('sleep', 'Sleep', '1 rough · 5 great'), rate('mood', 'Mood', '1 low · 5 great'),
      h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, prompt), wentWell),
      h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Note'), note)));

    // trend
    const days = Array.from({ length: 14 }, (_, i) => addDays(day, i - 13));
    const labels = days.map((d, i) => (i % 7 === 0 || i === 13 ? fmtDay(d, { day: 'numeric', month: 'short' }) : ''));
    wrap.append(h('section', { class: 'card' },
      h('div', { class: 'sec-head' }, h('h2', null, 'Last 14 days')),
      h('div', { class: 'eyebrow' }, 'Energy'), barChart({ values: days.map((d) => state.journal[d]?.energy || 0), labels }),
      h('div', { class: 'eyebrow' }, 'Mood'), barChart({ values: days.map((d) => state.journal[d]?.mood || 0), labels }),
      h('div', { class: 'eyebrow' }, 'Habits ticked'), barChart({ values: days.map((d) => habitCount(state, d)), max: habits.length, labels })));
  }
}
