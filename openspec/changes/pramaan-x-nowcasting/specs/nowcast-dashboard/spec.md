# Spec Delta

## Purpose

A real-time MapLibre GIS web dashboard that visualizes high-resolution hazard zones and storm ETA countdowns.

## ADDED Requirements

### Requirement: GeoJSON Layer Rendering
The system SHALL poll the backend live API and map the resulting GeoJSON FeatureCollection to MapLibre layers.

#### Scenario: Visualizing storm cells
- **WHEN** the backend streams GeoJSON features
- **THEN** the dashboard renders them as solid yellow (Thunderstorm) or pulsing red (Cloudburst) polygons

### Requirement: Hazard Interaction Modal
The system SHALL display an interactive modal when a user clicks on a hazard polygon on the map.

#### Scenario: User inspects a storm cell
- **WHEN** the user clicks on a rendered storm cell polygon
- **THEN** a modal opens displaying the hazard type and severity

### Requirement: Live ETA Countdown
The system SHALL parse the `eta_utc` property of storm features and display a live ticking MM:SS digital countdown clock in the modal.

#### Scenario: Viewing countdown
- **WHEN** the modal is open for a storm cell
- **THEN** a live countdown timer displays the exact time remaining until impact based on the velocity vector
