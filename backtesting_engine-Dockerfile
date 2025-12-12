# Brain AiPro Trader - Backtesting Engine Service
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
COPY backtesting_engine-requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

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

# Copy application code
COPY python-services/backtesting_engine/ /app/
COPY python-services/data_provider/ /app/data_provider/
COPY python-services/risk_management/ /app/risk_management/
COPY python-services/security/ /app/security/
COPY python-services/mtf_confluence/ /app/mtf_confluence/
COPY python-services/ai_sentiment/ /app/ai_sentiment/
COPY python-services/smc_detector/ /app/smc_detector/
COPY python-services/economic_calendar/ /app/economic_calendar/

# Set Python path
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8003}/health || exit 1

# Expose port
EXPOSE ${PORT:-8003}

# Run the application
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8003} --workers 1
