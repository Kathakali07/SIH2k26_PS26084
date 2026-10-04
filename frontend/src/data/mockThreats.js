// src/data/mockThreats.js - Swiss Alpine Convective Threat Objects
export const MOCK_THREATS = [
  {
    id: "storm_01",
    type: "SEVERE SUPERCELL & CLOUDBURST",
    severity: "HIGH",
    location: "Gotthard Pass & Uri Alpine Corridor",
    coordinates: [
      [46.75, 8.60],
      [46.85, 8.75],
      [46.65, 8.72],
      [46.60, 8.55]
    ],
    dbz: 74.0,
    lightningDensity: "42 strikes/min",
    downburstVelocity: "98 km/h",
    hailProb: "88%",
    etaSeconds: 900 // ~15 minutes
  },
  {
    id: "storm_02",
    type: "MULTICELL HAILSTORM",
    severity: "MODERATE",
    location: "Lake Lucerne & Schwyz Basin",
    coordinates: [
      [46.70, 7.72],
      [46.80, 7.85],
      [46.62, 7.82],
      [46.58, 7.68]
    ],
    dbz: 68.0,
    lightningDensity: "24 strikes/min",
    downburstVelocity: "75 km/h",
    hailProb: "72%",
    etaSeconds: 1800 // ~30 minutes
  }
];
