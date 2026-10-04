# Earthformer ML & Tracking Spec

## Tensor Dimensions
The SEVIR Earthformer backbone expects a 65-minute context of Radar VIL.
- **Input Shape**: `[Batch, Time, Channel, Height, Width]` (e.g., `[1, 13, 1, 384, 384]`)
- **Output Shape**: `[1, 12, 1, 384, 384]` (60-minute forecast, 12 future frames)

## Tracking Strategy (Storm-as-an-Object)
Instead of dense optical flow, we treat convective cells as discrete objects to feed the [[API_Contract]].
1. Convert output PyTorch tensor to a NumPy array.
2. Apply `cv2.findContours` on a $> 40\text{ dBZ}$ threshold to isolate storm cells.
3. Compute the `centroid`, `bounding box`, and `area` for each contour.
4. **Hungarian Matching**: Use `scipy.optimize.linear_sum_assignment` (minimizing Euclidean distance between centroids in Frame $N$ and Frame $N+1$) to associate identical storm cells.
5. Derive velocity vectors $(u, v)$ for each matched object to compute the absolute `eta_utc` timestamp.

## Hazard Thresholds
- **Cloudburst**: `Area < 20 km²` AND `max intensity > 55 dBZ` (localized, extreme rapid rainfall).
- **Thunderstorm**: `max intensity > 40 dBZ`.

These thresholds dictate the `hazard_type` sent to the [[Frontend_State]].
