#!/usr/bin/env python3
"""
Minimal API Server for Brain AI Pro Trader
Test deployment version
"""

from fastapi import FastAPI
import os

app = FastAPI(title="Brain AiPro Trader - Test API")

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "message": "Brain AI Pro Trader Test API is running",
        "port": os.getenv("PORT", "8000"),
        "service": "test-api-server"
    }

@app.get("/")
async def root():
    return {
        "message": "Brain AI Pro Trader Test API",
        "version": "1.0.0",
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)