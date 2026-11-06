// Three.js scenes: the 3D progress ring and the rotating badge coin.
import * as THREE from 'three';
import { theme } from '../config/theme.js';

const C = theme.colors;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (k) => 1 - Math.pow(1 - k, 3);

function baseRenderer(container) {
  const w = container.clientWidth || 240, h = container.clientHeight || 240;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  container.append(renderer.domElement);
  renderer.domElement.style.display = 'block';
  return renderer;
}

function lights(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(2.5, 3.5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd9c7, 0.9);
  rim.position.set(-3, -1.5, 2);
  scene.add(rim);
}

function visibleLoop(container, renderer, tick) {
  let raf = 0, visible = true, dead = false;
  const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; });
  io.observe(container);
  const loop = (t) => {
    if (dead) return;
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    tick(t / 1000);
  };
  raf = requestAnimationFrame(loop);
  return () => { dead = true; cancelAnimationFrame(raf); io.disconnect(); renderer.dispose(); renderer.domElement.remove(); };
}

// ── Progress ring ───────────────────────────────────────────────────────────
export function createRing(container, { progress = 0, weeks = [] } = {}) {
  const renderer = baseRenderer(container);
  if (!renderer) { container.classList.add('no-webgl'); return { setProgress() {}, celebrate() {}, dispose() {} }; }
  const scene = new THREE.Scene();
  const w = container.clientWidth || 240, hgt = container.clientHeight || 240;
  const camera = new THREE.PerspectiveCamera(32, w / hgt, 0.1, 50);
  camera.position.set(0, 0, 7.6);
  lights(scene);

  const group = new THREE.Group();
  scene.add(group);
  const R = 1.35, tube = 0.2;

  const trackMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(C.track), roughness: 0.65, metalness: 0.05 });
  const track = new THREE.Mesh(new THREE.TorusGeometry(R, tube * 0.9, 28, 140), trackMat);
  group.add(track);

  const fillMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(C.accent), roughness: 0.38, metalness: 0.12 });
  let fill = null;
  const capStart = new THREE.Mesh(new THREE.SphereGeometry(tube, 28, 20), fillMat);
  const capEnd = new THREE.Mesh(new THREE.SphereGeometry(tube, 28, 20), fillMat);
  group.add(capStart, capEnd);
  fill = new THREE.Mesh(new THREE.BufferGeometry(), fillMat);
  group.add(fill);

  // 12 week pegs orbiting outside the ring
  const pegs = [];
  for (let i = 0; i < 12; i++) {
    const a = Math.PI / 2 - (i / 12) * Math.PI * 2 - Math.PI / 12;
    const m = new THREE.MeshStandardMaterial({ color: 0xcfcbc0, roughness: 0.5 });
    const peg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.14), m);
    peg.position.set(Math.cos(a) * (R + 0.52), Math.sin(a) * (R + 0.52), 0);
    peg.rotation.z = a - Math.PI / 2;
    group.add(peg);
    pegs.push(peg);
  }
  const paintPegs = () => pegs.forEach((p, i) => {
    const s = weeks[i];
    p.material.color.set(s === 'done' ? C.ink : s === 'current' ? C.accent : 0xcfcbc0);
    p.scale.y = s === 'current' ? 1.35 : 1;
  });
  paintPegs();

  let shown = 0, target = progress, flip = 0, flipStart = 0, pulse = 0;
  const setArc = (p) => {
    const arc = Math.max(0.0001, Math.min(1, p) * Math.PI * 2);
    fill.geometry.dispose();
    fill.geometry = new THREE.TorusGeometry(R, tube, 28, Math.max(2, Math.round(140 * p)), arc);
    fill.rotation.z = Math.PI / 2 - arc;
    capStart.position.set(0, R, 0);
    capEnd.position.set(Math.cos(Math.PI / 2 - arc) * R, Math.sin(Math.PI / 2 - arc) * R, 0);
    capStart.visible = capEnd.visible = fill.visible = p > 0.002;
  };
  setArc(0);

  // tilt with pointer
  let tx = 0, ty = 0;
  const onMove = (e) => {
    const r = container.getBoundingClientRect();
    ty = ((e.clientX - r.left) / r.width - 0.5) * 0.7;
    tx = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
  };
  const onLeave = () => { tx = ty = 0; };
  container.addEventListener('pointermove', onMove);
  container.addEventListener('pointerleave', onLeave);

  // confetti
  const bits = [];
  const bitGeo = new THREE.BoxGeometry(0.08, 0.14, 0.03);
  function burst() {
    const cols = [C.accent, C.ink, '#ffffff', '#ffb08f'];
    for (let i = 0; i < 70; i++) {
      const m = new THREE.Mesh(bitGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color(cols[i % cols.length]), roughness: 0.5 }));
      const a = Math.random() * Math.PI * 2, sp = 1.2 + Math.random() * 2.4;
      m.position.set(0, 0, 0.2);
      m.userData = { v: new THREE.Vector3(Math.cos(a) * sp, Math.sin(a) * sp + 1, (Math.random() - 0.3) * 2), r: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8), life: 0, max: 1.3 + Math.random() * 0.7 };
      scene.add(m);
      bits.push(m);
    }
  }

  let last = 0;
  const stop = visibleLoop(container, renderer, (t) => {
    const dt = Math.min(0.05, t - last || 0.016); last = t;
    if (Math.abs(shown - target) > 0.0005) { shown += (target - shown) * Math.min(1, dt * 4.5); setArc(shown); } else if (shown !== target) { shown = target; setArc(shown); }
    const rm = reduce();
    const sway = rm ? 0 : Math.sin(t * 0.7) * 0.28;
    let fy = 0;
    if (flip) { const k = Math.min(1, (t - flipStart) / 1.1); fy = ease(k) * Math.PI * 2; if (k >= 1) flip = 0; }
    group.rotation.y += ((sway + ty + fy) - group.rotation.y) * (flip ? 1 : 0.12);
    group.rotation.x += ((-0.28 + tx + (rm ? 0 : Math.sin(t * 0.5) * 0.06)) - group.rotation.x) * 0.1;
    if (pulse > 0) { pulse -= dt * 1.6; const s = 1 + Math.sin(Math.max(0, pulse) * Math.PI) * 0.12; group.scale.setScalar(s); } else group.scale.setScalar(1);
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i], u = b.userData;
      u.life += dt; u.v.y -= 3.2 * dt;
      b.position.addScaledVector(u.v, dt);
      b.rotation.x += u.r.x * dt; b.rotation.y += u.r.y * dt;
      const k = u.life / u.max;
      b.scale.setScalar(Math.max(0, 1 - k * k));
      if (u.life > u.max) { scene.remove(b); b.material.dispose(); bits.splice(i, 1); }
    }
    renderer.render(scene, camera);
  });

  return {
    setProgress(p, wk) { target = Math.max(0, Math.min(1, p)); if (wk) { weeks = wk; paintPegs(); } },
    setWeeks(wk) { weeks = wk; paintPegs(); },
    jumpTo(p) { shown = target = p; setArc(p); },
    celebrate() { if (reduce()) return; flip = 1; flipStart = last; pulse = 1; burst(); },
    dispose() { stop(); container.removeEventListener('pointermove', onMove); container.removeEventListener('pointerleave', onLeave); },
  };
}

// ── Badge coin ──────────────────────────────────────────────────────────────
function coinTexture(glyph) {
  const s = 512, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = C.accent; g.fillRect(0, 0, s, s);
  g.strokeStyle = C.ink; g.lineWidth = 10;
  g.beginPath(); g.arc(s / 2, s / 2, 214, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.arc(s / 2, s / 2, 190, 0, Math.PI * 2); g.stroke();
  g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  const size = glyph.length > 2 ? 150 : glyph.length > 1 ? 200 : 260;
  g.font = `800 ${size}px 'Archivo Variable', 'Arial Narrow', sans-serif`;
  g.fillText(glyph, s / 2, s / 2 + 10);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCoin(container, glyph) {
  const renderer = baseRenderer(container);
  if (!renderer) { container.textContent = glyph; return { dispose() {} }; }
  const scene = new THREE.Scene();
  const w = container.clientWidth || 200, hgt = container.clientHeight || 200;
  const camera = new THREE.PerspectiveCamera(30, w / hgt, 0.1, 30);
  camera.position.set(0, 0, 5.2);
  lights(scene);
  const tex = coinTexture(glyph);
  const edge = new THREE.MeshStandardMaterial({ color: new THREE.Color(C.ink), roughness: 0.35, metalness: 0.5 });
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.2 });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.2, 80), [edge, face, face]);
  coin.rotation.x = Math.PI / 2;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.07, 20, 90), edge);
  const holder = new THREE.Group();
  holder.add(coin);
  const rimA = rim.clone(); rimA.position.z = 0.1;
  const rimB = rim.clone(); rimB.position.z = -0.1;
  holder.add(rimA, rimB);
  scene.add(holder);
  let drag = 0;
  const onDown = () => { drag = 1; };
  container.addEventListener('pointerdown', onDown);
  const stop = visibleLoop(container, renderer, (t) => {
    holder.rotation.y = reduce() ? 0.4 : t * 1.2 + drag * Math.sin(t * 3) * 0.3;
    holder.rotation.x = Math.sin(t * 0.8) * 0.12;
    renderer.render(scene, camera);
  });
  return { dispose() { stop(); tex.dispose(); } };
}
