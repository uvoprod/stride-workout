// The workout view: warm-up, exercises with set logging, finisher, stretching.
import * as store from '../core/store.js';
import { exercises } from '../config/exercises.js';
import { warmups, cooldowns, recoveryTips } from '../config/stretches.js';
import { phaseOfWeek, RPE_HELP } from '../config/phases.js';
import { celebrations } from '../config/content.js';
import { getWeek } from '../config/weeks/index.js';
import { today, fmtDay } from '../core/dates.js';
import { clamp, fmtNum, sum } from '../core/util.js';
import { suggest, detectPRs, checkBadges, programPct } from '../core/logic.js';
import { currentWeek, sessionId, weekDoneCount } from '../core/schedule.js';
import { sfx } from '../audio/sfx.js';
import { h, icon, openSheet, toast, restStart, restStop, runSegments, tilt, countUp } from '../ui/kit.js';
import { createRing } from '../three/scenes.js';
import { openBadge } from '../ui/badgeview.js';

const swapKey = (w, key, i) => `${w}-${key}-${i}`;
const effortLabels = { easy: ['Easy', '3+ reps left'], good: ['Good', '2–3 reps left'], hard: ['Hard', '0–1 reps left'] };

// ── helpers ─────────────────────────────────────────────────────────────────
function stepper({ value, step, min = 0, max = 999, label, onChange, unit }) {
  let cur = value;
  const input = h('input', { class: 'st-in', type: 'text', inputmode: 'decimal', 'aria-label': label, value: fmtNum(cur, 2) });
  const set = (v, silent) => {
    v = clamp(Math.round(v / (step < 1 ? 0.25 : 0.5)) * (step < 1 ? 0.25 : 0.5), min, max);
    if (v === cur && silent) return;
    cur = v; input.value = fmtNum(cur, 2);
    if (!silent) onChange(cur);
  };
  input.addEventListener('focus', () => input.select());
  input.addEventListener('change', () => { const v = parseFloat(input.value.replace(',', '.')); set(Number.isNaN(v) ? cur : v); });
  const el = h('div', { class: 'stepper' },
    h('button', { class: 'st-btn', 'aria-label': `Decrease ${label}`, onclick: () => { sfx.tick(); set(cur - step); } }, icon('minus', 18)),
    h('div', { class: 'st-mid' }, input, unit && h('span', { class: 'st-unit' }, unit)),
    h('button', { class: 'st-btn', 'aria-label': `Increase ${label}`, onclick: () => { sfx.tick(); set(cur + step); } }, icon('plus', 18)));
  el.setValue = (v) => set(v, true);
  return el;
}

export function estimateMinutes(day) {
  let sec = 7 * 60 + 6 * 60;
  for (const s of day.slots) {
    if (s.block === 'interval') sec += s.rounds * (s.work + s.easy);
    else if (s.block === 'circuit') sec += s.rounds * (s.moves.length * 55 + s.restBetween);
    else if (s.ex === 'jump-test') sec += 4 * 60;
    else sec += s.sets * (40 + (s.rest || 20));
  }
  const f = day.finisher;
  sec += f.kind === 'interval' ? f.rounds * (f.work + f.easy) : f.minutes * 60;
  return Math.round(sec / 300) * 5;
}

export function finisherSegments(f) {
  if (f.kind === 'interval') {
    const segs = [];
    for (let r = 1; r <= f.rounds; r++) {
      segs.push({ label: f.workLabel, sec: f.work, kind: 'work', round: `Round ${r} of ${f.rounds}`, sub: f.effort });
      if (r < f.rounds) segs.push({ label: f.easyLabel, sec: f.easy, kind: 'easy', round: `Round ${r} of ${f.rounds}`, sub: 'Catch your breath' });
    }
    return [{ label: 'Get ready', sec: 5, kind: 'easy', sub: f.title }, ...segs];
  }
  const total = f.minutes * 60, segs = [];
  if (f.pickups) {
    let left = total;
    while (left > 0) {
      const a = Math.min(f.pickups.every, left); segs.push({ label: f.title, sec: a, kind: 'hold', sub: f.effort }); left -= a;
      if (left > 0) { const b = Math.min(f.pickups.sec, left); segs.push({ label: 'Pick it up', sec: b, kind: 'work', sub: 'Faster for 30 s' }); left -= b; }
    }
  } else segs.push({ label: f.title, sec: total, kind: 'hold', sub: f.effort });
  return [{ label: 'Get ready', sec: 5, kind: 'easy', sub: f.title }, ...segs];
}

export function stretchSegments(list) {
  const segs = [{ label: 'Get comfortable', sec: 5, kind: 'easy', sub: 'Slow, easy breathing. A pull, never pain.' }];
  for (const s of list) {
    for (let side = 0; side < s.sides; side++) {
      segs.push({ label: s.name, sec: s.hold, kind: 'hold', round: s.sides === 2 ? (side === 0 ? 'First side' : 'Other side') : '', sub: s.cue });
    }
  }
  return segs;
}

// ── main ────────────────────────────────────────────────────────────────────
export function renderWorkout(root, w, key, opts = {}) {
  const wk = getWeek(w);
  const day = wk.days[key];
  const phase = phaseOfWeek(w);
  const id = sessionId(w, key);
  const readonly = w > currentWeek(store.get()) || opts.readonly;

  const ses = () => store.get().sessions[id];
  const mut = (fn) => store.update((s) => {
    const se = (s.sessions[id] ||= { week: w, key, date: today(), startedAt: Date.now(), slots: {} });
    fn(se);
  });
  const guard = () => { if (readonly) { toast('This week has not started yet. Preview only.'); return true; } return false; };

  const wrap = h('div', { class: 'workout' });
  const setCountEl = h('span', { class: 'prog-num' });
  const progFill = h('div', { class: 'prog-fill' });
  const doneBadge = h('span', { class: 'chip good', hidden: true }, 'Completed');
  const slotCards = [];

  const totals = () => {
    let done = 0, total = 0;
    day.slots.forEach((s, i) => {
      const sl = ses()?.slots?.[i];
      if (s.block === 'circuit') { total += s.rounds; done += (sl?.rounds || []).filter(Boolean).length; }
      else if (s.block === 'interval') { total += 1; done += sl?.done ? 1 : 0; }
      else if (s.ex === 'jump-test') { total += 1; done += sl?.done ? 1 : 0; }
      else { total += s.sets; done += (sl?.sets || []).filter((x) => x.done).length; }
    });
    return { done, total };
  };
  const refreshProgress = () => {
    const { done, total } = totals();
    setCountEl.textContent = `${done}/${total}`;
    progFill.style.transform = `scaleX(${total ? done / total : 0})`;
    doneBadge.hidden = !ses()?.completedAt;
  };

  // header
  const mins = estimateMinutes(day);
  wrap.append(
    h('header', { class: 'wk-head' },
      h('div', { class: 'eyebrow' }, `Week ${w} · ${phase.name}${wk.deload ? ' · Deload' : ''}`),
      h('h1', { class: 'display-xl' }, day.title),
      h('p', { class: 'sub' }, day.subtitle),
      h('div', { class: 'chips' },
        h('span', { class: 'chip' }, `~${mins} min`),
        h('span', { class: 'chip' }, `Effort RPE ${wk.deload ? '5–6' : phaseRpe(day)}`),
        day.optional && h('span', { class: 'chip accent' }, 'Optional day'),
        wk.deload && h('span', { class: 'chip accent' }, 'Deload'),
        doneBadge)),
    h('div', { class: 'coach card flat' }, h('div', { class: 'eyebrow' }, wk.focus), h('p', null, wk.coach)),
    h('div', { class: 'prog-bar sticky', role: 'status' }, h('div', { class: 'prog-track' }, progFill), setCountEl),
  );
  if (readonly) wrap.prepend(h('div', { class: 'banner' }, 'Preview. This week has not started yet.'));

  // 01 warm-up
  let n = 1;
  const section = (title, ...kids) => h('section', { class: 'sec' }, h('div', { class: 'sec-head' }, h('span', { class: 'sec-n' }, String(n++).padStart(2, '0')), h('h2', null, title)), ...kids);

  const wuDone = !!ses()?.warmupDone;
  const wuBtn = h('button', { class: 'check-row', 'aria-pressed': String(wuDone), onclick: () => { if (guard()) return; const v = wuBtn.getAttribute('aria-pressed') !== 'true'; wuBtn.setAttribute('aria-pressed', v); v ? sfx.set(0) : sfx.unset(); mut((s) => { s.warmupDone = v; }); } },
    h('span', { class: 'box' }, icon('check', 18)), h('span', null, 'Warm-up done'));
  wrap.append(section('Warm-up', h('ul', { class: 'wu-list' }, warmups[key].map((x) => h('li', null, h('b', null, x.name), h('span', null, x.detail)))), wuBtn));

  // exercises
  const exSection = h('section', { class: 'sec' }, h('div', { class: 'sec-head' }, h('span', { class: 'sec-n' }, String(n++).padStart(2, '0')), h('h2', null, 'Training')));
  day.slots.forEach((slot, i) => {
    const card = slot.block === 'interval' ? intervalCard(slot, i) : slot.block === 'circuit' ? circuitCard(slot, i) : slot.ex === 'jump-test' ? jumpTestCard(slot, i) : exerciseCard(slot, i);
    slotCards.push(card);
    exSection.append(card);
  });
  wrap.append(exSection);

  // finisher
  const f = day.finisher;
  const finDone = !!ses()?.finisherDone;
  const finBtn = h('button', { class: 'check-row', 'aria-pressed': String(finDone), onclick: () => toggleFlag(finBtn, 'finisherDone') }, h('span', { class: 'box' }, icon('check', 18)), h('span', null, 'Finisher done'));
  const finMin = f.kind === 'interval' ? Math.round((f.rounds * (f.work + f.easy)) / 60) : f.minutes;
  wrap.append(section('Finisher',
    h('div', { class: 'card finisher' },
      h('div', { class: 'fin-top' }, h('h3', null, f.title), h('span', { class: 'fin-min' }, `${finMin} min`)),
      f.kind === 'interval' && h('div', { class: 'fin-spec' }, h('b', null, `${f.rounds} rounds`), ` · ${f.work} s ${f.workLabel.toLowerCase()} / ${f.easy} s ${f.easyLabel.toLowerCase()}`),
      f.kind === 'steady' && h('div', { class: 'fin-spec' }, h('b', null, `${f.minutes} min`), f.incline ? ` · ${f.incline}% incline` : ' · steady'),
      h('p', { class: 'muted' }, f.effort),
      h('p', { class: 'muted small' }, f.pickups ? `${f.pickups.note} ` : '', f.alt),
      h('div', { class: 'row-actions' }, h('button', { class: 'btn primary', onclick: () => { if (guard()) return; sfx.unlock(); runSegments(f.title, finisherSegments(f), { onDone: () => { finBtn.setAttribute('aria-pressed', 'true'); mut((s) => { s.finisherDone = true; }); toast('Finisher complete'); } }); } }, icon('timer', 18), ' Start timer')),
      finBtn)));

  // cool-down stretch
  const cd = cooldowns[key];
  const cdDone = !!ses()?.cooldownDone;
  const cdBtn = h('button', { class: 'check-row', 'aria-pressed': String(cdDone), onclick: () => toggleFlag(cdBtn, 'cooldownDone') }, h('span', { class: 'box' }, icon('check', 18)), h('span', null, 'Stretching done'));
  const cdMin = Math.round(sum(cd.map((s) => s.hold * s.sides)) / 60);
  wrap.append(section('Cool-down stretch',
    h('div', { class: 'card' },
      h('div', { class: 'fin-top' }, h('h3', null, 'Stretch it out'), h('span', { class: 'fin-min' }, `~${cdMin + 1} min`)),
      h('p', { class: 'muted' }, 'Slow breathing. A gentle pull, never sharp pain. Do not bounce.'),
      h('ul', { class: 'stretch-list' }, cd.map((s) => h('li', null, h('div', null, h('b', null, s.name), h('span', { class: 'muted' }, s.cue)), h('span', { class: 'hold' }, `${s.hold} s${s.sides === 2 ? ' × 2' : ''}`)))),
      h('div', { class: 'row-actions' }, h('button', { class: 'btn primary', onclick: () => { if (guard()) return; sfx.unlock(); runSegments('Cool-down stretch', stretchSegments(cd), { onDone: () => { cdBtn.setAttribute('aria-pressed', 'true'); mut((s) => { s.cooldownDone = true; }); toast('Nice. Stretching done'); } }); } }, icon('stretch', 18), ' Guided stretch')),
      cdBtn,
      h('ul', { class: 'tips' }, recoveryTips.map((t) => h('li', null, t))))));

  // finish
  const finishBtn = h('button', { class: 'btn primary big', onclick: finishWorkout }, 'Finish workout');
  const reopenNote = h('p', { class: 'muted center small' }, 'You can finish with sets left undone. Something is always better than nothing.');
  wrap.append(h('div', { class: 'finish-area' }, ses()?.completedAt ? h('p', { class: 'muted center' }, `Finished ${fmtDay(ses().date)}. Great work.`) : [finishBtn, reopenNote]));

  root.append(wrap);
  refreshProgress();

  function toggleFlag(btn, field) {
    if (guard()) return;
    const v = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', v);
    v ? sfx.set(0) : sfx.unset();
    mut((s) => { s[field] = v; });
  }

  function phaseRpe(d) {
    const s = d.slots.find((x) => x.rpe && x.rpe !== '—');
    return s?.rpe || wk.days.push.slots[0].rpe;
  }

  // ── exercise card ─────────────────────────────────────────────────────────
  function exerciseCard(slot, i) {
    const group = slot.group;
    const state = store.get();
    const exId = () => store.get().swaps[swapKey(w, key, i)] || slot.ex;
    let ex = exercises[exId()];
    const card = h('article', { class: 'card ex', dataset: { slot: i } });
    const setsBox = h('div', { class: 'sets' });
    const head = h('div', { class: 'ex-head' });
    const sugEl = h('p', { class: 'sug' });
    const cuesEl = h('ul', { class: 'cues', hidden: true });
    const effortEl = h('div', { class: 'effort', hidden: true });
    let sets = [];

    const saved = state.sessions[id]?.slots?.[i];
    const buildSets = () => {
      ex = exercises[exId()];
      const sg = suggest(store.get(), exId(), slot, wk.deload);
      sets = Array.from({ length: slot.sets }, (_, k) => ({ kg: sg.kg ?? 0, reps: sg.reps ?? slot.reps[0], done: false }));
      return sg;
    };
    let sg;
    if (saved && saved.ex === exId() && saved.sets?.length) { sets = saved.sets.map((x) => ({ ...x })); sg = suggest(store.get(), exId(), slot, wk.deload); ex = exercises[exId()]; }
    else sg = buildSets();

    const persist = () => mut((s) => { s.slots[i] = { ...(s.slots[i] || {}), ex: exId(), sets: sets.map((x) => ({ ...x })), effort: s.slots[i]?.effort }; });

    const showsKg = () => ex.mode === 'kg' || ex.optionalWeight;
    const repUnit = () => (ex.mode === 'time' ? 's' : ex.mode === 'jump' ? 'jumps' : ex.perSide ? '/side' : 'reps');

    function renderHead() {
      head.replaceChildren(
        h('div', { class: 'ex-title' },
          group && h('span', { class: 'ss-tag' }, group),
          h('h3', null, ex.name),
          h('div', { class: 'ex-actions' },
            h('button', { class: 'icon-btn', 'aria-label': 'Form cues', 'aria-expanded': 'false', onclick: (e) => { cuesEl.hidden = !cuesEl.hidden; e.currentTarget.setAttribute('aria-expanded', String(!cuesEl.hidden)); e.currentTarget.classList.toggle('on', !cuesEl.hidden); } }, icon('info', 20)),
            slot.ex !== 'jump-test' && ex.swaps.length > 0 || exId() !== slot.ex ? h('button', { class: 'icon-btn', 'aria-label': 'Swap exercise', onclick: openSwap }, icon('swap', 20)) : null)),
        h('div', { class: 'target' },
          h('b', null, `${slot.sets} × ${slot.reps[0] === slot.reps[1] ? slot.reps[0] : slot.reps.join('–')}`), ` ${repUnit() === 's' ? 'seconds' : repUnit()}`,
          slot.rest ? ` · rest ${slot.rest} s` : group ? ' · straight to the next move' : '',
          slot.rpe && slot.rpe !== '—' ? ` · RPE ${slot.rpe}` : ''));
      cuesEl.replaceChildren(...ex.cues.map((c) => h('li', null, c)), slot.note ? h('li', { class: 'note' }, slot.note) : null);
      sugEl.className = `sug ${sg.action}`;
      sugEl.textContent = sg.reason + (ex.each && showsKg() ? ' (per dumbbell)' : '');
    }

    function renderSets() {
      setsBox.replaceChildren();
      const hdr = h('div', { class: 'set-row hdr' }, h('span', null, 'Set'), showsKg() ? h('span', null, ex.each ? 'kg each' : ex.assisted ? 'kg assist' : 'kg') : h('span'), h('span', null, repUnit() === 's' ? 'seconds' : repUnit()), h('span'));
      setsBox.append(hdr);
      sets.forEach((s, k) => {
        const row = h('div', { class: `set-row${s.done ? ' done' : ''}` });
        const kgSt = showsKg() ? stepper({ value: s.kg, step: ex.inc || 2.5, label: `Set ${k + 1} weight`, onChange: (v) => { s.kg = v; persist(); } }) : h('div', { class: 'st-na' }, 'BW');
        const stepSize = ex.mode === 'time' ? 5 : 1;
        const repSt = stepper({ value: s.reps, step: stepSize, label: `Set ${k + 1} ${repUnit()}`, onChange: (v) => { s.reps = v; persist(); } });
        const chk = h('button', { class: 'chk', 'aria-label': `Set ${k + 1} done`, 'aria-pressed': String(s.done), onclick: () => toggleSet(k, row, chk) }, icon('check', 22));
        row.append(h('span', { class: 'set-n' }, String(k + 1)), kgSt, repSt, chk);
        setsBox.append(row);
      });
      setsBox.append(h('button', { class: 'link-btn', onclick: () => { if (guard()) return; const l = sets[sets.length - 1]; sets.push({ kg: l.kg, reps: l.reps, done: false }); persist(); renderSets(); } }, '+ add a set'));
      effortEl.hidden = !sets.some((x) => x.done);
    }

    function toggleSet(k, row, chk) {
      if (guard()) return;
      const s = sets[k];
      s.done = !s.done;
      row.classList.toggle('done', s.done);
      chk.setAttribute('aria-pressed', String(s.done));
      if (s.done) {
        const doneCount = slotCards.filter(Boolean).length ? totalsDone() : 0;
        sfx.set(doneCount);
        chk.classList.remove('pop'); void chk.offsetWidth; chk.classList.add('pop');
        persist();
        effortEl.hidden = false;
        if (slot.rest === 0) toast(`Straight to the next move`);
        else if (sets.every((x) => x.done) && i === day.slots.length - 1) restStop();
        else restStart(slot.rest || 60);
      } else { sfx.unset(); persist(); effortEl.hidden = !sets.some((x) => x.done); }
      refreshProgress();
    }
    const totalsDone = () => totals().done;

    function renderEffort() {
      const cur = ses()?.slots?.[i]?.effort;
      effortEl.replaceChildren(h('span', { class: 'eyebrow' }, 'How did it feel?'), h('div', { class: 'seg' }, Object.entries(effortLabels).map(([k, [t, d]]) =>
        h('button', { class: `seg-btn${cur === k ? ' on' : ''}`, 'aria-pressed': String(cur === k), onclick: (e) => { if (guard()) return; sfx.tick(); mut((s) => { s.slots[i] = { ...(s.slots[i] || { ex: exId(), sets }), effort: k }; }); effortEl.querySelectorAll('.seg-btn').forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }); e.currentTarget.classList.add('on'); e.currentTarget.setAttribute('aria-pressed', 'true'); } }, h('b', null, t), h('small', null, d)))));
    }

    function openSwap() {
      if (guard()) return;
      if (sets.some((x) => x.done)) { toast('Untick your logged sets first to swap.'); return; }
      const list = h('div', { class: 'swap-list' });
      const choose = (newId) => {
        store.update((s) => { if (newId === slot.ex) delete s.swaps[swapKey(w, key, i)]; else s.swaps[swapKey(w, key, i)] = newId; });
        sg = buildSets(); renderHead(); renderSets(); persist(); sheet.close(); toast(`Using ${exercises[newId].name}`);
      };
      const opts = [...new Set([...(exId() !== slot.ex ? [slot.ex] : []), ...exercises[slot.ex].swaps.filter((x) => x !== exId())])];
      opts.forEach((o) => list.append(h('button', { class: 'swap-item', onclick: () => choose(o) }, h('b', null, exercises[o].name), h('span', { class: 'muted' }, `${exercises[o].muscle} · ${exercises[o].cues[0]}`), o === slot.ex && h('span', { class: 'chip' }, 'Original'))));
      const sheet = openSheet('Swap exercise', [h('p', { class: 'muted' }, 'Machine taken? Pick an alternative that works the same muscles.'), list]);
    }

    renderHead(); renderSets(); renderEffort();
    card.append(head, cuesEl, sugEl, setsBox, effortEl);
    return card;
  }

  // ── interval block (conditioning day) ─────────────────────────────────────
  function intervalCard(slot, i) {
    const done = !!ses()?.slots?.[i]?.done;
    const min = Math.round((slot.rounds * (slot.work + slot.easy)) / 60);
    const btn = h('button', { class: 'check-row', 'aria-pressed': String(done), onclick: () => mark(btn, true) }, h('span', { class: 'box' }, icon('check', 18)), h('span', null, 'Intervals done'));
    const mark = (b, toggle) => { if (guard()) return; const v = toggle ? b.getAttribute('aria-pressed') !== 'true' : true; b.setAttribute('aria-pressed', v); v ? sfx.set(2) : sfx.unset(); mut((s) => { s.slots[i] = { ...(s.slots[i] || {}), ex: 'bike-intervals', done: v }; }); refreshProgress(); };
    const segs = () => {
      const a = [{ label: 'Get ready', sec: 5, kind: 'easy', sub: slot.title }];
      for (let r = 1; r <= slot.rounds; r++) {
        a.push({ label: slot.workLabel, sec: slot.work, kind: 'work', round: `Round ${r} of ${slot.rounds}`, sub: 'Fast but controlled' });
        if (r < slot.rounds) a.push({ label: slot.easyLabel, sec: slot.easy, kind: 'easy', round: `Round ${r} of ${slot.rounds}`, sub: 'Catch your breath' });
      }
      return a;
    };
    return h('article', { class: 'card ex' },
      h('div', { class: 'ex-title' }, h('h3', null, slot.title)),
      h('div', { class: 'target' }, h('b', null, `${slot.rounds} rounds`), ` · ${slot.work} s hard / ${slot.easy} s easy · ${min} min`),
      h('ul', { class: 'cues' }, exercises['bike-intervals'].cues.map((c) => h('li', null, c)), h('li', { class: 'note' }, slot.note)),
      h('div', { class: 'row-actions' }, h('button', { class: 'btn primary', onclick: () => { if (guard()) return; sfx.unlock(); runSegments(slot.title, segs(), { onDone: () => mark(btn, false) }); } }, icon('timer', 18), ' Start intervals')),
      btn);
  }

  // ── circuit block ─────────────────────────────────────────────────────────
  function circuitCard(slot, i) {
    const rounds = ses()?.slots?.[i]?.rounds || Array(slot.rounds).fill(false);
    const chips = h('div', { class: 'round-chips' });
    const draw = () => chips.replaceChildren(...rounds.map((r, k) => h('button', { class: `round${r ? ' done' : ''}`, 'aria-pressed': String(r), 'aria-label': `Round ${k + 1}`, onclick: () => { if (guard()) return; rounds[k] = !rounds[k]; rounds[k] ? sfx.set(k) : sfx.unset(); mut((s) => { s.slots[i] = { ...(s.slots[i] || {}), ex: 'circuit', rounds: [...rounds] }; }); if (rounds[k] && rounds.some((x) => !x)) restStart(slot.restBetween, 'Rest between rounds'); draw(); refreshProgress(); } }, h('span', null, `Round ${k + 1}`), icon('check', 18))));
    draw();
    return h('article', { class: 'card ex' },
      h('div', { class: 'ex-title' }, h('h3', null, slot.title)),
      h('div', { class: 'target' }, h('b', null, `${slot.rounds} rounds`), ` · RPE ${slot.rpe} · rest ${slot.restBetween} s between rounds`),
      h('ol', { class: 'circuit-list' }, slot.moves.map((m) => h('li', null, h('b', null, exercises[m.ex].name), h('span', null, m.seconds ? `${m.seconds} s` : `${m.reps[1]} reps`)))),
      h('p', { class: 'muted small' }, slot.note),
      chips);
  }

  // ── jump test ─────────────────────────────────────────────────────────────
  function jumpTestCard(slot, i) {
    const st = store.get();
    const prior = st.jumps.filter((j) => !(j.week === w));
    const attempts = ses()?.slots?.[i]?.attempts || Array(slot.attempts).fill(0);
    const bestEl = h('div', { class: 'jt-best' });
    const inputs = attempts.map((v, k) => {
      const input = h('input', { class: 'jt-in', type: 'text', inputmode: 'decimal', 'aria-label': `Attempt ${k + 1} height in cm`, placeholder: 'cm', value: v ? String(v) : '' });
      input.addEventListener('input', () => { attempts[k] = parseFloat(input.value.replace(',', '.')) || 0; upd(); });
      return input;
    });
    const upd = () => { const b = Math.max(0, ...attempts); bestEl.replaceChildren(h('span', { class: 'big-num' }, b ? fmtNum(b) : '–'), h('span', { class: 'muted' }, 'cm best')); };
    upd();
    const saveBtn = h('button', { class: 'btn primary', onclick: () => {
      if (guard()) return;
      const best = Math.max(0, ...attempts);
      if (!best) { toast('Enter at least one jump height.'); return; }
      sfx.set(3);
      store.update((s) => {
        s.jumps = s.jumps.filter((j) => j.week !== w);
        s.jumps.push({ date: today(), cm: best, week: w });
        const se = (s.sessions[id] ||= { week: w, key, date: today(), startedAt: Date.now(), slots: {} });
        se.slots[i] = { ex: 'jump-test', attempts: [...attempts], best, done: true };
      });
      refreshProgress();
      const b0 = store.get().jumps.filter((j) => j.week !== w).sort((a, c) => (a.date < c.date ? -1 : 1))[0];
      toast(b0 ? `Saved: ${fmtNum(best)} cm (${best - b0.cm >= 0 ? '+' : ''}${fmtNum(best - b0.cm)} vs first test)` : `Saved: ${fmtNum(best)} cm. Your baseline!`);
    } }, 'Save jump result');
    return h('article', { class: 'card ex' },
      h('div', { class: 'ex-title' }, h('span', { class: 'ss-tag' }, 'TEST'), h('h3', null, 'Vertical jump test')),
      h('ul', { class: 'cues' }, exercises['jump-test'].cues.map((c) => h('li', null, c)), slot.note && h('li', { class: 'note' }, slot.note)),
      h('div', { class: 'jt-grid' }, inputs),
      bestEl,
      prior.length ? h('p', { class: 'muted small' }, `Previous: ${prior.sort((a, c) => (a.date < c.date ? -1 : 1)).map((j) => `${fmtNum(j.cm)} cm (wk ${j.week})`).join(', ')}`) : null,
      saveBtn);
  }

  // ── finish ────────────────────────────────────────────────────────────────
  function finishWorkout() {
    if (guard()) return;
    const { done } = totals();
    if (!done) { toast('Log at least one set first.'); return; }
    const before = programPct(store.get());
    const hadBadges = new Set(Object.keys(store.get().badges));
    let summary, prs = [], fresh = [];
    store.update((s) => {
      const se = (s.sessions[id] ||= { week: w, key, date: today(), startedAt: Date.now(), slots: {} });
      se.completedAt = Date.now();
      let sets = 0, vol = 0;
      Object.values(se.slots).forEach((sl) => (sl.sets || []).forEach((x) => { if (x.done) { sets++; vol += (x.kg || 0) * (x.reps || 0); } }));
      prs = detectPRs(s, se);
      prs.forEach((p) => s.prLog.push({ date: today(), ...p }));
      summary = { sets, vol: Math.round(vol), prs: prs.length, minutes: Math.max(1, Math.round((Date.now() - (se.startedAt || Date.now())) / 60000)) };
      se.summary = summary;
      fresh = checkBadges(s);
    });
    restStop();
    refreshProgress();
    celebrate({ summary, prs, fresh, before, after: programPct(store.get()), w, key });
    void hadBadges;
  }
}

// ── celebration overlay ─────────────────────────────────────────────────────
export function celebrate({ summary, prs, fresh, before, after, w, key }) {
  sfx.done();
  const ringBox = h('div', { class: 'cel-ring' });
  const st = store.get();
  const weeks = Array.from({ length: 12 }, (_, i) => (weekDoneCount(st, i + 1) === 3 ? 'done' : i + 1 === w ? 'current' : ''));
  const num = (v, label) => h('div', { class: 'cel-stat' }, h('span', { class: 'big-num', dataset: { to: v } }, '0'), h('span', { class: 'muted' }, label));
  const msg = celebrations[(w + key.length) % celebrations.length];
  const overlay = h('div', { class: 'celebrate', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Workout complete' },
    h('div', { class: 'eyebrow center' }, `Week ${w} · ${getWeek(w).days[key].title}`),
    h('h1', { class: 'display-xl center' }, 'Workout complete'),
    ringBox,
    h('p', { class: 'center msg' }, msg),
    h('div', { class: 'cel-stats' }, num(summary.sets, 'sets'), num(summary.vol, 'kg lifted'), num(summary.minutes, 'minutes')),
    prs.length ? h('div', { class: 'cel-pr' }, h('b', null, prs.length === 1 ? 'New personal best' : `${prs.length} new personal bests`), h('span', null, prs.map((p) => `${exercises[p.ex].name} ${fmtNum(p.kg)} kg × ${p.reps}`).join(' · '))) : null,
    fresh.length ? h('div', { class: 'cel-badges' }, h('span', { class: 'eyebrow' }, 'Badge unlocked'), fresh.map((b) => h('button', { class: 'badge-chip', onclick: () => openBadge(b, true) }, h('span', { class: 'bg-glyph' }, b.glyph), h('span', null, b.name)))) : null,
    h('button', { class: 'btn primary big', onclick: () => { ring.dispose(); overlay.remove(); document.body.classList.remove('no-scroll'); location.hash = '#/today'; } }, 'Back to dashboard'));
  document.body.append(overlay);
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => {
    overlay.classList.add('in');
    const ring = createRing(ringBox, { progress: before, weeks });
    overlay._ring = ring;
    ringBox.append(h('div', { class: 'ring-center' }, h('span', { class: 'big-num' }, `${Math.round(after * 100)}%`), h('span', { class: 'muted small' }, 'of programme')));
    setTimeout(() => { ring.setProgress(after); ring.celebrate(); }, 350);
    overlay.querySelectorAll('[data-to]').forEach((el) => countUp(el, Number(el.dataset.to), 900));
    if (fresh.length) setTimeout(() => sfx.badge(), 900);
    else if (prs.length) setTimeout(() => sfx.pr(), 700);
  });
  const ring = { dispose: () => overlay._ring?.dispose() };
  tilt(overlay.querySelector('.cel-ring'), 5);
}
