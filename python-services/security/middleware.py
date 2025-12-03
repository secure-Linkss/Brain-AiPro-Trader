
import time
import hashlib
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Optional, Set
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import re
import ipaddress


# --- Constants ---
# Brute Force Protection
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_PERIOD_MINUTES = 15

# IP Rate Limiting (DDoS Protection)
MAX_REQUESTS_PER_MINUTE = 100

# Malware Detection
MALICIOUS_SIGNATURES = [
    r"<script.*?>",
    r"<iframe.*?>",
    r"onerror\s*=",
    r"onload\s*=",
    r"eval\s*\(",
    r"atob\s*\(",
    r"document\.cookie",
    r"/etc/passwd",
    r"\.\./",
    r"\x[0-9a-fA-F]{2}" # Hex-encoded characters
]

# SQL Injection Detection
SQLI_PATTERNS = [
    r"(?i)(\b(and|or)\b\s+\w+\s*=\s*\w+)",
    r"(?i)(\b(union|select|insert|update|delete|drop|truncate)\b)",
    r"--|#|/\*.*?\*/"
]


# --- IP Tracking (for DDoS protection) ---
class IPTracker:
    """Tracks request counts for each IP address"""
    def __init__(self):
        self.requests = defaultdict(list)

    def add_request(self, ip: str):
        """Record a new request for a given IP"""
        now = time.time()
        self.requests[ip].append(now)
        self._cleanup(ip, now)

    def _cleanup(self, ip: str, now: float):
        """Remove requests older than one minute"""
        one_minute_ago = now - 60
        self.requests[ip] = [t for t in self.requests[ip] if t > one_minute_ago]

    def get_request_count(self, ip: str) -> int:
        """Get the number of requests from an IP in the last minute"""
        now = time.time()
        self._cleanup(ip, now)
        return len(self.requests[ip])


# --- Login Attempt Tracking (for Brute Force protection) ---
class LoginAttemptTracker:
    """Tracks failed login attempts for user identifiers (e.g., username, email)"""
    def __init__(self):
        self.attempts = defaultdict(int)
        self.locked_until = defaultdict(float)

    def record_failed_login(self, identifier: str):
        """Record a failed login and lock the account if necessary"""
        if self.is_locked(identifier):
            return

        self.attempts[identifier] += 1
        if self.attempts[identifier] >= MAX_LOGIN_ATTEMPTS:
            self.lock_account(identifier)

    def lock_account(self, identifier: str):
        """Lock an account for the configured lockout period"""
        self.locked_until[identifier] = time.time() + (LOCKOUT_PERIOD_MINUTES * 60)

    def clear_attempts(self, identifier: str):
        """Clear login attempts and unlock the account"""
        if identifier in self.attempts:
            del self.attempts[identifier]
        if identifier in self.locked_until:
            del self.locked_until[identifier]

    def is_locked(self, identifier: str) -> bool:
        """Check if an account is currently locked"""
        if identifier not in self.locked_until:
            return False

        if time.time() > self.locked_until[identifier]:
            self.clear_attempts(identifier)
            return False
        
        return True


# --- Malware Detection ---
class MalwareDetector:
    """Scans request bodies and query parameters for malicious patterns"""
    def __init__(self):
        self.malicious_regex = re.compile("|".join(MALICIOUS_SIGNATURES), re.IGNORECASE)
        self.sqli_regex = re.compile("|".join(SQLI_PATTERNS), re.IGNORECASE)

    async def scan_request(self, request: Request) -> bool:
        """Scan the request for potential malware or injection attacks"""
        # Scan query parameters
        for key, value in request.query_params.items():
            if self._is_malicious(value):
                return True

        # Scan path parameters
        for key, value in request.path_params.items():
            if self._is_malicious(str(value)):
                return True

        # Scan request body (if it exists and is readable)
        try:
            body = await request.json()
            if isinstance(body, dict):
                for key, value in body.items():
                    if self._is_malicious(str(value)):
                        return True
            elif isinstance(body, list):
                for item in body:
                    if self._is_malicious(str(item)):
                        return True
            else:
                if self._is_malicious(str(body)):
                    return True
        except Exception:
            # Ignore if body is not JSON or cannot be read
            pass

        return False

    def _is_malicious(self, text: str) -> bool:
        """Check if a given text string contains malicious patterns"""
        if self.malicious_regex.search(text) or self.sqli_regex.search(text):
            return True
        return False

    def sanitize(self, text: str) -> str:
        """Sanitize a string by removing potentially malicious content"""
        # Basic sanitization - more robust libraries should be used for production
        text = re.sub(r"<.*?>", "", text) # Remove HTML tags
        text = self.malicious_regex.sub("", text)
        text = self.sqli_regex.sub("", text)
        
        return text


class SecurityMiddleware:
    """
    Comprehensive security middleware for FastAPI
    Protects against: brute force, DDoS, malware, injection attacks
    """
    
    def __init__(self):
        self.ip_tracker = IPTracker()
        self.login_tracker = LoginAttemptTracker()
        self.malware_detector = MalwareDetector()
        
    async def __call__(self, request: Request, call_next):
        """Process request through security checks"""
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        if not client_ip:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST, 
                content={"detail": "Could not identify client IP"}
            )

        # 1. DDoS Protection (IP Rate Limiting)
        self.ip_tracker.add_request(client_ip)
        if self.ip_tracker.get_request_count(client_ip) > MAX_REQUESTS_PER_MINUTE:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded"}
            )

        # 2. Malware & Injection Scanning
        if await self.malware_detector.scan_request(request):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Malicious payload detected"}
            )

        # 3. Brute Force Protection (check for locked accounts on login attempts)
        # This part is more effectively handled in the login route itself, but a
        # middleware check can provide an early exit.
        if "/login" in request.url.path or "/token" in request.url.path:
            # This requires parsing the request body to get the username/email
            # which can be complex in middleware. We will assume the login route
            # handles this logic using the `login_tracker` instance.
            pass

        response = await call_next(request)
        return response

    def _get_client_ip(self, request: Request) -> Optional[str]:
        """Get the client IP address from the request"""
        x_forwarded_for = request.headers.get("x-forwarded-for")
        if x_forwarded_for:
            # The first IP in the list is the original client
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.client.host
        
        try:
            ipaddress.ip_address(ip) # Validate IP address
            return ip
        except ValueError:
            return None

    # --- Methods to be called from application routes ---
    def record_failed_login(self, identifier: str):
        self.login_tracker.record_failed_login(identifier)

    def clear_login_attempts(self, identifier: str):
        self.login_tracker.clear_attempts(identifier)

    def is_login_locked(self, identifier: str) -> bool:
        return self.login_tracker.is_locked(identifier)


# Global security instance
security = SecurityMiddleware()


# Dependency for protected routes
async def require_security_check(request: Request):
    # This is a placeholder. In a real application, you would implement
    # JWT token validation or other authentication checks here.
    # For now, we just ensure the middleware runs.
    pass
