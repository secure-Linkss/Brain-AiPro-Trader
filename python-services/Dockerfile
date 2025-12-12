# Brain AiPro Trader - Main API Server
# Central Gateway Service integrating all trading services
# Multi-stage build for optimal image size

FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt requirements.txt

# Install Python dependencies
# Install with error handling for optional AI libraries
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt || \
    (echo "Some optional dependencies failed, continuing..." && \
     pip install --no-cache-dir fastapi uvicorn pydantic numpy pandas scipy yfinance \
     psycopg2-binary sqlalchemy httpx aiohttp requests python-dateutil pytz \
     python-json-logger loguru pandas-ta ta ccxt backtrader bt vaderSentiment textblob \
     python-jose passlib bcrypt cryptography schedule python-dotenv fredapi)

# Final stage
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code - all python services
COPY . /app/

# Set Python path
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Expose port
EXPOSE ${PORT:-8000}

# Run the main API server
CMD uvicorn api_server:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
