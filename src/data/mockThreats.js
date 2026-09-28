// src/data/mockThreats.js
export const MOCK_THREATS = [
  {
    id: "CB-401",
    type: "CLOUDBURST",
    severity: "Extreme",
    location: "Barrackpore Sector",
    coordinates: [
      [22.76, 88.35],
      [22.78, 88.39],
      [22.74, 88.41],
      [22.72, 88.36]
    ],
    dbz: 58,
    lightningDensity: "42 strikes/min",
    downburstVelocity: "78 km/h",
    hailProb: "85%",
    etaSeconds: 1540 // ~25 minutes
  },
  {
    id: "TS-108",
    type: "SEVERE THUNDERSTORM",
    severity: "High",
    location: "Howrah Corridor",
    coordinates: [
      [22.58, 88.26],
      [22.61, 88.31],
      [22.56, 88.34],
      [22.54, 88.28]
    ],
    dbz: 46,
    lightningDensity: "18 strikes/min",
    downburstVelocity: "52 km/h",
    hailProb: "35%",
    etaSeconds: 4320 // ~72 minutes
  }
];
