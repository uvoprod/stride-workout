// The three phases of the 12-week plan.
export const phases = {
  foundation: {
    key: 'foundation', index: 1, name: 'Foundation', weeks: [1, 4], minutes: '40–50',
    blurb: 'Learn the movements, build stamina and get used to training. Moderate volume, easy effort.',
    rules: ['RPE 6–7: stop with 2–4 reps still in the tank.', '2–3 sets per exercise, 60–90 s rest.', 'Form first. Add weight only when the app says so.', 'Week 4 is a deload.'],
  },
  build: {
    key: 'build', index: 2, name: 'Build', weeks: [5, 8], minutes: '45–55',
    blurb: 'More sets, more weight, shorter rests and tougher finishers.',
    rules: ['RPE 7–8: 1–3 reps left in the tank.', '3–4 sets on big lifts, 45–75 s rest.', 'Finishers climb to 8–9 min.', 'Week 8 is a deload.'],
  },
  peak: {
    key: 'peak', index: 3, name: 'Peak', weeks: [9, 12], minutes: '45–55',
    blurb: 'Highest work capacity: supersets and circuits. Week 12 is test week for your jump.',
    rules: ['RPE 8: 1–2 reps left in the tank.', 'Supersets: do both moves back to back, then rest.', 'Finishers up to 10 min.', 'Week 12: volume drops, jump test.'],
  },
};

export const phaseOfWeek = (w) => (w <= 4 ? phases.foundation : w <= 8 ? phases.build : phases.peak);

// Rating scale shown wherever RPE appears
export const RPE_HELP = {
  5: 'Easy. You could do 5+ more reps.',
  6: 'Comfortable. You could do 4 more reps.',
  7: 'Solid. You could do 3 more reps.',
  8: 'Hard. You could do 2 more reps.',
  9: 'Very hard. 1 more rep at most.',
  10: 'Max. Nothing left.',
};
