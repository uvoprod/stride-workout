// Week 3 · Foundation
export default {
  week: 3,
  phase: 'foundation',
  deload: false,
  steps: 7500,
  focus: "Own the rhythm",
  coach: "Rest drops a little. If a lift felt easy last time, add 1–2 reps before you add weight.",
  days: {
    push: {
      title: "Push",
      subtitle: "Chest · Shoulders · Triceps",
      slots: [
        { ex: "chest-press-machine", sets: 3, reps: [8, 10], rest: 75, rpe: "7", note: "Find a weight that leaves 3–4 reps in the tank." },
        { ex: "incline-db-press", sets: 3, reps: [8, 10], rest: 75, rpe: "7" },
        { ex: "shoulder-press-machine", sets: 3, reps: [8, 10], rest: 75, rpe: "7" },
        { ex: "lateral-raise", sets: 3, reps: [12, 15], rest: 60, rpe: "7" },
        { ex: "triceps-pushdown", sets: 3, reps: [10, 12], rest: 60, rpe: "7" },
      ],
      finisher: { kind: "interval", title: "Bike sprints", rounds: 6, work: 25, easy: 35, workLabel: "Hard", easyLabel: "Easy spin", effort: "Hard bursts at RPE 8–9, easy spins at RPE 3.", alt: "No bike? Rower or elliptical, same timing." },
    },
    pull: {
      title: "Pull",
      subtitle: "Back · Biceps · Core",
      slots: [
        { ex: "lat-pulldown", sets: 3, reps: [8, 10], rest: 75, rpe: "7", note: "Think elbows to pockets, not hands to chest." },
        { ex: "seated-cable-row", sets: 3, reps: [8, 10], rest: 75, rpe: "7" },
        { ex: "face-pull", sets: 3, reps: [12, 15], rest: 60, rpe: "5–6", note: "Light. This is for shoulder health." },
        { ex: "db-curl", sets: 3, reps: [10, 12], rest: 60, rpe: "7" },
        { ex: "dead-bug", sets: 3, reps: [6, 8], rest: 60, rpe: "—", note: "Reps per side. Slow." },
        { ex: "plank", sets: 3, reps: [30, 40], rest: 60, rpe: "—", note: "Seconds." },
      ],
      finisher: { kind: "steady", title: "Incline walk", minutes: 7, incline: 6, speed: 4.5, effort: "Treadmill at 6% incline, about 4.5 km/h. Do not hold the rails. You can speak in short sentences.", alt: "No treadmill? Stairmaster or stairs at a steady pace." },
    },
    legs: {
      title: "Legs + Jump",
      subtitle: "Jump · Squat · Hinge · Lunge · Calves",
      slots: [
        { ex: "vertical-jump", sets: 4, reps: [3, 3], rest: 60, rpe: "—", note: "Reset fully between jumps." },
        { ex: "goblet-squat", sets: 3, reps: [8, 10], rest: 75, rpe: "7", note: "Sit between your hips. Chest tall." },
        { ex: "db-rdl", sets: 3, reps: [8, 10], rest: 75, rpe: "7" },
        { ex: "reverse-lunge", sets: 3, reps: [6, 8], rest: 60, rpe: "7", note: "Reps per leg. Add light dumbbells when it feels easy." },
        { ex: "leg-press", sets: 3, reps: [10, 12], rest: 60, rpe: "7" },
        { ex: "calf-raise-standing", sets: 3, reps: [12, 15], rest: 60, rpe: "7" },
      ],
      finisher: { kind: "interval", title: "Carry + sled rounds", rounds: 6, work: 25, easy: 35, workLabel: "Carry or sled push", easyLabel: "Walk it off", effort: "Moderate-heavy farmer carries or a light sled push. Tall posture, steady steps.", alt: "No sled? Farmer carries or a weighted walk with dumbbells." },
    },
    cond: {
      title: "Conditioning",
      subtitle: "Cardio intervals · Light circuit",
      optional: true,
      slots: [
        { block: "interval", ex: "bike-intervals", title: "Bike intervals", rounds: 8, work: 30, easy: 60, workLabel: "Hard", easyLabel: "Easy spin", rpe: "8 on the hard bursts, 3 on the easy ones", note: "Low impact on the knees. Raise the resistance slightly each time it feels easy." },
        { block: "circuit", title: "Light full-body circuit", rounds: 3, restBetween: 60, rpe: "6", moves: [{ex: "goblet-squat", reps: [10, 10]}, {ex: "db-row", reps: [10, 10]}, {ex: "incline-pushup", reps: [8, 8]}, {ex: "farmer-carry", seconds: 30}, {ex: "dead-bug", reps: [6, 6]}], note: "Light dumbbells. Move steadily and take 20 s between moves, then rest between rounds." },
      ],
      finisher: { kind: "steady", title: "Easy cardio", minutes: 6, incline: 0, speed: null, effort: "Easy bike or walk at talk pace (RPE 4). Let your heart rate settle.", alt: "Any easy cardio machine works." },
    },
  },
};
