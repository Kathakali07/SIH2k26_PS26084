# ClimaX Mobile (React Native / Expo)

A mobile-first, responsive React Native nowcasting application designed for smartphones, tablets, and field operations. Built for **Smart India Hackathon 2026** (Problem Statement: **PS26084**).

---

## 📱 Mobile-First UX Architecture

Traditional meteorological GIS command centers are designed for multi-monitor setups and become unusable on small smartphone screens. **ClimaX Mobile** solves this with a mobile-optimized layout:

1. **Slide-Over Hamburger Navigation Drawer (`☰`):**
   - Hides complex navigation off-screen to maximize map real estate.
   - Organized into **Core Nowcasting**, **Impact & Ensemble**, and **Operations & Defense**.

2. **Interactive Mobile Radar Map (`NowcastScreen`):**
   - Lightweight, responsive vector SVG radar display with Swiss territorial bounds and reference landmarks.
   - Renders radar reflectivity dBZ cores ($>35$ dBZ green $\rightarrow$ $>65$ dBZ magenta).
   - Touch any storm cell to slide up a **Storm Summary Bottom Sheet** with peak dBZ, velocity, heading, and arrival ETA.

3. **Touch-Optimized Timeline Bar (`TimelineControl`):**
   - Docked at the bottom of the screen with fat-finger play/pause, step controls, 1x/2x speed toggle, and frame indicator (T-95m to T+90m).

4. **Multi-Hazard & Critical Infrastructure Cards:**
   - Vertically scrolling card feeds for Hail, Cloudburst, Squall Winds, and Lightning.
   - Live Haversine distance and arrival countdowns for Zurich Airport, Gotthard Highway A2, Lucerne Ferry, and Basel EuroAirport.

5. **Hardware Sensor Resilience Console:**
   - One-tap buttons to **"Simulate Radar Outage"** (triggers `/api/kill-radar` on the backend, expanding uncertainty cones by $2.5\times$).
   - One-tap button to **"Restore System"** (`/api/reset-demo`).

6. **CAP v1.2 Civil Defense Dispatch:**
   - Real-time early warning advisories and broadcast simulation.

7. **Zero-Failure Offline Simulation Mode:**
   - If the mobile phone has poor or no Wi-Fi on a presentation stage, the app automatically runs its embedded Swiss DGMR scenario engine with zero crashes or blank screens.

---

## 🚀 Quick Start

From the repository root:

```bash
cd mobile
npm start
```

### Run Options:
- **Run in Browser (Fastest way to test mobile view):**
  ```bash
  npm run web
  ```
- **Run on Android Device / Emulator:**
  ```bash
  npm run android
  ```
- **Run on iPhone (via Expo Go app):**
  - Download the free **Expo Go** app from the App Store.
  - Scan the QR code shown in your terminal after running `npm start`.

---

## ⚙️ Server Configuration
In the mobile app, tap `☰` $\rightarrow$ **Settings & Server**:
- **Live Cloud Deployment (Default):** Connects to `https://sih2k26-ps26084.onrender.com`.
- **Localhost Backend:** Connects to `http://localhost:8000`.
- **Android Emulator:** Connects to `http://10.0.2.2:8000`.
- **Offline Mode:** Runs pure local calculations with zero network requirement.
