"""Focused checks for the synthetic ClimaX backend demo."""

import unittest
from datetime import datetime, timedelta
from pathlib import Path
from tempfile import TemporaryDirectory

import cv2
import numpy as np
from fastapi.testclient import TestClient

from backend.engine import DEMO_BASE_TIME, NowcastEngine
from backend.generate_mock import build_sevir_tensor, generate_mock_data, load_mock_frames
from backend.main import _feature_collection, app, state


class MockDataTests(unittest.TestCase):
    def test_mock_frames_load_as_five_dimensional_tensor(self):
        frames = load_mock_frames()
        tensor = build_sevir_tensor(frames)
        self.assertEqual(tensor.shape, (1, 20, 1, 500, 500))
        self.assertEqual(tensor.dtype, np.float32)
        self.assertGreater(float(tensor.max()), 55.0)

    def test_loader_rejects_missing_values_wrong_shape_and_bad_timestamps(self):
        with TemporaryDirectory() as temp_dir:
            directory = Path(temp_dir)
            frame_path = directory / "frame_000.npy"
            np.save(frame_path, {"radar_dbz": np.array([[np.nan]], dtype=np.float32)})
            with self.assertRaisesRegex(ValueError, "finite"):
                NowcastEngine.load_frames(directory)

            np.save(frame_path, {"radar_dbz": np.zeros((2, 2, 1), dtype=np.float32)})
            with self.assertRaisesRegex(ValueError, "2D"):
                NowcastEngine.load_frames(directory)

            np.save(frame_path, {"ir_temp": np.zeros((2, 2), dtype=np.float32)})
            with self.assertRaisesRegex(ValueError, "missing radar_dbz"):
                NowcastEngine.load_frames(directory)

            np.save(frame_path, {"radar_dbz": np.full((2, 2), 110.0, dtype=np.float32)})
            with self.assertRaisesRegex(ValueError, "-40..100 dBZ"):
                NowcastEngine.load_frames(directory)

            np.save(frame_path, {"radar_dbz": np.zeros((2, 2), dtype=np.float32), "timestamp_utc": "not-a-time"})
            with self.assertRaisesRegex(ValueError, "ISO-8601"):
                NowcastEngine.load_frames(directory)

    def test_loader_rejects_non_increasing_timestamps(self):
        with TemporaryDirectory() as temp_dir:
            directory = Path(temp_dir)
            radar = np.zeros((2, 2), dtype=np.float32)
            np.save(directory / "frame_000.npy", {"radar_dbz": radar, "timestamp_utc": "2026-09-29T12:05:00Z"})
            np.save(directory / "frame_001.npy", {"radar_dbz": radar, "timestamp_utc": "2026-09-29T12:00:00Z"})
            with self.assertRaisesRegex(ValueError, "later than"):
                NowcastEngine.load_frames(directory)

    def test_loader_rejects_spatial_mismatch_and_invalid_optional_fields(self):
        with TemporaryDirectory() as temp_dir:
            directory = Path(temp_dir)
            np.save(directory / "frame_000.npy", {"radar_dbz": np.zeros((2, 2), dtype=np.float32)})
            np.save(directory / "frame_001.npy", {"radar_dbz": np.zeros((2, 3), dtype=np.float32)})
            with self.assertRaisesRegex(ValueError, r"expected \(2, 2\)"):
                NowcastEngine.load_frames(directory)

        with TemporaryDirectory() as temp_dir:
            directory = Path(temp_dir)
            np.save(directory / "frame_000.npy", {
                "radar_dbz": np.zeros((2, 2), dtype=np.float32),
                "ir_temp": np.full((2, 2), np.nan, dtype=np.float32),
            })
            with self.assertRaisesRegex(ValueError, "ir_temp must match"):
                NowcastEngine.load_frames(directory)

    def test_generated_frames_have_increasing_utc_times_and_stack(self):
        with TemporaryDirectory() as temp_dir:
            generate_mock_data(temp_dir, num_frames=3)
            frames = NowcastEngine.load_frames(temp_dir)
            self.assertEqual(len(frames), 3)
            self.assertEqual((frames[1]["timestamp_utc"] - frames[0]["timestamp_utc"]).total_seconds(), 300.0)
            self.assertEqual(build_sevir_tensor(frames).shape, (1, 3, 1, 500, 500))

    def test_tracking_follows_a_moving_cell(self):
        engine = NowcastEngine()
        frames = np.zeros((2, 1, 100, 100), dtype=np.float32)
        cv2.circle(frames[0, 0], (25, 30), 8, 60.0, -1)
        cv2.circle(frames[1, 0], (31, 34), 8, 62.0, -1)
        tracks = engine.match_and_classify_cells(frames)
        latest = max(tracks.values(), key=lambda item: item["last_seen_frame"])
        self.assertEqual(latest["first_seen_frame"], 0)
        self.assertEqual(latest["last_seen_frame"], 1)
        self.assertNotEqual(latest["velocity"], (0.0, 0.0))

    def test_same_raster_sequence_produces_repeatable_tracks(self):
        first = NowcastEngine()
        second = NowcastEngine()

        def signature(engine):
            return {
                track_id: (
                    track["first_seen_frame"],
                    track["last_seen_frame"],
                    track["centroid"],
                    track["velocity"],
                    track["area_km2"],
                    track["max_dbz"],
                    track["hazard_type"],
                )
                for track_id, track in engine.tracks.items()
            }

        self.assertEqual(signature(first), signature(second))

    def test_small_high_intensity_cell_is_cloudburst(self):
        engine = NowcastEngine(km_per_pixel=0.5)
        cell = {"area_km2": 15.0, "max_dbz": 60.0}
        engine._classify_hazard(cell)
        self.assertEqual(cell["hazard_type"], "Cloudburst")
        self.assertEqual(cell["severity"], "HIGH")

    def test_no_storm_frames_return_empty_and_polygon_is_closed(self):
        engine = NowcastEngine()
        self.assertEqual(engine.match_and_classify_cells(np.zeros((3, 1, 40, 40), dtype=np.float32)), {})
        with self.assertRaisesRegex(ValueError, "Time, 1"):
            engine.match_and_classify_cells(np.zeros((1, 2, 2, 8, 8), dtype=np.float32))
        with self.assertRaisesRegex(ValueError, "supported -40..100"):
            engine.match_and_classify_cells(np.full((1, 2, 1, 8, 8), 150.0, dtype=np.float32))

        frame = np.zeros((40, 40), dtype=np.float32)
        cv2.circle(frame, (12, 15), 6, 60.0, -1)
        cells = engine.extract_storm_cells(frame)
        self.assertEqual(len(cells), 1)
        self.assertEqual(cells[0]["ring"][0], cells[0]["ring"][-1])
        self.assertAlmostEqual(cells[0]["position"][0], 88.3639 + cells[0]["centroid"][0] / 103.0)

    def test_motion_speed_uses_frame_timestamps(self):
        engine = NowcastEngine()
        engine.frame_timestamps = [DEMO_BASE_TIME, DEMO_BASE_TIME + timedelta(minutes=10)]
        frames = np.zeros((2, 1, 100, 100), dtype=np.float32)
        cv2.circle(frames[0, 0], (25, 30), 8, 60.0, -1)
        cv2.circle(frames[1, 0], (31, 34), 8, 62.0, -1)
        tracks = engine.match_and_classify_cells(frames)
        latest = max(tracks.values(), key=lambda item: item["last_seen_frame"])
        self.assertEqual(latest["motion"]["elapsed_minutes"], 10.0)
        self.assertAlmostEqual(latest["motion"]["speed_kmh"], np.hypot(6, 4) * 6.0, places=3)


class ApiTests(unittest.TestCase):
    def setUp(self):
        state.reset()
        self.client = TestClient(app)

    def tearDown(self):
        state.reset()

    def test_scenario_and_live_geojson_are_consistent(self):
        scenario = self.client.get("/api/scenario")
        live = self.client.get("/api/nowcast/live")
        self.assertEqual(scenario.status_code, 200)
        self.assertEqual(live.status_code, 200)
        self.assertEqual(scenario.json()["mode"], "synthetic_demo")
        scenario_data = scenario.json()
        features = live.json()["features"]
        self.assertEqual(scenario_data["geojson"], live.json())
        self.assertTrue(scenario_data["radar_active"])
        self.assertEqual(len(scenario_data["storms"]), 4)
        self.assertEqual(len(features), 4)
        self.assertEqual(
            {storm["id"] for storm in scenario_data["storms"]},
            {feature["properties"]["id"] for feature in features},
        )
        for feature in live.json()["features"]:
            self.assertEqual(feature["type"], "Feature")
            self.assertEqual(feature["geometry"]["type"], "Polygon")
            ring = feature["geometry"]["coordinates"][0]
            self.assertEqual(ring[0], ring[-1])
            self.assertIn("eta_utc", feature["properties"])
            self.assertTrue(all(68.7 <= lon <= 97.2 and 8.4 <= lat <= 37.6 for lon, lat in ring))
            scenario_storm = next(storm for storm in scenario_data["storms"] if storm["id"] == feature["properties"]["id"])
            for property_name in ("valid_time_utc", "eta_utc", "eta_min_utc", "eta_max_utc", "radar_active", "uncertainty_scale"):
                self.assertEqual(scenario_storm[property_name], feature["properties"][property_name])

    def test_empty_scenario_returns_valid_empty_geojson(self):
        collection = _feature_collection({"valid_time_utc": "2026-09-29T12:00:00Z", "storms": []})
        self.assertEqual(collection, {"type": "FeatureCollection", "features": []})

    def test_fixture_has_coherent_replay_and_complete_demo_products(self):
        first = self.client.get("/api/scenario").json()
        repeated = self.client.get("/api/scenario").json()
        self.assertEqual(first, repeated)
        self.assertEqual(len(first["replay"]["frames"]), 5)
        self.assertEqual(len(first["forecast"]["forecast_members"]), 16)
        self.assertAlmostEqual(sum(member["weight"] for member in first["forecast"]["forecast_members"]), 1.0)
        self.assertEqual(len(first["forecast"]["lead_time_products"]), 3)
        self.assertEqual(len(first["impacts"]), 6)
        self.assertEqual(len(first["interactions"]), 2)
        self.assertEqual(len(first["events"]), 2)
        self.assertIn("timestamp_utc", first["events"][0])
        self.assertEqual(
            set(first["storms"][0]["hazards"]),
            {"lightning", "hail", "downburst", "extreme_rain"},
        )
        required_indicators = {
            "lightning_rate_flashes_min", "lightning_acceleration_flashes_min2",
            "ir_temp_k", "ir_cooling_k_per_min", "cape_jkg", "shear_ms",
            "dcape_jkg", "moisture_pct", "vil_kg_m2", "echo_top_km",
        }
        self.assertTrue(required_indicators.issubset(first["storms"][0]["indicators"]))
        self.assertEqual(first["storms"][0]["sensor_reliability"]["radar"], 0.92)
        self.assertIn("growth_rate_km2_per_5min", first["storms"][0])
        self.assertEqual(first["sensors"]["satellite"]["status"], "unavailable")
        self.assertEqual(first["storms"][0]["provenance"]["hazards"], "simulated")

    def test_replay_frames_evolve_storms_and_include_events(self):
        first = self.client.get("/api/scenario?frame_index=0").json()
        last = self.client.get("/api/scenario?frame_index=4").json()
        self.assertNotEqual(first["valid_time_utc"], last["valid_time_utc"])
        frames = last["replay"]["frames"]
        self.assertEqual([frame["frame_index"] for frame in frames], list(range(5)))
        self.assertEqual(len({frame["valid_time_utc"] for frame in frames}), 5)
        expected_ids = {storm["id"] for storm in frames[0]["storms"]}
        self.assertEqual(len(expected_ids), 4)
        for frame in frames:
            self.assertEqual({storm["id"] for storm in frame["storms"]}, expected_ids)
            self.assertTrue(all(event["timestamp_utc"] == frame["valid_time_utc"] for event in frame["events"]))
            self.assertAlmostEqual(sum(member["weight"] for member in frame["forecast"]["forecast_members"]), 1.0)
            for storm in frame["storms"]:
                self.assertEqual(storm["geometry"]["type"], "Polygon")
                ring = storm["geometry"]["coordinates"][0]
                self.assertEqual(ring[0], ring[-1])
                self.assertIn("speed_kmh", storm["motion"])
                self.assertIn("severity", storm)
        first_storm = next(storm for storm in first["storms"] if storm["id"] == "storm_17")
        last_storm = next(storm for storm in last["storms"] if storm["id"] == "storm_17")
        self.assertNotEqual(first_storm["position"], last_storm["position"])
        self.assertGreater(last_storm["max_dbz"], first_storm["max_dbz"])
        self.assertTrue(last["events"])
        self.assertEqual(last["events"][0]["type"], "merge_risk")

    def test_radar_failure_expands_bounds_and_reset_restores(self):
        baseline_collection = self.client.get("/api/nowcast/live").json()
        baseline = baseline_collection["features"][0]
        offline_response = self.client.post("/api/kill-radar")
        offline_collection = self.client.get("/api/nowcast/live").json()
        offline = offline_collection["features"][0]
        self.assertEqual(self.client.get("/api/scenario").json()["geojson"], offline_collection)
        self.assertFalse(offline_response.json()["radar_active"])
        scenario_offline = self.client.get("/api/scenario").json()
        self.assertFalse(scenario_offline["sensors"]["radar"]["available"])
        self.assertEqual(scenario_offline["uncertainty_scale"], 2.5)
        self.assertEqual(scenario_offline["fallback"]["mode"], "simulated_fallback")
        self.assertEqual(scenario_offline["forecast"]["skill_gate"]["display_level"], "probabilistic_hazard_zone")
        self.assertAlmostEqual(sum(member["weight"] for member in scenario_offline["forecast"]["forecast_members"]), 1.0)
        baseline_ring = baseline["geometry"]["coordinates"][0]
        offline_ring = offline["geometry"]["coordinates"][0]
        baseline_width = max(point[0] for point in baseline_ring) - min(point[0] for point in baseline_ring)
        offline_width = max(point[0] for point in offline_ring) - min(point[0] for point in offline_ring)
        self.assertAlmostEqual(offline_width / baseline_width, 2.5, places=5)
        base_props = baseline["properties"]
        offline_props = offline["properties"]
        base_interval = (
            datetime.fromisoformat(base_props["eta_max_utc"].replace("Z", "+00:00"))
            - datetime.fromisoformat(base_props["eta_min_utc"].replace("Z", "+00:00"))
        )
        offline_interval = (
            datetime.fromisoformat(offline_props["eta_max_utc"].replace("Z", "+00:00"))
            - datetime.fromisoformat(offline_props["eta_min_utc"].replace("Z", "+00:00"))
        )
        self.assertGreater(offline_interval, base_interval)
        online_again = self.client.post("/api/kill-radar", json={"active": True})
        self.assertTrue(online_again.json()["radar_active"])
        self.client.post("/api/kill-radar")
        self.client.post("/api/reset-demo")
        restored = self.client.get("/api/nowcast/live").json()["features"][0]
        self.assertEqual(restored["geometry"], baseline["geometry"])

    def test_api_validation_and_local_cors(self):
        self.assertEqual(self.client.get("/api/scenario?frame_index=99").status_code, 422)
        self.assertEqual(self.client.post("/api/kill-radar", json={"active": "sometimes"}).status_code, 422)
        response = self.client.options(
            "/api/scenario",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://localhost:5173")


if __name__ == "__main__":
    unittest.main()
