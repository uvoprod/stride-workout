import './config/fonts.css';
import './styles/app.css';
import { theme } from './config/theme.js';
import * as store from './core/store.js';
import { h, icon, mountRestBar, clear } from './ui/kit.js';
import { sfx, setSound } from './audio/sfx.js';
import { renderToday } from './screens/today.js';
import { renderWeek } from './screens/week.js';
import { renderProgress } from './screens/progress.js';
import { renderJournal } from './screens/journal.js';
import { renderMe } from './screens/me.js';
import { renderFood } from './screens/food.js';
import { renderOnboarding } from './screens/onboarding.js';
import { renderWorkout } from './screens/workout.js';
import { getWeek } from './config/weeks/index.js';
import { registerSW } from 'virtual:pwa-register';
import { applySteps } from './core/stepsApply.js';
import { openSheet, toast } from './ui/kit.js';
import { today } from './core/dates.js';

// theme → CSS variables
const root = document.documentElement;
const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
Object.entries(theme.colors).forEach(([k, v]) => root.style.setProperty('--' + kebab(k), v));
root.style.setProperty('--font-display', theme.fonts.display);
root.style.setProperty('--font-ui', theme.fonts.ui);
root.style.setProperty('--display-stretch', theme.fonts.displayStretch);
root.style.setProperty('--r-card', theme.radius.card);
root.style.setProperty('--r-ctl', theme.radius.control);

const app = document.getElementById('app');
const TABS = [
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'week', label: 'Week', icon: 'week' },
  { id: 'progress', label: 'Progress', icon: 'progress' },
  { id: 'food', label: 'Food', icon: 'food' },
  { id: 'journal', label: 'Journal', icon: 'journal' },
  { id: 'me', label: 'Me', icon: 'me' },
];

const main = h('main', { id: 'main', class: 'main', tabindex: '-1' });
const soundBtn = h('button', { class: 'icon-btn sound-btn', 'aria-label': 'Toggle sound', onclick: () => { setSound(!store.get().settings.sound); paintSound(); } });
const paintSound = () => {
  const on = store.get().settings.sound;
  soundBtn.replaceChildren(icon(on ? 'vol' : 'mute', 22));
  soundBtn.setAttribute('aria-pressed', String(on));
  soundBtn.title = on ? 'Sound on' : 'Sound off';
};
const nav = h('nav', { class: 'tabbar', 'aria-label': 'Main' }, TABS.map((t) => h('a', { class: 'tab', href: `#/${t.id}`, dataset: { tab: t.id } }, icon(t.icon, 22), h('span', null, t.label))));
const topbar = h('div', { class: 'appbar' }, h('span', { class: 'brand' }, theme.brand), soundBtn);
app.append(topbar, main, nav);
mountRestBar(app);
paintSound();

let cleanups = [];

// #/import?steps=8421&date=2026-11-08  (for phone automations). Always asks before saving.
function handleImportLink() {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const steps = parseInt(q.get('steps'), 10);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(q.get('date') || '') ? q.get('date') : today();
  history.replaceState(null, '', location.pathname + location.search + '#/today');
  if (!store.get().profile) return;
  if (!(steps > 0 && steps < 100000)) { toast('That link did not include a valid step count.'); return; }
  const sh = openSheet('Save steps?', [
    h('p', null, `Set steps for ${date} to ${steps.toLocaleString()}?`),
    h('button', { class: 'btn primary big', onclick: () => { applySteps({ [date]: steps }); sh.close(); toast('Steps saved'); route(); } }, 'Save steps'),
    h('button', { class: 'link-btn', onclick: () => sh.close() }, 'Cancel'),
  ]);
}
function route() {
  cleanups.forEach((c) => c());
  cleanups = [];
  clear(main);
  const state = store.get();
  if (!state.profile) {
    nav.hidden = topbar.hidden = true;
    renderOnboarding(app, () => { nav.hidden = topbar.hidden = false; route(); });
    return;
  }
  nav.hidden = topbar.hidden = false;
  if (location.hash.startsWith('#/import')) setTimeout(handleImportLink, 0);
  const [, page = 'today', a, b] = location.hash.split('/');
  let active = page;
  if (page === 'session' && getWeek(Number(a))?.days[b]) {
    active = 'week';
    main.append(h('a', { class: 'back-link', href: '#/week' }, icon('back', 18), ' Week'));
    const holder = h('div', { class: 'screen' });
    main.append(holder);
    renderWorkout(holder, Number(a), b);
  } else if (page === 'week') renderWeek(main);
  else if (page === 'progress') renderProgress(main);
  else if (page === 'food') renderFood(main);
  else if (page === 'journal') renderJournal(main);
  else if (page === 'me') renderMe(main);
  else { active = 'today'; renderToday(main, cleanups); }
  nav.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.tab === active;
    t.classList.toggle('on', on);
    on ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();
addEventListener('pointerdown', () => sfx.unlock(), { once: true });
registerSW({ immediate: true });
// ask the browser not to evict saved data
try { navigator.storage?.persist?.(); } catch { /* ignore */ }
