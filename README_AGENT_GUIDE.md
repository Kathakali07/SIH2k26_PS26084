# ClimaX: AI Agent & OpenSpec Setup Guide

Welcome to the ClimaX repository. This document serves as the global guide for human developers and future AI agents to understand the project architecture, the "Brain" memory system, and the OpenSpec development workflow used to build the real-time convective-scale nowcasting system (Kalbaishakhi Tracker).

## 1. Project Context
**Problem Statement**: SIH (Convective scale nowcasting for Thunderstorms, Hail & Cloudbursts 0–6 hr)
**Goal**: Build a real-time, convective-scale Nowcasting System operating at 1–3 km spatial resolution using Earthformer (PyTorch), OpenCV object tracking, FastAPI, and MapLibre. 
**Compute Constraints**: The pipeline is designed to run localized PyTorch inference on an RTX 3050 Ti GPU.

## 2. The "Brain" (Obsidian Graph Memory)
To conserve context tokens and share knowledge across agents, we maintain a stateful memory graph in the `/docs/brain/` directory.

**How to use the Brain:**
- **Agents**: Before executing tasks or writing new code, AI agents MUST read the relevant files in `/docs/brain/` (e.g., using `view_file` or `grep_search`).
- **Humans**: You can open the `/docs/brain/` folder in Obsidian. The markdown files use `[[Wikilinks]]` to interlink concepts (e.g., `[[Earthformer_Spec]]` connects to `[[API_Contract]]`).
- **Current Memory Files**:
  - `Earthformer_Spec.md`: Details the tensor dimensions, OpenCV contour extraction logic, and Hungarian matching math.
  - `API_Contract.md`: The RFC 7946 GeoJSON schema output by FastAPI.
  - `Frontend_State.md`: UI spec for the React/MapLibre dashboard (delegated to the frontend team).

## 3. OpenSpec Workflow
This project enforces a rigorous **Spec-Driven Development** (SDD) framework via **OpenSpec**. Code is never written spontaneously ("Vibe Coding" is strictly prohibited). All code must be preceded by an approved design and task list.

**The Three-Phase Flow:**
1. **Propose (`/opsx-propose`)**: 
   - Generates the initial proposal, specs, technical design, and task list in `openspec/changes/<change-name>/`.
2. **Apply (`/opsx-apply`)**: 
   - An agent executes the implementation precisely as outlined in the `tasks.md` file. It modifies the application codebase (e.g., `backend/engine.py`).
3. **Archive (`/opsx-archive`)**: 
   - Once implementation is verified, the change is merged, and specs are updated.

### Agent Instructions for OpenSpec:
If you are an agent joining this project:
- Check for active changes using the `openspec status` CLI command.
- If an active change exists (e.g., `init-climax`), read its `tasks.md` and `design.md` before writing code.
- If you need to make structural changes, ask the user to invoke `/opsx-propose` or `/opsx-update` to formally draft the changes.

## 4. Environment Setup
**Backend**:
1. Ensure Python 3.10+ is installed.
2. Create and activate a virtual environment (`python -m venv venv`).
3. Install base requirements: `pip install -r requirements.txt`.
4. Install PyTorch with CUDA (e.g., for RTX 3050 Ti): 
   `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121`
5. Run the server: `python backend/main.py`

**Frontend**:
- Handed off to a teammate. See `frontend_integration_guide.md` in the root directory for MapLibre and React setup.
