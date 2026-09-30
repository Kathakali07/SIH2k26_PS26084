# Multi-stage build: React Frontend + FastAPI Backend in a single container
# Stage 1: Build the React SPA
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Ultra-lightweight Python runtime
FROM python:3.10-slim
WORKDIR /app

# Install backend dependencies (production lightweight, no heavy 2GB PyTorch)
COPY requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt

# Copy backend application
COPY backend/ ./backend/

# Copy compiled frontend dist from Stage 1 into backend-accessible path
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Render and cloud platforms supply the PORT environment variable
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
