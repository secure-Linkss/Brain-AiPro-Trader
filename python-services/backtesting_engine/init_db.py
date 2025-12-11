"""
Database initialization script for Brain AI Pro Trader
Creates admin and test user accounts with proper password hashing
"""

import os
import sys
import asyncio
from passlib.context import CryptContext
import psycopg2
from psycopg2 import sql

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_database():
    """Initialize database with admin and test users"""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        return False
    
    try:
        print("🔗 Connecting to database...")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Hash passwords
        admin_password_hash = pwd_context.hash("Mayflower1!!")
        user_password_hash = pwd_context.hash("Mayflower1!")
        
        print("👤 Creating admin user...")
        # Insert admin user
        cursor.execute("""
            INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (email) DO UPDATE 
            SET password = EXCLUDED.password, 
                role = EXCLUDED.role,
                "updatedAt" = NOW()
        """, ('brain@admin.com', 'Brain Admin', admin_password_hash, 'admin'))
        
        print("👤 Creating test user...")
        # Insert test user
        cursor.execute("""
            INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (email) DO UPDATE 
            SET password = EXCLUDED.password,
                "updatedAt" = NOW()
        """, ('testaccount1@test.com', 'Test Account 1', user_password_hash, 'user'))
        
        # Create default trading pairs
        print("📊 Creating default trading pairs...")
        trading_pairs = [
            ('BTCUSD', 'Bitcoin', 'crypto'),
            ('ETHUSD', 'Ethereum', 'crypto'),
            ('AAPL', 'Apple Inc.', 'stock'),
            ('TSLA', 'Tesla Inc.', 'stock'),
            ('EURUSD', 'Euro/US Dollar', 'forex'),
        ]
        
        for symbol, name, market in trading_pairs:
            cursor.execute("""
                INSERT INTO "TradingPair" (id, symbol, name, market, "isActive", "createdAt")
                VALUES (gen_random_uuid()::text, %s, %s, %s, true, NOW())
                ON CONFLICT (symbol) DO UPDATE 
                SET name = EXCLUDED.name, 
                    market = EXCLUDED.market,
                    "isActive" = true
            """, (symbol, name, market))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n✅ Database initialized successfully!")
        print("\n📋 Default Credentials:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Admin:")
        print("  Email: brain@admin.com")
        print("  Password: Mayflower1!!")
        print("\nTest User:")
        print("  Email: testaccount1@test.com")
        print("  Password: Mayflower1!")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(init_database())
    sys.exit(0 if result else 1)
