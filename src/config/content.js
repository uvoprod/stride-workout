// Words in the app: quotes, journal prompts, habits, messages. Edit freely.

export const quotes = [
  'Show up. The plan does the rest.',
  'Strong is built one boring rep at a time.',
  'You do not need a perfect day. You need a done day.',
  'Slow progress is still progress.',
  'The bar does not care about your mood. Go anyway.',
  'Leave one rep in the tank, come back tomorrow.',
  'Consistency beats intensity every single week.',
  'You are not behind. You are on week one of getting stronger.',
  'Sweat now, jump higher later.',
  'Compare yourself to last week, not to anyone else.',
  'Good form today is heavy weights next month.',
  'Discipline is just remembering what you want.',
  'One workout will not change you. Thirty-six will.',
  'Tired is a feeling. Done is a fact.',
  'Eat well, sleep well, lift well. Repeat.',
  'Your future self is watching. Give them something good.',
  'Small wins stack up quietly.',
  'Be proud of the rep nobody saw.',
  'The first five minutes are the hardest. Start them.',
  'A bad workout still beats no workout.',
  'Strength is a skill. Practise it.',
  'Trust the trend, not the scale on one random morning.',
  'Hard things get easier when you keep doing them.',
  'Rest is part of the plan, not a break from it.',
  'You are building the person who finishes things.',
  'Breathe. Brace. Lift.',
  'Today you are lighter than yesterday\'s excuses.',
  'Progress loves patience.',
  'Make the next set cleaner than the last.',
  'Fitness is rented, not owned. Pay a little every day.',
];

export const prompts = [
  'What went well today?',
  'What felt easier than last week?',
  'What is one thing you are proud of today?',
  'What made training hard today, and what would help?',
  'Who or what helped you stay on track?',
  'What is one small thing you will do better tomorrow?',
  'What did your body tell you today?',
  'What are you looking forward to this week?',
];

// Habit checklist. `auto: 'steps'` ticks itself when you reach the step goal.
export const habits = [
  { id: 'steps', label: 'Hit the step goal', auto: 'steps' },
  { id: 'water', label: 'Water through the day (about 2–3 L)' },
  { id: 'protein', label: 'Protein at every meal' },
  { id: 'sleep', label: 'Sleep 8+ hours last night' },
  { id: 'veg', label: 'Vegetables with lunch and dinner' },
];

// "Ate too much yesterday" — no punishment, just perspective.
export const resetMessages = [
  { title: 'One day does not undo twelve weeks.', body: 'Your results come from the pattern, not one meal or one day. Nothing to make up for and no extra workout to earn it back.' },
  { title: 'It is already behind you.', body: 'Every body has days like this. The trend line barely notices. What matters is what you do next.' },
  { title: 'Fat does not come back overnight.', body: 'A heavy day mostly shows up as water and food weight, which settles in a few days. Your trend line smooths it out.' },
];
export const resetAction = 'Just get back on plan today: your normal workout, your normal meals, your steps and a glass of water now.';

export const celebrations = [
  'Session done. That is one more in the bank.',
  'Locked in. Nice work.',
  'Another one. This is how it gets built.',
  'Finished what you started. That is the habit.',
];

export const stepsNote = 'Steps count from any phone or watch. Your goal rises a little every couple of weeks.';

export const safetyNote = 'Muscle fatigue and a burn are normal. Sharp, pinching or joint pain is not: stop that exercise and tell a coach, parent or doctor if it keeps happening. This plan is general guidance for healthy teenagers, not medical advice.';
