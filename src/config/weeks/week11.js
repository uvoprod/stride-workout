// Week 11 · Peak
export default {
  week: 11,
  phase: 'peak',
  deload: false,
  steps: 10000,
  focus: "Final push",
  coach: "Last hard week. Chase small wins: one more rep, one more round, one cleaner jump.",
  days: {
    push: {
      title: "Push",
      subtitle: "Chest · Shoulders · Triceps",
      slots: [
        { ex: "incline-db-press", sets: 4, reps: [8, 10], rest: 60, rpe: "8–9", note: "Your heavy lift. Stay clean." },
        { ex: "chest-press-machine", sets: 4, reps: [10, 12], rest: 0, rpe: "8–9", group: "A1" },
        { ex: "lateral-raise", sets: 4, reps: [12, 15], rest: 45, rpe: "8–9", group: "A2" },
        { ex: "db-shoulder-press", sets: 4, reps: [8, 10], rest: 0, rpe: "8–9", group: "B1" },
        { ex: "triceps-rope", sets: 4, reps: [12, 15], rest: 45, rpe: "8–9", group: "B2" },
      ],
      finisher: { kind: "interval", title: "Bike sprints", rounds: 10, work: 40, easy: 20, workLabel: "Hard", easyLabel: "Easy spin", effort: "Hard bursts at RPE 8–9, easy spins at RPE 3.", alt: "No bike? Rower or elliptical, same timing." },
    },
    pull: {
      title: "Pull",
      subtitle: "Back · Biceps · Core",
      slots: [
        { ex: "lat-pulldown", sets: 4, reps: [8, 10], rest: 60, rpe: "8–9", note: "Your heavy lift. Stay clean." },
        { ex: "chest-supported-row", sets: 4, reps: [10, 12], rest: 0, rpe: "8–9", group: "A1" },
        { ex: "face-pull", sets: 4, reps: [12, 15], rest: 45, rpe: "6", group: "A2" },
        { ex: "db-curl", sets: 4, reps: [10, 12], rest: 0, rpe: "8–9", group: "B1" },
        { ex: "cable-crunch", sets: 4, reps: [12, 15], rest: 45, rpe: "8–9", group: "B2" },
        { ex: "plank", sets: 4, reps: [55, 70], rest: 45, rpe: "—", note: "Seconds." },
      ],
      finisher: { kind: "steady", title: "Incline walk", minutes: 10, incline: 10, speed: 5.2, effort: "Treadmill at 10% incline, about 5.2 km/h. Do not hold the rails. You can speak in short sentences.", alt: "No treadmill? Stairmaster or stairs at a steady pace.", pickups: {every: 150, sec: 30, note: "Every 2½ min, walk 30 s faster."} },
    },
    legs: {
      title: "Legs + Jump",
      subtitle: "Jump · Squat · Hinge · Lunge · Calves",
      slots: [
        { ex: "vertical-jump", sets: 3, reps: [4, 4], rest: 60, rpe: "—", note: "4 jumps per set. Quality only." },
        { ex: "broad-jump", sets: 1, reps: [3, 3], rest: 60, rpe: "—" },
        { ex: "goblet-squat", sets: 4, reps: [8, 10], rest: 60, rpe: "8–9", note: "Your heavy lift. Stay clean." },
        { ex: "db-rdl", sets: 4, reps: [8, 10], rest: 0, rpe: "8–9", group: "A1" },
        { ex: "calf-raise-standing", sets: 4, reps: [12, 15], rest: 45, rpe: "8–9", group: "A2" },
        { ex: "walking-lunge", sets: 4, reps: [8, 10], rest: 0, rpe: "8–9", note: "Reps per leg.", group: "B1" },
        { ex: "glute-bridge", sets: 4, reps: [12, 15], rest: 45, rpe: "6–7", group: "B2" },
        { ex: "leg-press", sets: 4, reps: [10, 12], rest: 45, rpe: "8–9" },
      ],
      finisher: { kind: "interval", title: "Carry + sled rounds", rounds: 10, work: 35, easy: 25, workLabel: "Carry or sled push", easyLabel: "Walk it off", effort: "Moderate-heavy farmer carries or a light sled push. Tall posture, steady steps.", alt: "No sled? Farmer carries or a weighted walk with dumbbells." },
    },
    cond: {
      title: "Conditioning",
      subtitle: "Cardio intervals · Light circuit",
      optional: true,
      slots: [
        { block: "interval", ex: "bike-intervals", title: "Bike intervals", rounds: 12, work: 40, easy: 50, workLabel: "Hard", easyLabel: "Easy spin", rpe: "8 on the hard bursts, 3 on the easy ones", note: "Low impact on the knees. Raise the resistance slightly each time it feels easy." },
        { block: "circuit", title: "Light full-body circuit", rounds: 4, restBetween: 45, rpe: "6", moves: [{ex: "goblet-squat", reps: [12, 12]}, {ex: "db-row", reps: [12, 12]}, {ex: "incline-pushup", reps: [12, 12]}, {ex: "farmer-carry", seconds: 40}, {ex: "dead-bug", reps: [10, 10]}], note: "Light dumbbells. Move steadily and take 20 s between moves, then rest between rounds." },
      ],
      finisher: { kind: "steady", title: "Easy cardio", minutes: 10, incline: 0, speed: null, effort: "Easy bike or walk at talk pace (RPE 4). Let your heart rate settle.", alt: "Any easy cardio machine works." },
    },
  },
};
