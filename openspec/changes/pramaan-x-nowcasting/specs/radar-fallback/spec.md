# Spec Delta

## Purpose

Simulates a radar sensor failure by expanding the uncertainty bounds for storm tracking, providing observability-aware forecasting.

## ADDED Requirements

### Requirement: Fallback Activation
The system SHALL provide an API endpoint (`/api/kill-radar`) to toggle the radar sensor status.

#### Scenario: Toggle radar off
- **WHEN** a client calls POST `/api/kill-radar` while radar is active
- **THEN** the system registers the radar as offline and falls back to Satellite IR simulation

### Requirement: Uncertainty Inflation
The system SHALL multiply the spatial bounds of predicted GeoJSON polygons by 2.5x when the radar is offline.

#### Scenario: Radar fails during forecast
- **WHEN** the radar is disabled via the kill switch
- **THEN** the generated GeoJSON future polygons increase in area by approximately 2.5x to represent higher uncertainty

### Requirement: ETA Bounds Inflation
The system SHALL inflate the estimated time of arrival (ETA) interval when radar is offline.

#### Scenario: ETA intervals widen
- **WHEN** radar is offline
- **THEN** the `eta_max` property of the storm cells is increased to reflect broader uncertainty bounds
