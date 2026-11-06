// Milestone badges. `rule.type` is evaluated in src/core/badges.js:
//   sessions n | weekDone w | phaseDone key | pr n | jumpTests n | jumpGain cm
//   habitStreak n | waistLost cm | journal n | weighIns n
export const badges = [
  { id: 'first-session', name: 'First rep', desc: 'Finish your very first session.', glyph: '1', rule: { type: 'sessions', n: 1 } },
  { id: 'first-week', name: 'Week one done', desc: 'Finish all three core sessions in week 1.', glyph: 'W1', rule: { type: 'weekDone', w: 1 } },
  { id: 'first-pr', name: 'First PR', desc: 'Beat your previous best on any lift.', glyph: 'PR', rule: { type: 'pr', n: 1 } },
  { id: 'ten-sessions', name: '10 workouts', desc: 'Complete 10 sessions.', glyph: '10', rule: { type: 'sessions', n: 10 } },
  { id: 'jump-baseline', name: 'Off the ground', desc: 'Log your first vertical jump test.', glyph: 'VJ', rule: { type: 'jumpTests', n: 1 } },
  { id: 'deload-1', name: 'Recovered', desc: 'Complete the week-4 deload.', glyph: 'W4', rule: { type: 'weekDone', w: 4 } },
  { id: 'foundation', name: 'Foundation laid', desc: 'Finish phase 1 (weeks 1–4).', glyph: 'P1', rule: { type: 'phaseDone', key: 'foundation' } },
  { id: 'habit-7', name: 'Seven in a row', desc: 'Hit 3+ habits for 7 days straight.', glyph: '7D', rule: { type: 'habitStreak', n: 7 } },
  { id: 'waist-2', name: 'Minus two', desc: 'Take 2 cm off your waist.', glyph: '−2', rule: { type: 'waistLost', cm: 2 } },
  { id: 'twenty-five', name: '25 workouts', desc: 'Complete 25 sessions.', glyph: '25', rule: { type: 'sessions', n: 25 } },
  { id: 'jump-up', name: 'Higher', desc: 'Add 3 cm to your vertical jump.', glyph: '+3', rule: { type: 'jumpGain', cm: 3 } },
  { id: 'build', name: 'Built', desc: 'Finish phase 2 (weeks 5–8).', glyph: 'P2', rule: { type: 'phaseDone', key: 'build' } },
  { id: 'journal-10', name: 'Reflective', desc: 'Write 10 journal entries.', glyph: 'LOG', rule: { type: 'journal', n: 10 } },
  { id: 'waist-5', name: 'Minus five', desc: 'Take 5 cm off your waist.', glyph: '−5', rule: { type: 'waistLost', cm: 5 } },
  { id: 'peak', name: 'Peaked', desc: 'Finish phase 3 (weeks 9–12).', glyph: 'P3', rule: { type: 'phaseDone', key: 'peak' } },
  { id: 'all-36', name: 'The full 36', desc: 'Complete all 36 core sessions.', glyph: '36', rule: { type: 'sessions', n: 36, core: true } },
];
