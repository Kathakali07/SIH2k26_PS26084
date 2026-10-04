# Spec Delta

## Purpose

Provides a core inference and tracking engine that ingests Earthformer tensor data to track convective storm cells and compute velocity vectors for forecasting.

## ADDED Requirements

### Requirement: Storm Object Tracking
The system SHALL ingest 65-minute context Radar VIL tensors and use OpenCV to extract storm cell contours exceeding 40 dBZ.

#### Scenario: Successful contour extraction
- **WHEN** valid SEVIR tensor arrays are fed to the engine
- **THEN** the engine extracts distinct storm cells with computed centroid, bounding box, and area

### Requirement: Frame-over-Frame Velocity Calculation
The system SHALL associate storm cells across 12 future frames using the Hungarian matching algorithm on Euclidean distance to compute velocity vectors.

#### Scenario: Object tracked across multiple frames
- **WHEN** a storm cell moves between consecutive tensor frames
- **THEN** the tracking algorithm correctly associates the object and computes a non-zero (u,v) velocity vector

### Requirement: Hazard Thresholding
The system SHALL classify storm cells as 'Cloudburst' if the area is < 20 km² and max intensity > 55 dBZ, or 'Thunderstorm' if max intensity > 40 dBZ.

#### Scenario: Cloudburst detection
- **WHEN** a cell with area 15 km² and 60 dBZ is tracked
- **THEN** the system classifies it as a Cloudburst with HIGH severity
