// ─────────────────────────────────────────────────────────────────────────────
// WARM-UPS, COOL-DOWN STRETCHES and the REST-DAY MOBILITY routine — edit freely.
//   hold: seconds per hold   sides: 2 = do each side   reps: for moving drills
// Stretch gently: a pull, never a sharp pain. Breathe slowly, don't bounce.
// ─────────────────────────────────────────────────────────────────────────────

// Dynamic warm-up (about 6–8 min). Cue: warm, not tired.
export const warmups = {
  push: [
    { name: 'Easy bike', detail: '3 min, light. You should be able to chat.' },
    { name: 'Arm circles', detail: '10 forward, 10 back, then 10 big cross-body swings.' },
    { name: 'Band-free pull-aparts', detail: 'Arms straight out front, squeeze them wide apart × 12.' },
    { name: 'Scap push-ups', detail: 'Plank on hands, let chest sink and rise only through shoulder blades × 10.' },
    { name: 'Ramp-up set', detail: 'First lift: 1 set × 10 at half your working weight.' },
  ],
  pull: [
    { name: 'Easy bike', detail: '3 min, light.' },
    { name: 'Cat–cow', detail: '8 slow reps on hands and knees.' },
    { name: 'Shoulder rolls + wall slides', detail: '10 rolls each way, then 8 wall slides.' },
    { name: 'Hip hinges', detail: 'Hands on hips, push hips back, flat back × 10.' },
    { name: 'Ramp-up set', detail: 'First lift: 1 set × 10 at half your working weight.' },
  ],
  legs: [
    { name: 'Easy bike', detail: '3 min, light.' },
    { name: 'Leg swings', detail: '10 front-to-back and 10 side-to-side each leg, holding a rail.' },
    { name: 'Bodyweight squats', detail: '10 slow, full-range reps. Knees over toes.' },
    { name: 'Glute bridges', detail: '10 reps, squeeze at the top.' },
    { name: 'Ankle rocks + calf raises', detail: '10 ankle rocks each side, 15 calf raises.' },
    { name: 'Practice jumps', detail: '2 jumps at about 50% effort with soft, quiet landings.' },
  ],
  cond: [
    { name: 'Easy bike', detail: '3 min, light.' },
    { name: 'Hip circles', detail: '8 each direction each leg.' },
    { name: 'Arm swings', detail: '15 hugging yourself, then opening wide.' },
    { name: 'Bodyweight squats', detail: '10 slow reps.' },
  ],
};

const s = (name, hold, sides, cue) => ({ name, hold, sides, cue });

// Cool-down stretching after every session (about 6 min).
export const cooldowns = {
  push: [
    s('Doorway chest stretch', 30, 2, 'Forearm on a frame, step through until you feel the front of your chest open.'),
    s('Cross-body shoulder stretch', 25, 2, 'Pull your arm across your chest, keep the shoulder down.'),
    s('Overhead triceps stretch', 25, 2, 'Elbow up and bent, gently press it back with the other hand.'),
    s('Wrist flexor stretch', 20, 2, 'Arm straight, palm up, gently pull your fingers back.'),
    s("Child's pose", 40, 1, 'Sit hips back toward heels, arms long. Breathe into your back.'),
  ],
  pull: [
    s('Lat stretch on a rack or bar', 30, 2, 'Hold on, sit your hips back and lean away. Feel the side of your back lengthen.'),
    s('Biceps wall stretch', 25, 2, 'Palm flat on the wall behind you, turn your body away slowly.'),
    s('Upper-back hug stretch', 30, 1, 'Hug yourself and round your upper back, chin tucked.'),
    s('Thread the needle', 30, 2, 'On hands and knees, slide one arm under your body, rest your shoulder down.'),
    s("Child's pose", 40, 1, 'Hips back, arms long, slow belly breaths.'),
  ],
  legs: [
    s('Standing quad stretch', 30, 2, 'Heel toward your glute, knees together. Hold a rail.'),
    s('Hamstring stretch', 30, 2, 'Heel on a low step, hinge forward with a flat back.'),
    s('Half-kneeling hip flexor stretch', 30, 2, 'Squeeze the glute of the kneeling leg and tuck your tailbone.'),
    s('Figure-4 glute stretch', 30, 2, 'On your back, ankle on opposite knee, pull the thigh toward you.'),
    s('Wall calf stretch', 30, 2, 'Back heel stays down, back leg straight, lean in.'),
    s('Deep squat hold', 30, 1, 'Hold a post for balance, heels down, chest up, elbows pushing knees out.'),
  ],
  cond: [
    s('Half-kneeling hip flexor stretch', 30, 2, 'Tailbone tucked, squeeze the glute.'),
    s('Hamstring stretch', 30, 2, 'Heel on a low step, flat back.'),
    s('Doorway chest stretch', 25, 2, 'Open the front of the chest.'),
    s("Child's pose", 40, 1, 'Hips back, arms long.'),
    s('Slow breathing', 60, 1, 'Lie on your back, 4 s in through the nose, 6 s out. Heart rate down.'),
  ],
};

// 6-minute daily mobility routine for rest days (or any time you feel stiff).
export const mobility = {
  title: 'Daily mobility reset',
  blurb: 'Six minutes, no equipment. Do it on rest days or after school to loosen up and recover faster.',
  moves: [
    s('Cat–cow', 40, 1, 'Slow reps, move your whole spine. 8–10 breaths.'),
    s("World's greatest stretch", 30, 2, 'Deep lunge, inside elbow toward the floor, then rotate the top arm up.'),
    s('90/90 hip switch', 40, 1, 'Sit with both knees bent at 90°, rotate knees side to side.'),
    s('Thoracic rotation', 30, 2, 'On hands and knees, hand behind head, rotate elbow up to the ceiling.'),
    s('Ankle rocks', 30, 2, 'Knee travels forward over your toes, heel stays down.'),
    s('Deep squat hold', 40, 1, 'Heels down, chest tall, press knees out with your elbows.'),
    s('Slow breathing', 60, 1, '4 s in, 6 s out. Shoulders drop on every breath out.'),
  ],
};

// Optional extras: foam-rolling and recovery habits shown with the cool-down.
export const recoveryTips = [
  'Foam roll quads, calves and upper back for 30–45 s each if you have time (stop on any sharp pain).',
  'Drink a glass of water and eat a protein-rich meal within a couple of hours of training.',
  'Sleep is when you get stronger: aim for 8+ hours tonight.',
];
