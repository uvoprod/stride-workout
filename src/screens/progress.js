import * as store from '../core/store.js';
import { exercises } from '../config/exercises.js';
import { badges } from '../config/badges.js';
import { diffDays, fmtShort, today } from '../core/dates.js';
import { fmtNum } from '../core/util.js';
import { allSessionsDone, coreSessionsDone, currentWeek } from '../core/schedule.js';
import { checkBadges, history, jumpSeries, liftSeries, liftsWithData, waistDue, waistSeries, weightSummary, habitStreak, sessionStreak } from '../core/logic.js';
import { h, icon, lineChart, tilt, toast } from '../ui/kit.js';
import { openBadge } from '../ui/badgeview.js';
import { sfx } from '../audio/sfx.js';
import { energyCard } from './energy.js';

let lift = null;

export function renderProgress(root) {
  const state = store.get();
  const wrap = h('div', { class: 'screen progress' });
  root.append(wrap);
  wrap.append(h('header', { class: 'top' }, h('div', { class: 'eyebrow' }, 'Progress'), h('h1', { class: 'display-l' }, 'The long game')));
  const start = state.profile.startDate;
  const xDay = (d) => diffDays(d, start);
  const xTicks = (maxDay) => { const t = []; for (let d = 0; d <= maxDay; d += 14) t.push({ x: d, label: `W${Math.floor(d / 7) + 1}` }); return t; };

  // ── weight trend ──
  const ws = weightSummary(state);
  const wIn = h('input', { class: 'num-in', type: 'text', inputmode: 'decimal', placeholder: 'kg', 'aria-label': 'Weight today in kg', value: state.weights[today()] || '' });
  const wCard = h('section', { class: 'card' },
    h('div', { class: 'sec-head' }, h('h2', null, 'Body weight trend')),
    h('div', { class: 'metric' },
      h('span', { class: 'display-xl' }, ws.now != null ? fmtNum(ws.now) : '–', h('small', null, ' kg')),
      ws.change != null && ws.enough ? h('span', { class: `delta ${ws.change <= 0 ? 'good' : ''}` }, `${ws.change > 0 ? '+' : '−'}${fmtNum(Math.abs(ws.change))} kg since you started`) : h('span', { class: 'muted' }, 'Log a few days and your trend appears.')));
  if (ws.enough) {
    const pts = ws.trend.map((t) => ({ x: xDay(t.date), y: t.trend }));
    const lastDay = Math.max(14, ...pts.map((p) => p.x));
    const band = [0, lastDay].map((d) => ({ x: d, lo: ws.base - 0.5 * (d / 7), hi: ws.base - 0.25 * (d / 7) }));
    wCard.append(lineChart({ points: pts, band, xTicks: xTicks(lastDay), yFmt: (v) => fmtNum(v), dots: false, xMin: 0, xMax: lastDay }));
    wCard.append(h('p', { class: 'muted small' }, 'The line is your 7-day average. One heavy day barely moves it. The tinted band is a steady pace of 0.25–0.5 kg a week. Sitting above it some weeks is normal while you build muscle.'));
  } else wCard.append(h('p', { class: 'muted small' }, 'Daily numbers are hidden on purpose. Only the 7-day average matters.'));
  wCard.append(h('div', { class: 'ci-row' }, h('div', { class: 'ci-label' }, h('div', null, h('b', null, 'Today’s weigh-in'))), wIn, h('button', { class: 'btn small', onclick: () => {
    const v = parseFloat(wIn.value.replace(',', '.'));
    if (!v || v < 30 || v > 250) { toast('Enter your weight in kg.'); return; }
    store.update((s) => { s.weights[today()] = v; });
    sfx.tick(); toast('Logged'); rerender();
  } }, 'Save')));
  wrap.append(wCard);
  wrap.append(energyCard(state));

  // ── waist ──
  const wa = waistSeries(state);
  const waCard = h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Waist')));
  const cw = currentWeek(state);
  if (wa.length) {
    const d = wa.length > 1 ? wa[wa.length - 1].cm - wa[0].cm : null;
    waCard.append(h('div', { class: 'metric' }, h('span', { class: 'display-xl' }, fmtNum(wa[wa.length - 1].cm), h('small', null, ' cm')), d != null ? h('span', { class: `delta ${d <= 0 ? 'good' : ''}` }, d === 0 ? 'No change yet' : `${d < 0 ? '−' : '+'}${fmtNum(Math.abs(d))} cm since week 1`) : h('span', { class: 'muted' }, 'Baseline set')));
    if (wa.length > 1) waCard.append(lineChart({ points: wa.map((x) => ({ x: xDay(x.date), y: x.cm })), xTicks: xTicks(Math.max(...wa.map((x) => xDay(x.date)), 14)), yFmt: (v) => fmtNum(v, 0), height: 150 }));
  } else waCard.append(h('p', { class: 'muted' }, 'Measure every 2 weeks: relaxed, at your belly button, same time of day. Waist often moves before the scale does.'));
  const cm = h('input', { class: 'num-in', type: 'text', inputmode: 'decimal', placeholder: 'cm', 'aria-label': 'Waist in cm' });
  waCard.append(h('div', { class: `ci-row${cw && waistDue(state, cw) ? ' due' : ''}` }, h('div', { class: 'ci-label' }, h('div', null, h('b', null, cw && waistDue(state, cw) ? 'Due this week' : 'Add a measurement'))), cm, h('button', { class: 'btn small', onclick: () => {
    const v = parseFloat(cm.value.replace(',', '.'));
    if (!v || v < 40 || v > 200) { toast('Enter your waist in cm.'); return; }
    store.update((s) => { s.waist[today()] = v; checkBadges(s); });
    sfx.set(2); toast('Waist logged'); rerender();
  } }, 'Save')));
  wrap.append(waCard);

  // ── strength ──
  const lifts = liftsWithData(state);
  const sCard = h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Strength')));
  if (!lifts.length) sCard.append(h('p', { class: 'muted' }, 'Log weights in your sessions and each lift gets its own chart here.'));
  else {
    if (!lift || !lifts.includes(lift)) lift = lifts[0];
    sCard.append(h('div', { class: 'lift-chips' }, lifts.slice(0, 12).map((id) => h('button', { class: `chip-btn${id === lift ? ' on' : ''}`, onclick: () => { lift = id; rerender(); } }, exercises[id].name.replace(/ \(.*\)/, '')))));
    const ser = liftSeries(state, lift);
    const best = Math.max(...ser.map((x) => x.kg));
    const prIdx = new Set(state.prLog.filter((p) => p.ex === lift).map((p) => p.date));
    sCard.append(h('div', { class: 'metric' }, h('span', { class: 'display-xl' }, fmtNum(ser[ser.length - 1].kg), h('small', null, ` kg${exercises[lift].each ? ' each' : ''}`)), h('span', { class: 'muted' }, `best ${fmtNum(best)} kg · ${ser.length} session${ser.length === 1 ? '' : 's'}`)));
    if (ser.length > 1) sCard.append(lineChart({ points: ser.map((x) => ({ x: xDay(x.date), y: x.kg })), markers: ser.filter((x) => prIdx.has(x.date)).map((x) => ({ x: xDay(x.date), y: x.kg })), xTicks: xTicks(Math.max(...ser.map((x) => xDay(x.date)), 14)), yFmt: (v) => fmtNum(v, 0), height: 150 }));
    else sCard.append(h('p', { class: 'muted small' }, 'One more session and the line appears.'));
  }
  wrap.append(sCard);

  // ── jump ──
  const js = jumpSeries(state);
  const jCard = h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Vertical jump')));
  if (js.length) {
    const gain = js.length > 1 ? js[js.length - 1].cm - js[0].cm : null;
    jCard.append(h('div', { class: 'metric' }, h('span', { class: 'display-xl' }, fmtNum(js[js.length - 1].cm), h('small', null, ' cm')), gain != null ? h('span', { class: `delta ${gain >= 0 ? 'good' : ''}` }, `${gain >= 0 ? '+' : '−'}${fmtNum(Math.abs(gain))} cm vs first test`) : h('span', { class: 'muted' }, 'Baseline set')));
    jCard.append(h('ul', { class: 'jump-list' }, js.map((j) => h('li', null, h('span', null, `Week ${j.week}`), h('span', { class: 'muted' }, fmtShort(j.date)), h('b', null, `${fmtNum(j.cm)} cm`)))));
  } else jCard.append(h('p', { class: 'muted' }, 'Tests happen on your Legs + Jump day in weeks 1, 4, 8 and 12. Results show up here.'));
  wrap.append(jCard);

  // ── numbers ──
  wrap.append(h('section', { class: 'stat-grid' },
    statTile(String(coreSessionsDone(state)), 'core sessions'),
    statTile(String(allSessionsDone(state)), 'total sessions'),
    statTile(String(state.prLog.length), 'personal bests'),
    statTile(String(sessionStreak(state)), 'sessions in a row'),
    statTile(String(habitStreak(state)), 'day habit streak'),
    statTile(String(Object.keys(state.journal).length), 'journal entries')));

  // ── badges ──
  const grid = h('div', { class: 'badge-grid' });
  badges.forEach((b) => {
    const got = !!state.badges[b.id];
    const tile = h('button', { class: `badge${got ? ' got' : ''}`, 'aria-label': `${b.name}${got ? '' : ' (locked)'}`, onclick: () => openBadge(b, got) }, h('span', { class: 'bg-glyph' }, got ? b.glyph : icon('lock', 20)), h('b', null, b.name), h('small', null, got ? 'Unlocked' : b.desc));
    if (got) tilt(tile, 9);
    grid.append(tile);
  });
  wrap.append(h('section', null, h('div', { class: 'sec-head pad' }, h('h2', null, 'Badges'), h('span', { class: 'muted' }, `${Object.keys(state.badges).length}/${badges.length}`)), grid));

  function rerender() { const p = wrap.parentElement; wrap.remove(); renderProgress(p); window.scrollTo(0, 0); }
}

const statTile = (n, label) => h('div', { class: 'tile' }, h('span', { class: 'display-l' }, n), h('span', { class: 'muted small' }, label));
