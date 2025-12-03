"""
Two-Factor Authentication (2FA) Implementation
Supports TOTP (Time-based One-Time Password) using Google Authenticator, Authy, etc.
"""

import pyotp
import qrcode
import io
import base64
from typing import Optional, Tuple
from dataclasses import dataclass
from datetime import datetime


@dataclass
class TwoFactorSetup:
    """2FA setup information"""
    secret: str
    qr_code_base64: str  # Base64 encoded QR code image
    backup_codes: list[str]
    uri: str  # otpauth:// URI for manual entry


class TwoFactorAuth:
    """
    Two-Factor Authentication manager
    Implements TOTP (RFC 6238) for secure authentication
    """
    
    APP_NAME = "Brain AiPro Trader"
    
    @staticmethod
    def generate_secret() -> str:
        """
        Generate a new random secret for 2FA
        
        Returns:
            Base32-encoded secret
        """
        return pyotp.random_base32()
    
    @staticmethod
    def generate_backup_codes(count: int = 10) -> list[str]:
        """
        Generate backup recovery codes
        
        Args:
            count: Number of backup codes to generate
            
        Returns:
            List of backup codes (format: XXXX-XXXX-XXXX)
        """
        import random
        import string
        
        codes = []
        for _ in range(count):
            # Generate 12-character code in groups of 4
            code_parts = []
            for _ in range(3):
                segment = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
                code_parts.append(segment)
            codes.append('-'.join(code_parts))
        
        return codes
    
    @classmethod
    def setup_2fa(cls, user_email: str) -> TwoFactorSetup:
        """
        Complete 2FA setup for a user
        
        Args:
            user_email: User's email address
            
        Returns:
            TwoFactorSetup with secret, QR code, and backup codes
        """
        # Generate secret
        secret = cls.generate_secret()
        
        # Create TOTP URI
        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(
            name=user_email,
            issuer_name=cls.APP_NAME
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(uri)
        qr.make(fit=True)
        
        # Convert to base64 image
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Generate backup codes
        backup_codes = cls.generate_backup_codes()
        
        return TwoFactorSetup(
            secret=secret,
            qr_code_base64=qr_code_base64,
            backup_codes=backup_codes,
            uri=uri
        )
    
    @staticmethod
    def verify_token(secret: str, token: str) -> bool:
        """
        Verify a TOTP token
        
        Args:
            secret: User's 2FA secret
            token: 6-digit code from authenticator app
            
        Returns:
            True if token is valid
        """
        if not token or len(token) != 6:
            return False
        
        try:
            totp = pyotp.TOTP(secret)
            # Allow 1 time step before/after current (30 seconds window)
            return totp.verify(token, valid_window=1)
        except:
            return False
    
    @staticmethod
    def verify_backup_code(
        backup_codes: list[str],
        provided_code: str
    ) -> Tuple[bool, Optional[list[str]]]:
        """
        Verify a backup recovery code
        
        Args:
            backup_codes: List of user's unused backup codes
            provided_code: Code provided by user
            
        Returns:
            Tuple of (is_valid, updated_backup_codes)
            If valid, returns updated list with code removed
        """
        # Normalize format (remove dashes, uppercase)
        normalized_provided = provided_code.replace('-', '').upper()
        
        for code in backup_codes:
            normalized_stored = code.replace('-', '').upper()
            if normalized_provided == normalized_stored:
                # Valid! Remove from list (single use)
                updated_codes = [c for c in backup_codes if c != code]
                return True, updated_codes
        
        return False, backup_codes
    
    @staticmethod
    def generate_current_token(secret: str) -> str:
        """
        Generate the current TOTP token (for testing/debugging)
        
        Args:
            secret: User's 2FA secret
            
        Returns:
            Current 6-digit token
        """
        totp = pyotp.TOTP(secret)
        return totp.now()


class TwoFactorService:
    """
    Service layer for 2FA operations
    Integrates with database and user sessions
    """
    
    def __init__(self, db):
        """
        Initialize 2FA service
        
        Args:
            db: Database connection (Prisma client)
        """
        self.db = db
        self.tfa = TwoFactorAuth()
    
    async def enable_2fa(self, user_id: str, user_email: str) -> TwoFactorSetup:
        """
        Enable 2FA for a user
        
        Args:
            user_id: User ID
            user_email: User email (for QR code)
            
        Returns:
            TwoFactorSetup information
        """
        # Generate 2FA setup
        setup = self.tfa.setup_2fa(user_email)
        
        # Save to database
        await self.db.user.update(
            where={'id': user_id},
            data={
                'twoFactorSecret': setup.secret,
                'twoFactorBackupCodes': setup.backup_codes,
                'twoFactorEnabled': False  # Not enabled until verified
            }
        )
        
        return setup
    
    async def verify_and_enable_2fa(
        self,
        user_id: str,
        token: str
    ) -> bool:
        """
        Verify initial 2FA token and enable 2FA
        
        Args:
            user_id: User ID
            token: First token from authenticator app
            
        Returns:
            True if verified and enabled
        """
        # Get user's secret
        user = await self.db.user.findUnique(where={'id': user_id})
        if not user or not user.twoFactorSecret:
            return False
        
        # Verify token
        if not self.tfa.verify_token(user.twoFactorSecret, token):
            return False
        
        # Enable 2FA
        await self.db.user.update(
            where={'id': user_id},
            data={
                'twoFactorEnabled': True,
                'twoFactorEnabledAt': datetime.now()
            }
        )
        
        return True
    
    async def verify_login_token(
        self,
        user_id: str,
        token: str
    ) -> bool:
        """
        Verify 2FA token during login
        
        Args:
            user_id: User ID
            token: 6-digit token or backup code
            
        Returns:
            True if valid
        """
        user = await self.db.user.findUnique(where={'id': user_id})
        
        if not user or not user.twoFactorEnabled:
            return False
        
        # Try as TOTP token first
        if self.tfa.verify_token(user.twoFactorSecret, token):
            return True
        
        # Try as backup code
        is_valid, updated_codes = self.tfa.verify_backup_code(
            user.twoFactorBackupCodes or [],
            token
        )
        
        if is_valid:
            # Update backup codes (remove used one)
            await self.db.user.update(
                where={'id': user_id},
                data={'twoFactorBackupCodes': updated_codes}
            )
            return True
        
        return False
    
    async def disable_2fa(self, user_id: str) -> bool:
        """
        Disable 2FA for a user
        
        Args:
            user_id: User ID
            
        Returns:
            True if disabled
        """
        await self.db.user.update(
            where={'id': user_id},
            data={
                'twoFactorEnabled': False,
                'twoFactorSecret': None,
                'twoFactorBackupCodes': None
            }
        )
        
        return True
    
    async def regenerate_backup_codes(self, user_id: str) -> list[str]:
        """
        Regenerate backup codes for a user
        
        Args:
            user_id: User ID
            
        Returns:
            New list of backup codes
        """
        new_codes = self.tfa.generate_backup_codes()
        
        await self.db.user.update(
            where={'id': user_id},
            data={'twoFactorBackupCodes': new_codes}
        )
        
        return new_codes


__all__ = [
    'TwoFactorAuth',
    'TwoFactorSetup',
    'TwoFactorService'
]
