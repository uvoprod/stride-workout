// ─────────────────────────────────────────────────────────────────────────────
// THEME — change colours, fonts and shape here. Applied to the page as CSS
// variables at start-up (see applyTheme in main.js).  Fonts are bundled
// locally in src/assets/fonts and declared in fonts.css.
// ─────────────────────────────────────────────────────────────────────────────
export const theme = {
  brand: 'STRIDE',
  colors: {
    bg: '#F4F3EE',        // clean off-white page
    surface: '#FCFBF8',   // cards
    ink: '#101114',       // crisp dark text
    muted: '#6A6963',     // secondary text
    line: '#E2E0D7',      // hairlines
    lineStrong: '#101114',
    accent: '#FF5A1F',    // the one bold colour (try cobalt #1F4DFF)
    accentDeep: '#C23A05',// accent for small text (better contrast)
    accentSoft: '#FFE3D6',// flat tint for bands / chips
    onAccent: '#101114',  // text on top of the accent colour
    good: '#1E7A4C',
    warn: '#B4620A',
    track: '#DEDBD0',     // unfilled ring / bars
  },
  fonts: {
    display: "'Archivo Variable', 'Arial Narrow', sans-serif",
    ui: "'Geist Variable', system-ui, sans-serif",
    displayStretch: '84%', // Archivo width axis 62–125: lower = more condensed
  },
  radius: { card: '12px', control: '10px' },
};
