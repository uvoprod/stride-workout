// Week 5 · Build
export default {
  week: 5,
  phase: 'build',
  deload: false,
  steps: 8500,
  focus: "Build begins",
  coach: "Phase 2: more sets, more weight where the app suggests it, and shorter rests. Finishers get tougher.",
  days: {
    push: {
      title: "Push",
      subtitle: "Chest · Shoulders · Triceps",
      slots: [
        { ex: "chest-press-machine", sets: 3, reps: [8, 10], rest: 75, rpe: "7", note: "Tempo: 2 s down, 1 s up." },
        { ex: "incline-db-press", sets: 3, reps: [8, 10], rest: 75, rpe: "7" },
        { ex: "db-shoulder-press", sets: 3, reps: [8, 10], rest: 75, rpe: "7" },
        { ex: "cable-fly", sets: 3, reps: [12, 15], rest: 60, rpe: "7" },
        { ex: "lateral-raise", sets: 3, reps: [12, 15], rest: 60, rpe: "7" },
        { ex: "triceps-rope", sets: 3, reps: [10, 12], rest: 60, rpe: "7" },
      ],
      finisher: { kind: "interval", title: "Bike sprints", rounds: 7, work: 30, easy: 30, workLabel: "Hard", easyLabel: "Easy spin", effort: "Hard bursts at RPE 8–9, easy spins at RPE 3.", alt: "No bike? Rower or elliptical, same timing." },
    },
    pull: {
      title: "Pull",
      subtitle: "Back · Biceps · Core",
      slots: [
        { ex: "lat-pulldown", sets: 3, reps: [8, 10], rest: 75, rpe: "7", note: "Tempo: 2 s down, 1 s up." },
        { ex: "chest-supported-row", sets: 3, reps: [8, 10], rest: 75, rpe: "7" },
        { ex: "face-pull", sets: 3, reps: [12, 15], rest: 60, rpe: "6" },
        { ex: "hammer-curl", sets: 3, reps: [10, 12], rest: 60, rpe: "7" },
        { ex: "pallof-press", sets: 3, reps: [10, 12], rest: 60, rpe: "6–7", note: "Reps per side." },
        { ex: "plank", sets: 3, reps: [30, 45], rest: 60, rpe: "—", note: "Seconds." },
      ],
      finisher: { kind: "steady", title: "Incline walk", minutes: 8, incline: 7, speed: 4.8, effort: "Treadmill at 7% incline, about 4.8 km/h. Do not hold the rails. You can speak in short sentences.", alt: "No treadmill? Stairmaster or stairs at a steady pace." },
    },
    legs: {
      title: "Legs + Jump",
      subtitle: "Jump · Squat · Hinge · Lunge · Calves",
      slots: [
        { ex: "vertical-jump", sets: 4, reps: [3, 3], rest: 60, rpe: "—", note: "Max intent, quiet landing." },
        { ex: "goblet-squat", sets: 3, reps: [8, 10], rest: 75, rpe: "7", note: "Tempo: 2 s down, 1 s up." },
        { ex: "db-rdl", sets: 3, reps: [8, 10], rest: 75, rpe: "7" },
        { ex: "split-squat", sets: 3, reps: [8, 10], rest: 60, rpe: "7", note: "Reps per leg." },
        { ex: "leg-press", sets: 3, reps: [10, 12], rest: 60, rpe: "7" },
        { ex: "glute-bridge", sets: 3, reps: [12, 15], rest: 60, rpe: "6–7" },
        { ex: "calf-raise-standing", sets: 3, reps: [12, 15], rest: 60, rpe: "7" },
      ],
      finisher: { kind: "interval", title: "Carry + sled rounds", rounds: 6, work: 30, easy: 30, workLabel: "Carry or sled push", easyLabel: "Walk it off", effort: "Moderate-heavy farmer carries or a light sled push. Tall posture, steady steps.", alt: "No sled? Farmer carries or a weighted walk with dumbbells." },
    },
    cond: {
      title: "Conditioning",
      subtitle: "Cardio intervals · Light circuit",
      optional: true,
      slots: [
        { block: "interval", ex: "bike-intervals", title: "Bike intervals", rounds: 8, work: 30, easy: 45, workLabel: "Hard", easyLabel: "Easy spin", rpe: "8 on the hard bursts, 3 on the easy ones", note: "Low impact on the knees. Raise the resistance slightly each time it feels easy." },
        { block: "circuit", title: "Light full-body circuit", rounds: 3, restBetween: 45, rpe: "6", moves: [{ex: "goblet-squat", reps: [12, 12]}, {ex: "db-row", reps: [12, 12]}, {ex: "incline-pushup", reps: [10, 10]}, {ex: "farmer-carry", seconds: 40}, {ex: "dead-bug", reps: [8, 8]}], note: "Light dumbbells. Move steadily and take 20 s between moves, then rest between rounds." },
      ],
      finisher: { kind: "steady", title: "Easy cardio", minutes: 7, incline: 0, speed: null, effort: "Easy bike or walk at talk pace (RPE 4). Let your heart rate settle.", alt: "Any easy cardio machine works." },
    },
  },
};
