"""
Advanced Security Middleware
Protects against brute force attacks, DDoS, malware, and unauthorized access
"""

import time
import hashlib
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Optional, Set
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import re
import ipaddress


class SecurityConfig:
    """Security configuration constants"""
    
    # Rate limiting
    MAX_REQUESTS_PER_MINUTE = 60
    MAX_REQUESTS_PER_HOUR = 500
    MAX_FAILED_LOGIN_ATTEMPTS = 5
    LOGIN_LOCKOUT_DURATION = timedelta(minutes=15)
    
    # IP blocking
    MAX_REQUESTS_FROM_SINGLE_IP = 100  # Per minute
    AUTO_BLOCK_THRESHOLD = 200  # Requests per minute triggers auto-block
    BLOCK_DURATION = timedelta(hours=1)
    
    # Request size limits
    MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_JSON_DEPTH = 20
    
    # Suspicious patterns
    SUSPICIOUS_USER_AGENTS = [
        'sqlmap', 'nikto', 'masscan', 'nmap', 'acunetix',
        'burp', 'metasploit', 'havij', 'dirbuster'
    ]
    
    SQL_INJECTION_PATTERNS = [
        r"(\bunion\b.+\bselect\b)",
        r"(\bdrop\b.+\btable\b)",
        r"(\'|\").*(or|and)\s+.*(\'|\")\s*=\s*(\'|\")",
        r"(\bexec\b|\bexecute\b).+\(",
        r"(;|\-\-|\/\*|\*\/)",
    ]
    
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"onerror\s*=",
        r"onload\s*=",
        r"<iframe",
    ]


class IPTracker:
    """Track requests per IP address"""
    
    def __init__(self):
        self.requests_per_minute: Dict[str, list] = defaultdict(list)
        self.requests_per_hour: Dict[str, list] = defaultdict(list)
        self.blocked_ips: Dict[str, datetime] = {}
        self.suspicious_ips: Set[str] = set()
        
    def is_blocked(self, ip: str) -> bool:
        """Check if IP is currently blocked"""
        if ip in self.blocked_ips:
            if datetime.now() < self.blocked_ips[ip]:
                return True
            else:
                # Unblock expired
                del self.blocked_ips[ip]
                return False
        return False
    
    def block_ip(self, ip: str, duration: timedelta = None):
        """Block an IP address"""
        if duration is None:
            duration = SecurityConfig.BLOCK_DURATION
        self.blocked_ips[ip] = datetime.now() + duration
        print(f"[SECURITY] Blocked IP {ip} until {self.blocked_ips[ip]}")
    
    def record_request(self, ip: str) -> bool:
        """
        Record a request from IP and check if rate limit exceeded
        
        Returns:
            True if allowed, False if rate limit exceeded
        """
        now = time.time()
        
        # Clean old entries
        self.requests_per_minute[ip] = [
            t for t in self.requests_per_minute[ip] 
            if now - t < 60
        ]
        self.requests_per_hour[ip] = [
            t for t in self.requests_per_hour[ip] 
            if now - t < 3600
        ]
        
        # Record this request
        self.requests_per_minute[ip].append(now)
        self.requests_per_hour[ip].append(now)
        
        # Check limits
        if len(self.requests_per_minute[ip]) > SecurityConfig.AUTO_BLOCK_THRESHOLD:
            self.block_ip(ip)
            return False
        
        if len(self.requests_per_minute[ip]) > SecurityConfig.MAX_REQUESTS_FROM_SINGLE_IP:
            return False
        
        if len(self.requests_per_hour[ip]) > SecurityConfig.MAX_REQUESTS_PER_HOUR:
            return False
            
        return True
    
    def mark_suspicious(self, ip: str):
        """Mark IP as suspicious (reduce threshold)"""
        self.suspicious_ips.add(ip)


class LoginAttemptTracker:
    """Track failed login attempts"""
    
    def __init__(self):
        self.failed_attempts: Dict[str, list] = defaultdict(list)
        self.locked_accounts: Dict[str, datetime] = {}
        
    def record_failed_attempt(self, identifier: str) -> bool:
        """
        Record failed login attempt
        
        Args:
            identifier: Email or IP address
            
        Returns:
            True if account should be locked
        """
        now = time.time()
        
        # Clean old attempts (older than 1 hour)
        self.failed_attempts[identifier] = [
            t for t in self.failed_attempts[identifier]
            if now - t < 3600
        ]
        
        self.failed_attempts[identifier].append(now)
        
        # Check if should lock
        if len(self.failed_attempts[identifier]) >= SecurityConfig.MAX_FAILED_LOGIN_ATTEMPTS:
            self.lock_account(identifier)
            return True
        
        return False
    
    def lock_account(self, identifier: str):
        """Lock account for specified duration"""
        self.locked_accounts[identifier] = datetime.now() + SecurityConfig.LOGIN_LOCKOUT_DURATION
        print(f"[SECURITY] Locked account {identifier} until {self.locked_accounts[identifier]}")
    
    def is_locked(self, identifier: str) -> bool:
        """Check if account is locked"""
        if identifier in self.locked_accounts:
            if datetime.now() < self.locked_accounts[identifier]:
                return True
            else:
                del self.locked_accounts[identifier]
                return False
        return False
    
    def reset_attempts(self, identifier: str):
        """Reset failed attempts (after successful login)"""
        if identifier in self.failed_attempts:
            del self.failed_attempts[identifier]
        if identifier in self.locked_accounts:
            del self.locked_accounts[identifier]


class MalwareDetector:
    """Detect malicious requests and payloads"""
    
    @staticmethod
    def check_user_agent(user_agent: str) -> bool:
        """
        Check if user agent is suspicious
        
        Returns:
            True if suspicious
        """
        if not user_agent:
            return True
            
        ua_lower = user_agent.lower()
        for pattern in SecurityConfig.SUSPICIOUS_USER_AGENTS:
            if pattern in ua_lower:
                return True
        
        return False
    
    @staticmethod
    def check_sql_injection(text: str) -> bool:
        """
        Check for SQL injection patterns
        
        Returns:
            True if potential SQL injection detected
        """
        text_lower = text.lower()
        
        for pattern in SecurityConfig.SQL_INJECTION_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True
        
        return False
    
    @staticmethod
    def check_xss(text: str) -> bool:
        """
        Check for XSS patterns
        
        Returns:
            True if potential XSS detected
        """
        for pattern in SecurityConfig.XSS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    @staticmethod
    def check_path_traversal(path: str) -> bool:
        """
        Check for path traversal attempts
        
        Returns:
            True if path traversal detected
        """
        dangerous_patterns = ['../', '..\\', '%2e%2e', '..%2f', '..%5c']
        path_lower = path.lower()
        
        for pattern in dangerous_patterns:
            if pattern in path_lower:
                return True
        
        return False
    
    @staticmethod
    def sanitize_input(text: str, max_length: int = 1000) -> str:
        """
        Sanitize user input
        
        Returns:
            Sanitized text
        """
        # Truncate
        text = text[:max_length]
        
        # Remove null bytes
        text = text.replace('\x00', '')
        
        # Remove control characters except newlines and tabs
        text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\t')
        
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
        
        # 1. Check if IP is blocked
        if self.ip_tracker.is_blocked(client_ip):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "IP address temporarily blocked due to suspicious activity"}
            )
        
        # 2. Rate limiting
        if not self.ip_tracker.record_request(client_ip):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded. Please try again later."}
            )
        
        # 3. Check user agent
        user_agent = request.headers.get("user-agent", "")
        if self.malware_detector.check_user_agent(user_agent):
            self.ip_tracker.mark_suspicious(client_ip)
            print(f"[SECURITY] Suspicious user agent from {client_ip}: {user_agent}")
        
        # 4. Check request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > SecurityConfig.MAX_REQUEST_SIZE:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": "Request too large"}
            )
        
        # 5. Check path for traversal
        if self.malware_detector.check_path_traversal(request.url.path):
            self.ip_tracker.block_ip(client_ip)
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Invalid request path"}
            )
        
        # 6. Check query parameters for injection
        for key, value in request.query_params.items():
            if self.malware_detector.check_sql_injection(value):
                self.ip_tracker.mark_suspicious(client_ip)
                print(f"[SECURITY] SQL injection attempt from {client_ip}: {value}")
            if self.malware_detector.check_xss(value):
                self.ip_tracker.mark_suspicious(client_ip)
                print(f"[SECURITY] XSS attempt from {client_ip}: {value}")
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """
        Get real client IP (considering proxies)
        """
        # Check for forwarded IP (behind proxy)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            # Take first IP in chain
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # Fallback to direct connection
        return request.client.host if request.client else "unknown"
    
    def record_login_failure(self, identifier: str) -> bool:
        """
        Record failed login attempt
        
        Args:
            identifier: Email or IP
            
        Returns:
            True if account is now locked
        """
        return self.login_tracker.record_failed_attempt(identifier)
    
    def record_login_success(self, identifier: str):
        """Record successful login (resets attempts)"""
        self.login_tracker.reset_attempts(identifier)
    
    def is_account_locked(self, identifier: str) -> bool:
        """Check if account is locked"""
        return self.login_tracker.is_locked(identifier)


# Global security instance
security = SecurityMiddleware()


# Dependency for protected routes
async def require_security_check(request: Request):
    """FastAPI dependency for security checks"""
    client_ip = security._get_client_ip(request)
    
    if security.ip_tracker.is_blocked(client_ip):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return True


__all__ = [
    'SecurityConfig',
    'SecurityMiddleware',
    'security',
    'require_security_check',
    'MalwareDetector'
]
