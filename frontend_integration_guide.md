# ClimaX Frontend Integration Guide

This guide is designed for the frontend developer to build the MapLibre GIS Dashboard for the ClimaX nowcasting system. The backend AI handles all the heavy lifting (Earthformer model inference, OpenCV tracking), so the frontend is entirely decoupled and relies on a clean REST API.

## 1. Tech Stack Requirements
- **Framework**: React (Next.js or Vite)
- **Mapping**: `maplibre-gl` and `react-map-gl`
- **Styling**: Tailwind CSS
- **Network**: `axios` or `fetch` (for polling)

## 2. API Contract

The FastAPI backend runs locally and exposes the following endpoint.

### Endpoint: `GET /api/nowcast/live`
- **Purpose**: Returns the real-time tracking polygons and ETA for forecasted severe weather events (Kalbaishakhi/Nor'westers).
- **Polling Requirement**: This endpoint should be polled inside a React `useEffect` every 2 to 3 seconds.
- **Response Format**: Strict RFC 7946 GeoJSON `FeatureCollection`.

**Mock Response Payload:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [88.3639, 22.5726],
            [88.3700, 22.5800],
            [88.3500, 22.5900],
            [88.3639, 22.5726]
          ]
        ]
      },
      "properties": {
        "id": "storm_cell_42",
        "hazard_type": "Cloudburst",
        "severity": "HIGH",
        "eta_utc": "2026-09-29T13:45:00Z"
      }
    }
  ]
}
```

*Note on Fallback Testing*: The backend has a `/api/kill-radar` POST endpoint. If the user clicks a "Simulate Sensor Failure" button on your UI, hit this endpoint. The next time you poll `/api/nowcast/live`, the polygons will artificially inflate in size by 2.5x to represent tracking uncertainty.

## 3. Map Initialization (India Context)

Because this is a Smart India Hackathon (SIH) project simulating a Kalbaishakhi event, the map must be locked to the Indian subcontinent.

**Configuration Parameters:**
- `maxBounds`: `[68.7, 8.4, 97.2, 37.6]` (Longitude, Latitude bounds for India).
- `initialViewState`:
  - `longitude`: `88.3639`
  - `latitude`: `22.5726` (Centered on Kolkata, West Bengal)
  - `zoom`: `7`
- `mapStyle`: Use a dark-mode TopoJSON basemap (e.g., `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`).

**Optional but Recommended:** Overlay a public Indian States boundary TopoJSON layer so judges instantly recognize the geographic context.

## 4. Layer Styling Rules

You will pass the GeoJSON response into a MapLibre `<Source id="nowcast-data" type="geojson" data={apiData}>`. Then, use MapLibre data-driven styling for the `<Layer>`:

- **If `properties.hazard_type === 'Cloudburst'`**:
  - Fill Color: Red (`#ff0000`)
  - (Bonus) CSS Animation: Add a pulsing/breathing opacity effect to visually warn users of extreme danger.
- **If `properties.hazard_type === 'Thunderstorm'`**:
  - Fill Color: Yellow (`#ffcc00`)
  - Solid, no pulsing.

## 5. UI Interactivity (The Modal)

- **Click Event**: Attach an `onClick` event to the hazard polygons on the map.
- **Modal Component**: When clicked, open a Tailwind CSS styled modal overlay.
- **Live Countdown Logic**: 
  1. Extract `eta_utc` from the clicked polygon's properties.
  2. In your React component, use `setInterval` to compare `eta_utc` against `Date.now()`.
  3. Render the remaining time as a large, ticking digital clock in `MM:SS` format inside the modal.

---
**Summary for Frontend Dev**: Initialize MapLibre over India, set up a 2-second polling loop to `/api/nowcast/live`, feed the GeoJSON directly into the MapLibre source, style Red/Yellow based on `hazard_type`, and build a modal that parses `eta_utc` into a ticking countdown!
