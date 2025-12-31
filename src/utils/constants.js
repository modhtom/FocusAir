export const AUDIO_SOURCES = {
  cabin: "https://www.soundjay.com/transportation/sounds/airplane-interior-1.mp3",
  rain: "https://www.soundjay.com/nature/sounds/rain-01.mp3",
  ocean: "https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3",
  cafe: "https://www.soundjay.com/human/sounds/crowd-talking-10.mp3"
};

export const PLANES = [
  {
    id: "cessna",
    name: "Cessna 172",
    cost: 0,
    speedMultiplier: 1.0,
    desc: "Reliable single-prop. Good for sight-seeing.",
    sound: "https://www.soundjay.com/transportation/sounds/propeller-plane-flying-steady-01.mp3"
  },
  {
    id: "g650",
    name: "Gulfstream G650",
    cost: 5000,
    speedMultiplier: 1.5,
    desc: "Luxury business jet. Focus in style.",
    sound: "https://www.soundjay.com/transportation/sounds/airplane-interior-1.mp3"
  },
  {
    id: "concorde",
    name: "Concorde",
    cost: 20000,
    speedMultiplier: 2.0,
    desc: "Supersonic speed. For high-intensity sprints.",
    sound: "https://www.soundjay.com/transportation/sounds/airplane-interior-3.mp3"
  }
];

export const CHECKLIST_ITEMS = [
  "Phone on DND / Silent Mode",
  "Water bottle ready",
  "Specific goal defined"
];

export const PLANE_SPEED_MPH = 500;
export const ROWS_TOTAL = 30;

export const GET_RANK = (totalHours) => {
  if (totalHours > 100) return "Commander";
  if (totalHours > 50) return "Captain";
  if (totalHours > 20) return "First Officer";
  if (totalHours > 5) return "Senior Cadet";
  return "Cadet";
};