"""Focused checks for the synthetic PRAMAAN-X backend demo."""

import unittest

import cv2
import numpy as np
from fastapi.testclient import TestClient

from backend.engine import NowcastEngine
from backend.generate_mock import build_sevir_tensor, load_mock_frames
from backend.main import app, state


class MockDataTests(unittest.TestCase):
    def test_mock_frames_load_as_five_dimensional_tensor(self):
        frames = load_mock_frames()
        tensor = build_sevir_tensor(frames)
        self.assertEqual(tensor.shape, (1, 20, 1, 500, 500))
        self.assertEqual(tensor.dtype, np.float32)
        self.assertGreater(float(tensor.max()), 55.0)

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

    def test_small_high_intensity_cell_is_cloudburst(self):
        engine = NowcastEngine(km_per_pixel=0.5)
        cell = {"area_km2": 15.0, "max_dbz": 60.0}
        engine._classify_hazard(cell)
        self.assertEqual(cell["hazard_type"], "Cloudburst")
        self.assertEqual(cell["severity"], "HIGH")


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
        baseline = self.client.get("/api/nowcast/live").json()["features"][0]
        offline_response = self.client.post("/api/kill-radar")
        offline = self.client.get("/api/nowcast/live").json()["features"][0]
        self.assertFalse(offline_response.json()["radar_active"])
        scenario_offline = self.client.get("/api/scenario").json()
        self.assertEqual(scenario_offline["fallback"]["mode"], "simulated_fallback")
        self.assertEqual(scenario_offline["forecast"]["skill_gate"]["display_level"], "probabilistic_hazard_zone")
        self.assertAlmostEqual(sum(member["weight"] for member in scenario_offline["forecast"]["forecast_members"]), 1.0)
        baseline_ring = baseline["geometry"]["coordinates"][0]
        offline_ring = offline["geometry"]["coordinates"][0]
        baseline_width = max(point[0] for point in baseline_ring) - min(point[0] for point in baseline_ring)
        offline_width = max(point[0] for point in offline_ring) - min(point[0] for point in offline_ring)
        self.assertAlmostEqual(offline_width / baseline_width, 2.5, places=5)
        self.client.post("/api/reset-demo")
        restored = self.client.get("/api/nowcast/live").json()["features"][0]
        self.assertEqual(restored["geometry"], baseline["geometry"])


if __name__ == "__main__":
    unittest.main()
