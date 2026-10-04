# DGMR Integration Documentation

## Overview
This branch (`feat/dgmr-integration`) implements the integration of the DeepMind Deep Generative Model of Rainfall (DGMR) into the ClimaX backend. The integration enables the system to process real radar data, run it through the DGMR neural network, and forecast future precipitation which is then passed to our OpenCV tracking engine.

## Key Changes
1. **Model Integration (`engine.py`)**
   - Added `DGMRInferenceEngine` to wrap the `openclimatefix/dgmr` HuggingFace model.
   - Refactored `NowcastEngine.ingest_and_predict()` to support routing data through DGMR (`use_dgmr=True`).
   - Implemented correct data normalization: DGMR requires normalized precipitation rates (`mm/hr`).
   - Added robust scaling to map model outputs back to physical dBZ values using the Marshall-Palmer Z-R relationship (`Z = 200 * R^1.6`).
   - Updated the `NowcastEngine._classify_hazard()` threshold to support parsing light and moderate rain down to `15.0 dBZ`, ensuring we capture all DGMR predicted intensities.

2. **Real Data Ingestion (`download_real_radar.py` & `run_dgmr_inference.py`)**
   - Created a pipeline to ingest authentic `.gif` radar sequences from PySTEPS (e.g. MeteoSwiss datasets).
   - `run_dgmr_inference.py` loads authentic historical data (July 2016 Swiss Thunderstorm), parses it to `[Batch, Time, Channel, Height, Width]` format, and successfully executes the pipeline end-to-end to trace storm contours.

3. **Deployment Export (`export_dgmr_frames.py`)**
   - Wrote an export script to execute the DGMR forecast offline and concatenate the input context with the model's future prediction.
   - The combined 38-frame array is saved sequentially as `frame_000.npy` to `frame_037.npy` in `data/mock_frames`.
   - This allows the `main` branch deployment to seamlessly load authentic AI-generated datasets without requiring heavy-weight PyTorch dependencies on the live server.

## Status
- **Validation**: Complete. DGMR successfully tracks and predicts future paths for >15 dBZ storm cells.
- **Next Steps**: Branch is ready to be merged into `main` or used to supply precomputed forecast arrays to the `main` dashboard demo.
