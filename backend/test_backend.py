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
        self.assertEqual(scenario.json()["geojson"], live.json())
        self.assertGreater(len(live.json()["features"]), 0)
        for feature in live.json()["features"]:
            self.assertEqual(feature["type"], "Feature")
            self.assertEqual(feature["geometry"]["type"], "Polygon")
            ring = feature["geometry"]["coordinates"][0]
            self.assertEqual(ring[0], ring[-1])
            self.assertIn("eta_utc", feature["properties"])

    def test_radar_failure_expands_bounds_and_reset_restores(self):
        baseline = self.client.get("/api/nowcast/live").json()["features"][0]
        offline_response = self.client.post("/api/kill-radar")
        offline = self.client.get("/api/nowcast/live").json()["features"][0]
        self.assertFalse(offline_response.json()["radar_active"])
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
