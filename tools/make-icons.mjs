// Draws the app icon (orange tile, dark ring with an open arc) as PNGs + SVG. No dependencies.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const ss = 3, cx = size / 2;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let ink = 0;
      for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
        const dx = x + (sx + 0.5) / ss - cx, dy = y + (sy + 0.5) / ss - cx;
        const r = Math.hypot(dx, dy) / size, a = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI); // 0 at top, clockwise
        if (r > 0.25 && r < 0.37 && a < 2 * Math.PI * 0.72) ink++;
      }
      const k = ink / (ss * ss), o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = Math.round(255 * (1 - k) + 16 * k); raw[o + 1] = Math.round(90 * (1 - k) + 17 * k); raw[o + 2] = Math.round(31 * (1 - k) + 20 * k); raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
writeFileSync('public/icon-192.png', png(192));
writeFileSync('public/icon-512.png', png(512));
writeFileSync('public/apple-touch-icon.png', png(180));
writeFileSync('public/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#FF5A1F"/><circle cx="50" cy="50" r="31" fill="none" stroke="#101114" stroke-width="12" stroke-dasharray="140 200" transform="rotate(-90 50 50)"/></svg>`);
console.log('icons written');
