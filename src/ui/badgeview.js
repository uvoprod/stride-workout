import { h, openSheet } from './kit.js';
import { createCoin } from '../three/scenes.js';
import { fmtDay } from '../core/dates.js';
import * as store from '../core/store.js';
import { sfx } from '../audio/sfx.js';

export function openBadge(b, unlocked) {
  const stage = h('div', { class: 'coin-stage' });
  let coin;
  const when = store.get().badges[b.id];
  const sheet = openSheet(unlocked ? 'Badge unlocked' : 'Badge', [
    stage,
    h('h3', { class: 'center badge-name' }, b.name),
    h('p', { class: 'center muted' }, b.desc),
    unlocked && when ? h('p', { class: 'center small muted' }, `Earned ${fmtDay(when)}`) : null,
  ], { onClose: () => coin?.dispose() });
  requestAnimationFrame(() => {
    if (unlocked) { coin = createCoin(stage, b.glyph); sfx.badge(); } else stage.append(h('div', { class: 'coin-locked' }, b.glyph));
  });
  return sheet;
}
