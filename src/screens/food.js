import * as store from '../core/store.js';
import { foods, models, targets } from '../config/foods.js';
import { resetMessages } from '../config/content.js';
import { addDays, fmtDay, today } from '../core/dates.js';
import { fmtNum } from '../core/util.js';
import { addItems, dailyTargets, dayItems, dayTotals, estimateMeal, fileToJpeg, getDeficit, getKey, getModel, mealForNow, recents, removeItem, setKey, updateItem } from '../core/food.js';
import { h, icon, openSheet, toast } from '../ui/kit.js';
import { sfx } from '../audio/sfx.js';

const MEALS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
const WHERE = [['home', 'Home'], ['restaurant', 'Restaurant'], ['street', 'Street / packaged']];
let fdate = null, meal = null, where = 'home';

export function renderFood(root) {
  if (!fdate) fdate = today();
  if (!meal) meal = mealForNow();
  const wrap = h('div', { class: 'screen food' });
  root.append(wrap);
  draw();
  if (!dailyTargets().ready && !sessionStorage.getItem('stride.foodSetup')) { sessionStorage.setItem('stride.foodSetup', '1'); setTimeout(() => openSettings(draw), 300); }

  function draw() {
    const state = store.get();
    wrap.replaceChildren();
    const isToday = fdate === today();
    const tg = dailyTargets(state);
    const tot = dayTotals(state, fdate);

    wrap.append(h('header', { class: 'top row-between' },
      h('div', null, h('div', { class: 'eyebrow' }, 'Food'), h('h1', { class: 'display-l' }, isToday ? 'Today' : fmtDay(fdate, { weekday: 'long' }))),
      h('button', { class: 'btn small', onclick: () => openSettings(draw) }, 'Targets & AI')));
    wrap.append(h('div', { class: 'week-nav' },
      h('button', { class: 'icon-btn', 'aria-label': 'Previous day', onclick: () => { fdate = addDays(fdate, -1); draw(); } }, icon('back', 20)),
      h('div', { class: 'center' }, h('b', null, fmtDay(fdate, { weekday: 'short', day: 'numeric', month: 'long' }))),
      h('button', { class: 'icon-btn', 'aria-label': 'Next day', disabled: isToday, onclick: () => { fdate = addDays(fdate, 1); draw(); } }, icon('chev', 20))));

    // summary
    if (!tg.ready) {
      wrap.append(h('section', { class: 'card food-sum' },
        h('div', { class: 'eyebrow' }, 'Logged today'),
        h('div', { class: 'metric' }, h('span', { class: 'display-xl' }, tot.kcal.toLocaleString(), h('small', null, ' kcal')), h('span', { class: 'muted' }, `P ${Math.round(tot.protein)} g · C ${Math.round(tot.carbs)} g · F ${Math.round(tot.fat)} g`)),
        h('p', { class: 'muted' }, `To see a daily target, add your ${tg.missing.join(', ')} under Targets & AI. Nothing is assumed about you.`),
        h('button', { class: 'btn', onclick: () => openSettings(draw) }, 'Set up targets')));
    } else {
      const left = tg.kcal - tot.kcal;
      const pct = Math.min(1, tot.kcal / tg.kcal);
      const over = left < 0;
      wrap.append(h('section', { class: `card food-sum${over ? ' over' : ''}` },
        h('div', { class: 'eyebrow' }, over ? 'Over today\u2019s target' : 'Left today'),
        h('div', { class: 'metric' }, h('span', { class: 'display-xl' }, Math.abs(left).toLocaleString(), h('small', null, ' kcal')), h('span', { class: 'muted' }, `${tot.kcal.toLocaleString()} of about ${tg.kcal.toLocaleString()}`)),
        h('div', { class: 'steps-track' }, h('div', { class: 'steps-fill', style: { transform: `scaleX(${pct})` } })),
        h('div', { class: 'macros' }, macro('Protein', tot.protein, tg.protein, true), macro('Carbs', tot.carbs), macro('Fat', tot.fat)),
        over ? h('p', { class: 'muted small' }, resetMessages[0].title + ' Just get back on plan with your next meal. No skipping meals to make up for it.')
          : h('p', { class: 'muted small' }, `About ${tg.deficit} kcal under your estimated maintenance (${tg.maintenance.toLocaleString()}). Estimates are rough, so aim for the trend, not perfection.`)));
    }

    // add
    const text = h('textarea', { class: 'txt', rows: 3, placeholder: 'What did you eat? e.g. 2 roti, 1 katori rajma, small bowl dahi', 'aria-label': 'Describe your meal' });
    let image = null;
    const preview = h('div', { class: 'photo-prev', hidden: true });
    const file = h('input', { type: 'file', accept: 'image/*', hidden: true, 'aria-label': 'Add a photo of your meal' });
    file.addEventListener('change', async () => {
      const f = file.files?.[0]; if (!f) return;
      try { image = await fileToJpeg(f); preview.hidden = false; preview.replaceChildren(h('img', { src: image, alt: 'Meal photo' }), h('button', { class: 'icon-btn', 'aria-label': 'Remove photo', onclick: () => { image = null; preview.hidden = true; file.value = ''; } }, icon('close', 18))); } catch (e) { toast(e.message); }
    });
    const go = h('button', { class: 'btn primary big', onclick: async () => {
      if (!text.value.trim() && !image) { toast('Describe your meal or add a photo.'); return; }
      if (!getKey()) { toast('Add your Claude API key first.'); openSettings(draw); return; }
      go.disabled = true; go.textContent = 'Estimating…'; go.classList.add('busy');
      try {
        const items = await estimateMeal({ text: text.value, image, where });
        sfx.pop();
        openResults(items, text.value, draw);
      } catch (e) {
        toast(e.message, 4200);
        if (e.code === 'NO_KEY' || e.code === 401) openSettings(draw);
      } finally { go.disabled = false; go.textContent = 'Estimate calories with AI'; go.classList.remove('busy'); }
    } }, 'Estimate calories with AI');
    wrap.append(h('section', { class: 'card' },
      h('div', { class: 'sec-head' }, h('h2', null, 'Add food')),
      mealChips(),
      text, preview,
      h('div', { class: 'eyebrow' }, 'Where was it made?'),
      h('div', { class: 'seg' }, WHERE.map(([k, l]) => h('button', { class: `seg-btn${where === k ? ' on' : ''}`, 'aria-pressed': String(where === k), onclick: (e) => { where = k; e.currentTarget.parentElement.querySelectorAll('.seg-btn').forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }); e.currentTarget.classList.add('on'); e.currentTarget.setAttribute('aria-pressed', 'true'); } }, l))),
      h('div', { class: 'row-actions tight' }, h('button', { class: 'btn', onclick: () => file.click() }, icon('upload', 18), ' Add photo'), file, h('button', { class: 'btn', onclick: () => openEditor(null, draw) }, 'Enter by hand')),
      go,
      h('p', { class: 'muted small' }, getKey() ? 'The AI gives its best guess. Check the numbers and fix anything that looks off before adding.' : 'To use the AI, add your own Claude API key under Targets & AI. You can still log from the list below without it.')));

    // quick add
    wrap.append(quickAdd(draw));

    // log
    const items = dayItems(state, fdate);
    const log = h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Logged'), h('span', { class: 'muted' }, `${items.length} item${items.length === 1 ? '' : 's'}`)));
    if (!items.length) log.append(h('p', { class: 'muted' }, 'Nothing logged yet. Log it as you eat. It takes ten seconds and beats guessing at night.'));
    MEALS.forEach((m) => {
      const mi = items.filter((i) => (i.meal || 'Snack') === m);
      if (!mi.length) return;
      log.append(h('div', { class: 'meal-head' }, h('b', null, m), h('span', { class: 'muted' }, `${mi.reduce((a, i) => a + i.kcal, 0)} kcal`)));
      mi.forEach((i) => log.append(h('button', { class: 'food-row', onclick: () => openEditor(i, draw) },
        h('div', null, h('b', null, i.name), h('span', { class: 'muted small' }, [i.portion, i.source === 'ai' ? `AI · ${i.confidence} confidence` : ''].filter(Boolean).join(' · '))),
        h('span', { class: 'kcal' }, String(i.kcal)))));
    });
    wrap.append(log);
    wrap.append(h('p', { class: 'muted small center' }, 'Numbers are estimates, usually within 15–25%. Use them to see the pattern.'));
  }

  function mealChips() {
    return h('div', { class: 'lift-chips wrapchips' }, MEALS.map((m) => h('button', { class: `chip-btn${meal === m ? ' on' : ''}`, onclick: (e) => { meal = m; e.currentTarget.parentElement.querySelectorAll('.chip-btn').forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on'); } }, m)));
  }

  function macro(label, v, target, strong) {
    return h('div', { class: 'macro' }, h('span', { class: 'muted small' }, label), h('b', null, `${Math.round(v)} g`), target ? h('span', { class: 'muted small' }, `goal ~${target} g`) : null);
  }

  function quickAdd() {
    const state = store.get();
    const q = h('input', { class: 'txt-in', type: 'search', placeholder: 'Search roti, dal, biryani, samosa…', 'aria-label': 'Search common foods' });
    const list = h('div', { class: 'qa-list' });
    const rec = recents(state);
    const paint = () => {
      const s = q.value.trim().toLowerCase();
      const res = s ? foods.filter((f) => f.name.toLowerCase().includes(s)).slice(0, 12) : [];
      list.replaceChildren(...(res.length ? res : s ? [h('p', { class: 'muted small' }, 'Not in the list. Describe it above and let the AI estimate it.')] : []).map((f) => (f.nodeType ? f : h('button', { class: 'qa-item', onclick: () => openServings(f) }, h('div', null, h('b', null, f.name), h('span', { class: 'muted small' }, f.unit)), h('span', { class: 'kcal' }, String(f.kcal))))));
    };
    q.addEventListener('input', paint);
    const sec = h('section', { class: 'card' }, h('div', { class: 'sec-head' }, h('h2', null, 'Quick add')), q, list);
    if (rec.length) sec.append(h('div', { class: 'eyebrow' }, 'Recent'), h('div', { class: 'lift-chips wrapchips' }, rec.map((r) => h('button', { class: 'chip-btn', onclick: () => { addItems(fdate, [{ name: r.name, portion: r.portion, kcal: r.kcal, protein: r.protein, carbs: r.carbs, fat: r.fat, source: r.source }], meal); sfx.set(2); toast(`Added ${r.name}`); draw(); } }, `${r.name} · ${r.kcal}`))));
    return sec;
  }

  function openServings(f) {
    let n = 1;
    const out = h('div', { class: 'big-num' });
    const upd = () => { out.textContent = `${Math.round(f.kcal * n)} kcal`; sub.textContent = `P ${fmtNum(f.protein * n, 0)} g · C ${fmtNum(f.carbs * n, 0)} g · F ${fmtNum(f.fat * n, 0)} g`; };
    const sub = h('div', { class: 'muted' });
    const sh = openSheet(f.name, [
      h('p', { class: 'muted' }, `Per serving: ${f.unit}. Approximate. Home cooking varies a lot.`),
      h('div', { class: 'stepper wide' },
        h('button', { class: 'st-btn', 'aria-label': 'Fewer servings', onclick: () => { n = Math.max(0.5, n - 0.5); num.textContent = `${n} serving${n === 1 ? '' : 's'}`; upd(); } }, icon('minus', 18)),
        h('div', { class: 'st-mid' }, h('b', { id: 'sv' }, '1 serving')),
        h('button', { class: 'st-btn', 'aria-label': 'More servings', onclick: () => { n += 0.5; num.textContent = `${n} servings`; upd(); } }, icon('plus', 18))),
      out, sub,
      h('button', { class: 'btn primary big', onclick: () => { addItems(fdate, [{ name: f.name, portion: `${n} × ${f.unit}`, kcal: Math.round(f.kcal * n), protein: Math.round(f.protein * n), carbs: Math.round(f.carbs * n), fat: Math.round(f.fat * n), source: 'db' }], meal); sfx.set(2); sh.close(); toast(`Added to ${meal}`); draw(); } }, `Add to ${meal}`),
    ]);
    const num = sh.sheet.querySelector('#sv');
    upd();
  }

  function openResults(items, desc, after) {
    const total = h('b', { class: 'display-l' });
    const list = h('div', { class: 'res-list' });
    const upd = () => { total.textContent = `${items.reduce((a, i) => a + (i.kcal || 0), 0)} kcal`; };
    const paint = () => {
      list.replaceChildren(...items.map((it, idx) => {
        const kcal = h('input', { class: 'num-in', type: 'text', inputmode: 'numeric', value: String(it.kcal), 'aria-label': `Calories for ${it.name}` });
        kcal.addEventListener('input', () => { it.kcal = parseInt(kcal.value, 10) || 0; upd(); });
        return h('div', { class: 'res-item' },
          h('div', { class: 'res-top' }, h('b', null, it.name), h('button', { class: 'icon-btn', 'aria-label': `Remove ${it.name}`, onclick: () => { items.splice(idx, 1); paint(); upd(); } }, icon('close', 18))),
          h('div', { class: 'muted small' }, it.portion),
          h('div', { class: 'res-nums' }, h('label', null, h('span', { class: 'muted small' }, 'kcal'), kcal), h('span', { class: 'muted small' }, `P ${it.protein} g · C ${it.carbs} g · F ${it.fat} g`), h('span', { class: `chip ${it.confidence === 'high' ? 'good' : it.confidence === 'low' ? 'warn' : ''}` }, it.confidence)),
          it.note ? h('p', { class: 'muted small' }, it.note) : null);
      }));
    };
    paint(); upd();
    const sh = openSheet('AI estimate', [
      h('p', { class: 'muted small' }, 'This is a best guess. Edit any calorie number that looks wrong, or remove items, then add it.'),
      list,
      h('div', { class: 'row-between' }, h('span', { class: 'muted' }, `Adding to ${meal}`), total),
      h('button', { class: 'btn primary big', onclick: () => { if (!items.length) { sh.close(); return; } addItems(fdate, items, meal); sfx.done(); sh.close(); toast('Logged'); after(); } }, 'Add to log'),
    ]);
  }

  function openEditor(item, after) {
    const f = { name: item?.name || '', kcal: item?.kcal ?? '', protein: item?.protein ?? '', carbs: item?.carbs ?? '', fat: item?.fat ?? '' };
    const inp = (k, label, mode) => h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, label), h('input', { class: 'txt-in', type: 'text', inputmode: mode, value: String(f[k]), oninput: (e) => { f[k] = e.target.value; } }));
    const sh = openSheet(item ? 'Edit item' : 'Add by hand', [
      inp('name', 'Name', 'text'), inp('kcal', 'Calories (kcal)', 'numeric'),
      h('div', { class: 'three' }, inp('protein', 'Protein g', 'decimal'), inp('carbs', 'Carbs g', 'decimal'), inp('fat', 'Fat g', 'decimal')),
      h('button', { class: 'btn primary big', onclick: () => {
        const rec = { name: f.name.trim() || 'Food', kcal: Math.round(parseFloat(f.kcal) || 0), protein: Math.round(parseFloat(f.protein) || 0), carbs: Math.round(parseFloat(f.carbs) || 0), fat: Math.round(parseFloat(f.fat) || 0) };
        if (!rec.kcal) { toast('Enter the calories.'); return; }
        item ? updateItem(fdate, item.id, rec) : addItems(fdate, [{ ...rec, portion: '', source: 'manual' }], meal);
        sfx.set(1); sh.close(); after();
      } }, item ? 'Save' : `Add to ${meal}`),
      item ? h('button', { class: 'link-btn danger', onclick: () => { removeItem(fdate, item.id); sh.close(); after(); } }, 'Delete this item') : null,
    ]);
  }
}

function openSettings(after) {
  const p = store.get().profile;
  const key = h('input', { class: 'txt-in', type: 'password', autocomplete: 'off', placeholder: 'sk-ant-…', value: getKey(), 'aria-label': 'Claude API key' });
  const height = h('input', { class: 'txt-in', type: 'text', inputmode: 'numeric', placeholder: 'Height in cm', value: p.heightCm || '', 'aria-label': 'Height in cm' });
  const age = h('input', { class: 'txt-in', type: 'text', inputmode: 'numeric', placeholder: 'Age in years', value: p.age || '', 'aria-label': 'Age in years' });
  const needWeight = !p.startWeight && !Object.keys(store.get().weights).length;
  const wt = h('input', { class: 'txt-in', type: 'text', inputmode: 'decimal', placeholder: 'Weight in kg', 'aria-label': 'Weight in kg' });
  const model = h('select', { class: 'txt-in', 'aria-label': 'AI model' }, models.map((m) => h('option', { value: m.id, selected: m.id === getModel() }, m.label)));
  const def = h('b', { class: 'display-l' }, `${getDeficit()}`);
  const slider = h('input', { type: 'range', min: targets.deficitMin, max: targets.deficitMax, step: 50, value: getDeficit(), 'aria-label': 'Daily calorie deficit', class: 'range' });
  const prev = h('p', { class: 'muted' });
  const calc = () => {
    store.update((s) => { s.settings.deficit = Number(slider.value); const hh = parseInt(height.value, 10); if (hh >= 120 && hh <= 230) s.profile.heightCm = hh; const aa = parseInt(age.value, 10); if (aa >= 10 && aa <= 90) s.profile.age = aa; const ww = parseFloat(wt.value.replace(',', '.')); if (needWeight && ww >= 30 && ww <= 250) s.profile.startWeight = ww; });
    const t = dailyTargets();
    def.textContent = slider.value;
    prev.textContent = t.ready ? `Estimated maintenance ${t.maintenance.toLocaleString()} kcal. Your daily target: about ${t.kcal.toLocaleString()} kcal, protein about ${t.protein} g.` : `Add your ${t.missing.join(', ')} to see your daily target.`;
  };
  slider.addEventListener('input', calc); [height, age, wt].forEach((i) => i.addEventListener('input', calc));
  calc();
  const sh = openSheet('Targets & AI', [
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Height (cm)'), height),
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Age'), age),
    needWeight ? h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Weight (kg)'), wt) : null,
    h('div', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Daily deficit (kcal below maintenance)'), h('div', { class: 'row-between' }, slider, def)),
    prev,
    h('p', { class: 'muted small' }, `Capped at ${targets.deficitMax} kcal. A steady 0.25–0.5 kg a week is the goal, and your target never goes below your resting needs. You are still growing, so eat enough protein and never skip meals. If you are unsure, talk to a doctor or parent about your weight goals.`),
    h('div', { class: 'sec-head' }, h('h2', null, 'AI food estimates')),
    h('p', { class: 'muted' }, 'The logger uses Claude to estimate calories from a description or photo. It needs an API key from console.anthropic.com. The key stays on this device only (it is not included in your backup export) and is sent only to Anthropic. Each estimate costs a fraction of a cent.'),
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Claude API key'), key),
    h('label', { class: 'field' }, h('span', { class: 'eyebrow' }, 'Model'), model),
    h('button', { class: 'btn primary big', onclick: () => { setKey(key.value); store.update((s) => { s.settings.foodModel = model.value; }); calc(); sh.close(); toast('Saved'); after(); } }, 'Save'),
    getKey() ? h('button', { class: 'link-btn danger', onclick: () => { setKey(''); key.value = ''; toast('Key removed from this device'); } }, 'Remove saved key') : null,
  ]);
}
