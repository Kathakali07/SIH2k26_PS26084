# Frontend State & UI Spec (Teammate Hand-off)

*Note: This layer will not be implemented by the backend agent. It serves as the architectural spec for the frontend teammate who will build the React application.*

## Tech Stack
- Next.js (or Vite React)
- MapLibre GL JS (`react-map-gl`)
- Tailwind CSS

## Map Configuration
- Uses a **Dark-mode TopoJSON basemap** to ensure high contrast against bright storm hazard layers.

## Rendering Logic
1. A `useEffect` hook polls the `/api/nowcast/live` endpoint defined in the [[API_Contract]] every few seconds.
2. The response populates a MapLibre `GeoJSONSource`.
3. MapLibre `Layer` definitions apply data-driven styling based on the `hazard_type` property:
   - **Cloudburst**: Pulsing red polygons (CSS animation + MapLibre expressions).
   - **Thunderstorm**: Solid yellow polygons.

## Interactivity & State
- **Click Event**: An `onClick` listener is bound to the hazard polygons.
- **Action**: When clicked, a Tailwind-styled modal opens.
- **Live Countdown**: The modal parses the `eta_utc` property (computed by the [[Earthformer_Spec]]) against the client's `Date.now()`. It renders a live, ticking digital clock in `MM:SS` format representing time until impact.
