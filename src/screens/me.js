import * as store from '../core/store.js';
import { WEEKDAYS, today } from '../core/dates.js';
import { safetyNote } from '../config/content.js';
import { h, icon, toast } from '../ui/kit.js';
import { setSound } from '../audio/sfx.js';

export function renderMe(root) {
  const state = store.get();
  const p = state.profile;
  const wrap = h('div', { class: 'screen me' });
  root.append(wrap);
  wrap.append(h('header', { class: 'top' }, h('div', { class: 'eyebrow' }, 'Settings'), h('h1', { class: 'display-l' }, 'Me')));

  // profile
  const name = h('input', { class: 'txt-in', type: 'text', value: p.name || '', placeholder: 'Your name (optional)', 'aria-label': 'Name' });
  const startDate = h('input', { class: 'txt-in', type: 'date', value: p.startDate, 'aria-label': 'Programme start date' });
  const startW = h('input', { class: 'txt-in', type: 'text', inputmode: 'decimal', value: p.startWeight || '', 'aria-label': 'Starting weight in kg' });
  const save = () => store.update((s) => {
    s.profile.name = name.value.trim();
    if (startDate.value) s.profile.startDate = startDate.value;
    const w = parseFloat(startW.value.replace(',', '.'));
    if (w) s.profile.startWeight = w;
  });
  [name, startDate, startW].forEach((i) => i.addEventListener('change', () => { save(); toast('Saved'); }));
  wrap.append(h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Profile')),
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Name'), name),
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Programme start date'), startDate),
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Starting weight (kg)'), startW),
    h('p', { class: 'muted small' }, 'Changing the start date shifts every week of the plan. Your logged sessions stay.')));

  // training days
  const days = h('div', { class: 'wd-pick' });
  const drawDays = () => {
    const s = store.get().profile;
    days.replaceChildren(...[1, 2, 3, 4, 5, 6, 0].map((d) => {
      const core = s.trainDays.includes(d), opt = s.optionalDay === d;
      return h('button', { class: `wd${core ? ' core' : ''}${opt ? ' opt' : ''}`, 'aria-pressed': String(core || opt), onclick: () => {
        store.update((st) => {
          const pr = st.profile;
          if (pr.trainDays.includes(d)) { if (pr.trainDays.length > 3) pr.trainDays = pr.trainDays.filter((x) => x !== d); else { toast('Core plan needs 3 training days. Tap another day first.'); } }
          else if (pr.optionalDay === d) pr.optionalDay = null;
          else if (pr.trainDays.length < 3) pr.trainDays = [...pr.trainDays, d].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
          else pr.optionalDay = d;
        });
        drawDays();
      } }, WEEKDAYS[d]);
    }));
  };
  drawDays();
  wrap.append(h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Training days')),
    days,
    h('p', { class: 'muted small' }, 'Dark = core days (Push, Pull, Legs in order). Orange outline = optional conditioning day. Tap a core day to turn it into the optional day, or tap an empty day to make it core.')));

  // sound
  const sound = toggleRow('Sounds', 'Check-off blips, timer beeps, finish chime', state.settings.sound, (v) => setSound(v));
  const haptics = toggleRow('Vibration', 'Small buzz on set check-offs (phones)', state.settings.haptics, (v) => store.update((s) => { s.settings.haptics = v; }));
  wrap.append(h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Feel')), sound, haptics));

  // data
  const file = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, 'aria-label': 'Choose backup file' });
  file.addEventListener('change', async () => {
    const f = file.files?.[0]; if (!f) return;
    try {
      store.importJSON(await f.text());
      toast('Backup imported'); location.hash = '#/today'; location.reload();
    } catch (e) { toast(e.message || 'Could not import that file.'); }
  });
  wrap.append(h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Your data')),
    h('p', { class: 'muted' }, 'Everything is saved on this device only. Export a backup now and then, and use it to move to a new phone.'),
    h('div', { class: 'row-actions' },
      h('button', { class: 'btn', onclick: () => {
        const blob = new Blob([store.exportJSON()], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: `stride-backup-${today()}.json` });
        document.body.append(a); a.click(); a.remove(); toast('Backup downloaded');
      } }, icon('download', 18), ' Export JSON'),
      h('button', { class: 'btn', onclick: () => file.click() }, icon('upload', 18), ' Import JSON'), file),
    h('button', { class: 'link-btn danger', onclick: () => {
      if (prompt('This erases all your data on this device. Type RESET to confirm.') === 'RESET') { store.resetAll(); location.hash = '#/today'; location.reload(); }
    } }, 'Reset everything')));

  wrap.append(h('section', { class: 'card flat' }, h('div', { class: 'eyebrow' }, 'Stay safe'), h('p', { class: 'muted' }, safetyNote)));
  wrap.append(h('p', { class: 'muted small center' }, 'Colours, fonts and the whole programme live in src/config. See the README to edit them.'));
}

function toggleRow(title, sub, on, onChange) {
  const b = h('button', { class: 'switch', role: 'switch', 'aria-checked': String(on), 'aria-label': title, onclick: () => { const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(v)); onChange(v); } }, h('i'));
  return h('div', { class: 'toggle-row' }, h('div', null, h('b', null, title), h('span', { class: 'muted small' }, sub)), b);
}
