// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE LIBRARY — edit freely.
//   mode:   'kg'   weight + reps          'reps' bodyweight reps
//           'time' seconds held           'jump' jump reps (no weight)
//           'jumptest' special jump-test card
//   startKg: a *guess* for a 90 kg beginner. The app shows it only the first
//            time, labelled as a guess. Always adjust by feel (RPE).
//   inc:    smallest sensible weight jump when the app says "add weight".
//   each:   true = weight is per hand (dumbbells)
//   swaps:  other exercise ids you can use if the machine is taken.
// ─────────────────────────────────────────────────────────────────────────────

export const exercises = {
  // ── PUSH ────────────────────────────────────────────────────────────────
  'chest-press-machine': {
    name: 'Lying chest press (machine)', muscle: 'Chest', mode: 'kg', startKg: 20, inc: 2.5,
    cues: ['Shoulder blades pinched back and down, chest proud.', 'Press out smoothly, stop just before your elbows lock.', 'Lower for a slow 2-count — do not let the stack slam.'],
    swaps: ['db-bench-press', 'incline-pushup', 'incline-db-press'],
  },
  'db-bench-press': {
    name: 'Dumbbell bench press', muscle: 'Chest', mode: 'kg', each: true, startKg: 8, inc: 2,
    cues: ['Feet flat, shoulder blades pinched into the bench.', 'Elbows about 45° from your body, not flared out wide.', 'Lower until dumbbells sit level with your chest, then press up.'],
    swaps: ['chest-press-machine', 'incline-pushup'],
  },
  'incline-db-press': {
    name: 'Incline dumbbell press', muscle: 'Upper chest', mode: 'kg', each: true, startKg: 8, inc: 2,
    cues: ['Bench at a low incline (about 30°) — not steep.', 'Wrists stacked over elbows the whole way.', 'Press up and slightly together; control the way down.'],
    swaps: ['chest-press-machine', 'db-bench-press', 'incline-pushup'],
  },
  'incline-pushup': {
    name: 'Incline push-up', muscle: 'Chest', mode: 'reps', startKg: null, inc: 0,
    cues: ['Hands on a bar or bench — higher is easier.', 'Body in one straight line from head to heels.', 'Chest touches the bar; elbows about 45° from your ribs.'],
    swaps: ['chest-press-machine', 'db-bench-press'],
  },
  'cable-fly': {
    name: 'Cable chest fly', muscle: 'Chest', mode: 'kg', startKg: 5, inc: 2.5,
    cues: ['Slight bend in the elbows, locked in place.', 'Hug a big tree — hands meet in front of your chest.', 'Feel the stretch across your chest, no shoulder pinch.'],
    swaps: ['pec-deck', 'incline-pushup'],
  },
  'pec-deck': {
    name: 'Pec deck (machine fly)', muscle: 'Chest', mode: 'kg', startKg: 15, inc: 2.5,
    cues: ['Seat height so handles are at chest level.', 'Squeeze with your chest, not by shrugging.', 'Slow back out — stop when you feel a stretch.'],
    swaps: ['cable-fly', 'incline-pushup'],
  },
  'shoulder-press-machine': {
    name: 'Shoulder press (machine)', muscle: 'Shoulders', mode: 'kg', startKg: 15, inc: 2.5,
    cues: ['Back flat on the pad, ribs down — do not arch.', 'Press up without shrugging toward your ears.', 'Lower to about ear level, then press again.'],
    swaps: ['db-shoulder-press', 'lateral-raise'],
  },
  'db-shoulder-press': {
    name: 'Seated dumbbell shoulder press', muscle: 'Shoulders', mode: 'kg', each: true, startKg: 6, inc: 2,
    cues: ['Sit tall with your back against the pad.', 'Start with dumbbells at ear level, palms forward.', 'Press straight up; do not lean back.'],
    swaps: ['shoulder-press-machine', 'lateral-raise'],
  },
  'lateral-raise': {
    name: 'Dumbbell lateral raise', muscle: 'Side delts', mode: 'kg', each: true, startKg: 3, inc: 1,
    cues: ['Light weight, slow reps. Ego at the door.', 'Lead with your elbows, raise to shoulder height only.', 'Slight forward lean, no swinging.'],
    swaps: ['cable-lateral-raise'],
  },
  'cable-lateral-raise': {
    name: 'Cable lateral raise', muscle: 'Side delts', mode: 'kg', each: true, startKg: 2.5, inc: 1.25,
    cues: ['Stand side-on to the cable, handle in the far hand.', 'Raise to shoulder height, elbow slightly bent.', 'Pause one beat at the top, lower for 2 counts.'],
    swaps: ['lateral-raise'],
  },
  'triceps-pushdown': {
    name: 'Triceps pushdown (bar)', muscle: 'Triceps', mode: 'kg', startKg: 15, inc: 2.5,
    cues: ['Elbows pinned to your sides — only your forearms move.', 'Push down until arms are straight, squeeze.', 'Let the bar rise slowly to chest height.'],
    swaps: ['triceps-rope', 'db-overhead-triceps'],
  },
  'triceps-rope': {
    name: 'Triceps rope pushdown', muscle: 'Triceps', mode: 'kg', startKg: 12, inc: 2.5,
    cues: ['Elbows pinned to your sides.', 'Pull the rope apart at the bottom, squeeze.', 'Control the way up — no bouncing.'],
    swaps: ['triceps-pushdown', 'db-overhead-triceps'],
  },
  'db-overhead-triceps': {
    name: 'Dumbbell overhead triceps extension', muscle: 'Triceps', mode: 'kg', startKg: 8, inc: 2,
    cues: ['Hold one dumbbell with both hands overhead.', 'Elbows point forward, not out to the sides.', 'Lower behind your head, then straighten fully.'],
    swaps: ['triceps-pushdown', 'triceps-rope'],
  },

  // ── PULL ────────────────────────────────────────────────────────────────
  'lat-pulldown': {
    name: 'Lat pulldown', muscle: 'Back', mode: 'kg', startKg: 35, inc: 2.5,
    cues: ['Thighs locked under the pad, chest up.', 'Pull the bar to your upper chest, elbows down to your pockets.', 'Do not swing back; let the bar rise slowly.'],
    swaps: ['assisted-pullup', 'db-row', 'seated-cable-row'],
  },
  'assisted-pullup': {
    name: 'Assisted pull-up (machine)', muscle: 'Back', mode: 'kg', startKg: 40, inc: 2.5, assisted: true,
    cues: ['More assistance weight = easier. Choose a weight you can pull with control.', 'Start from a full hang, shoulders away from your ears.', 'Chin over the bar, then lower for 3 counts.'],
    swaps: ['lat-pulldown'],
  },
  'seated-cable-row': {
    name: 'Seated cable row', muscle: 'Mid back', mode: 'kg', startKg: 30, inc: 2.5,
    cues: ['Sit tall, slight bend in the knees.', 'Pull the handle to your belly button, squeeze your shoulder blades.', 'Do not rock your torso back to cheat.'],
    swaps: ['chest-supported-row', 'db-row'],
  },
  'chest-supported-row': {
    name: 'Chest-supported row (machine)', muscle: 'Mid back', mode: 'kg', startKg: 25, inc: 2.5,
    cues: ['Chest firm on the pad, so no momentum.', 'Pull your elbows back past your ribs.', 'Pause one beat, then lower with control.'],
    swaps: ['seated-cable-row', 'db-row'],
  },
  'db-row': {
    name: 'One-arm dumbbell row', muscle: 'Back', mode: 'kg', each: true, startKg: 10, inc: 2,
    cues: ['One hand and knee on a bench, back flat.', 'Pull the dumbbell to your hip, not your shoulder.', 'Do not twist your torso.'],
    swaps: ['seated-cable-row', 'chest-supported-row'],
  },
  'face-pull': {
    name: 'Cable face pull', muscle: 'Rear delts', mode: 'kg', startKg: 10, inc: 2.5,
    cues: ['Rope at face height. Light weight — this protects your shoulders.', 'Pull the rope toward your forehead, hands split apart.', 'Elbows high, squeeze your upper back.'],
    swaps: ['reverse-pec-deck'],
  },
  'reverse-pec-deck': {
    name: 'Reverse pec deck', muscle: 'Rear delts', mode: 'kg', startKg: 15, inc: 2.5,
    cues: ['Face the pad, chest against it.', 'Sweep the handles back in a wide arc.', 'Squeeze your upper back, no shrugging.'],
    swaps: ['face-pull'],
  },
  'db-curl': {
    name: 'Dumbbell biceps curl', muscle: 'Biceps', mode: 'kg', each: true, startKg: 8, inc: 2,
    cues: ['Elbows pinned to your ribs.', 'Curl up, turning your palms to the ceiling at the top.', 'Lower for 2–3 counts. No swinging your back.'],
    swaps: ['hammer-curl', 'cable-curl'],
  },
  'hammer-curl': {
    name: 'Hammer curl', muscle: 'Biceps', mode: 'kg', each: true, startKg: 8, inc: 2,
    cues: ['Palms face each other the whole time.', 'Elbows stay at your sides.', 'Slow lowering, full stretch at the bottom.'],
    swaps: ['db-curl', 'cable-curl'],
  },
  'cable-curl': {
    name: 'Cable curl', muscle: 'Biceps', mode: 'kg', startKg: 12, inc: 2.5,
    cues: ['Stand tall, elbows in at your sides.', 'Curl until your forearms touch your biceps.', 'Fight the cable on the way down.'],
    swaps: ['db-curl', 'hammer-curl'],
  },

  // ── CORE ────────────────────────────────────────────────────────────────
  'dead-bug': {
    name: 'Dead bug', muscle: 'Core', mode: 'reps', startKg: null, inc: 0, perSide: true,
    cues: ['Lower back stays pressed into the floor the whole time.', 'Opposite arm and leg lower slowly. Exhale as they go.', 'If your back lifts, make the range smaller.'],
    swaps: ['bird-dog', 'plank'],
  },
  'bird-dog': {
    name: 'Bird dog', muscle: 'Core', mode: 'reps', startKg: null, inc: 0, perSide: true,
    cues: ['Hands under shoulders, knees under hips, back flat.', 'Reach opposite arm and leg long, not high.', 'Pause one beat, return slowly.'],
    swaps: ['dead-bug', 'plank'],
  },
  'plank': {
    name: 'Plank', muscle: 'Core', mode: 'time', startKg: null, inc: 0,
    cues: ['Forearms down, elbows under shoulders.', 'Squeeze glutes, ribs down, one long line head to heels.', 'Stop the set when your hips sag, not before.'],
    swaps: ['dead-bug', 'bird-dog'],
  },
  'pallof-press': {
    name: 'Pallof press', muscle: 'Core', mode: 'kg', startKg: 5, inc: 2.5, perSide: true,
    cues: ['Stand side-on to the cable, handle at your chest.', 'Press straight out and resist the cable twisting you.', 'Hips and shoulders stay square.'],
    swaps: ['plank', 'dead-bug'],
  },
  'cable-crunch': {
    name: 'Cable crunch', muscle: 'Abs', mode: 'kg', startKg: 15, inc: 2.5,
    cues: ['Kneel, rope held by your ears.', 'Round your spine down — elbows toward your thighs.', 'Move your ribs to your hips, not your hips back.'],
    swaps: ['dead-bug', 'plank'],
  },

  // ── LEGS & JUMP ─────────────────────────────────────────────────────────
  'jump-test': {
    name: 'Vertical jump test', muscle: 'Power', mode: 'jumptest', startKg: null, inc: 0,
    cues: ['Warm up first. Do the test fresh, before any heavy leg work.', 'Stand side-on to a wall, reach up and mark your standing reach.', 'Jump as high as you can and touch the wall at the top. Best of 3. Rest 45 s between tries.'],
    swaps: [],
  },
  'vertical-jump': {
    name: 'Standing vertical jump', muscle: 'Power', mode: 'jump', startKg: null, inc: 0,
    cues: ['Quick dip, swing your arms, jump up as tall as you can.', 'Land softly on the balls of your feet, knees over toes, hips back.', 'Stick the landing for 1 second. Reset fully between jumps — quality over speed.'],
    swaps: ['broad-jump'],
  },
  'broad-jump': {
    name: 'Standing broad jump', muscle: 'Power', mode: 'jump', startKg: null, inc: 0,
    cues: ['Swing your arms back, then drive them forward as you jump out.', 'Land softly in a quarter squat and hold it 1 second.', 'Walk back and reset. Do not chain jumps.'],
    swaps: ['vertical-jump'],
  },
  'pogo-hops': {
    name: 'Pogo hops', muscle: 'Ankles', mode: 'jump', startKg: null, inc: 0,
    cues: ['Stiff ankles, small quick hops — barely leave the floor.', 'Stay tall, knees nearly straight and soft.', 'Stop if your shins or knees complain.'],
    swaps: ['calf-raise-standing'],
  },
  'goblet-squat': {
    name: 'Goblet squat', muscle: 'Quads, glutes', mode: 'kg', startKg: 14, inc: 2,
    cues: ['Hold one dumbbell against your chest, elbows pointing down.', 'Sit down between your hips; knees track over your toes.', 'Chest stays tall. Drive up through your whole foot.'],
    swaps: ['leg-press', 'box-squat', 'hack-squat'],
  },
  'box-squat': {
    name: 'Box squat (bodyweight or goblet)', muscle: 'Quads, glutes', mode: 'kg', startKg: 8, inc: 2,
    cues: ['Sit back to lightly touch a bench, do not collapse onto it.', 'Knees out, chest tall.', 'Stand up by pushing the floor away.'],
    swaps: ['goblet-squat', 'leg-press'],
  },
  'hack-squat': {
    name: 'Hack squat (machine)', muscle: 'Quads', mode: 'kg', startKg: 20, inc: 5,
    cues: ['Back flat on the pad, feet shoulder-width.', 'Lower until your thighs are about parallel.', 'Drive up through your heels and midfoot.'],
    swaps: ['leg-press', 'goblet-squat'],
  },
  'leg-press': {
    name: 'Leg press', muscle: 'Quads, glutes', mode: 'kg', startKg: 60, inc: 5,
    cues: ['Feet shoulder-width on the plate, lower back stays on the pad.', 'Lower until knees are about 90°. Do not let your hips curl up.', 'Push through your heels. Never lock the knees hard at the top.'],
    swaps: ['hack-squat', 'goblet-squat'],
  },
  'db-rdl': {
    name: 'Dumbbell Romanian deadlift', muscle: 'Hamstrings, glutes', mode: 'kg', each: true, startKg: 10, inc: 2,
    cues: ['Soft knees. Push your hips back like closing a car door.', 'Dumbbells slide down your thighs, back flat.', 'Stop when you feel a hamstring stretch, then squeeze glutes to stand.'],
    swaps: ['cable-pull-through', 'leg-curl'],
  },
  'cable-pull-through': {
    name: 'Cable pull-through', muscle: 'Glutes', mode: 'kg', startKg: 15, inc: 2.5,
    cues: ['Face away from the cable, rope between your legs.', 'Hinge hips back with a flat back.', 'Squeeze your glutes to stand tall — do not lean back.'],
    swaps: ['db-rdl', 'glute-bridge'],
  },
  'leg-curl': {
    name: 'Seated or lying leg curl', muscle: 'Hamstrings', mode: 'kg', startKg: 20, inc: 2.5,
    cues: ['Pad just above your heels, hips stay down.', 'Curl smoothly, squeeze at the end.', 'Take 3 counts to return.'],
    swaps: ['db-rdl', 'glute-bridge'],
  },
  'glute-bridge': {
    name: 'Glute bridge', muscle: 'Glutes', mode: 'reps', startKg: null, inc: 0,
    cues: ['Feet flat, knees bent, ribs down.', 'Drive hips up until your body is a straight line.', 'Squeeze glutes for 1 second, lower slowly.'],
    swaps: ['cable-pull-through'],
  },
  'reverse-lunge': {
    name: 'Reverse lunge', muscle: 'Quads, glutes', mode: 'reps', each: true, perSide: true, startKg: null, inc: 2, optionalWeight: true,
    cues: ['Step back, lower your back knee toward the floor.', 'Front shin stays nearly vertical, torso tall.', 'Push through the front foot to return. Hold a rail if you wobble.'],
    swaps: ['split-squat', 'step-up'],
  },
  'split-squat': {
    name: 'Split squat', muscle: 'Quads, glutes', mode: 'kg', each: true, perSide: true, startKg: 6, inc: 2, optionalWeight: true,
    cues: ['Long stance, back heel up.', 'Lower straight down, not forward.', 'Front knee tracks over your toes. Drive up through the front heel.'],
    swaps: ['reverse-lunge', 'step-up'],
  },
  'walking-lunge': {
    name: 'Walking lunge', muscle: 'Quads, glutes', mode: 'kg', each: true, perSide: true, startKg: 6, inc: 2, optionalWeight: true,
    cues: ['Big, controlled steps. Torso tall.', 'Back knee brushes the floor, front knee over the toes.', 'Push off the front foot into the next step.'],
    swaps: ['split-squat', 'reverse-lunge'],
  },
  'step-up': {
    name: 'Step-up', muscle: 'Quads, glutes', mode: 'kg', each: true, perSide: true, startKg: 6, inc: 2, optionalWeight: true,
    cues: ['Whole foot on the box, knee-height or lower.', 'Drive through the top foot only — no pushing off the bottom one.', 'Lower slowly for 3 counts.'],
    swaps: ['split-squat', 'reverse-lunge'],
  },
  'calf-raise-standing': {
    name: 'Standing calf raise', muscle: 'Calves', mode: 'kg', startKg: 30, inc: 5,
    cues: ['Balls of the feet on the edge, heels free.', 'Rise up high, pause 1 second.', 'Lower to a deep stretch. Slow.'],
    swaps: ['calf-raise-seated', 'leg-press-calf'],
  },
  'calf-raise-seated': {
    name: 'Seated calf raise', muscle: 'Calves', mode: 'kg', startKg: 20, inc: 5,
    cues: ['Pad on your lower thighs, balls of feet on the plate.', 'Full stretch down, high squeeze up.', 'No bouncing.'],
    swaps: ['calf-raise-standing', 'leg-press-calf'],
  },
  'leg-press-calf': {
    name: 'Leg press calf raise', muscle: 'Calves', mode: 'kg', startKg: 50, inc: 5,
    cues: ['Only your toes on the bottom of the plate, knees almost straight.', 'Press up through the balls of the feet.', 'Pause at the top, stretch at the bottom.'],
    swaps: ['calf-raise-standing', 'calf-raise-seated'],
  },

  // ── CONDITIONING CIRCUIT ────────────────────────────────────────────────
  'farmer-carry': {
    name: 'Farmer carry', muscle: 'Grip, core', mode: 'time', startKg: 12, inc: 2, each: true,
    cues: ['Dumbbells at your sides, shoulders back and down.', 'Walk tall with short steady steps.', 'Do not lean — if you wobble, the weight is too heavy.'],
    swaps: [],
  },
  'bike-intervals': {
    name: 'Bike intervals', muscle: 'Conditioning', mode: 'block', startKg: null, inc: 0,
    cues: ['Hard = fast but controlled, you can only say a few words.', 'Easy = slow spin to catch your breath.', 'Stay seated. Never hammer so hard your form falls apart.'],
    swaps: [],
  },
};

// Moves used inside Conditioning circuits (same ids as above)
export const getExercise = (id) => exercises[id];
