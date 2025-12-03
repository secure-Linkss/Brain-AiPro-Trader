# 🔧 PRISMA SCHEMA UPDATES REQUIRED

Add these models to your `prisma/schema.prisma` file:

```prisma
// AI Provider Management
model AIProvider {
  id               String   @id @default(cuid())
  name             String   // gemini, openai, claude, openrouter
  displayName      String
  apiKey           String
  isActive         Boolean  @default(false)
  isValidated      Boolean  @default(false)
  lastValidated    DateTime?
  requestCount     Int      @default(0)
  successCount     Int      @default(0)
  failureCount     Int      @default(0)
  successRate      Float    @default(0)
  avgResponseTime  Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@index([name, isActive])
}

// 2FA Fields (Add to existing User model)
model User {
  // ... existing fields ...
  
  // Two-Factor Authentication
  twoFactorEnabled     Boolean   @default(false)
  twoFactorSecret      String?
  twoFactorBackupCodes String[]  @default([])
  twoFactorEnabledAt   DateTime?
  
  // ... rest of User model ...
}

// Security Audit Log
model SecurityAuditLog {
  id             String   @id @default(cuid())
  userId         String?
  ipAddress      String
  userAgent      String?
  action         String   // login_attempt, login_success, login_failure, ip_blocked, etc.
  details        Json?
  severity       String   // info, warning, critical
  timestamp      DateTime @default(now())
  
  @@index([userId, timestamp])
  @@index([ipAddress, timestamp])
  @@index([action, timestamp])
}

// Multi-Timeframe Confluence Results (Cache)
model ConfluenceAnalysis {
  id                    String   @id @default(cuid())
  symbol                String
  overallTrend          String
  confluenceScore       Float
  timeframesAnalyzed    Int
  bullishTimeframes     Int
  bearishTimeframes     Int
  neutralTimeframes     Int
  signalStrength        String
  recommendedAction     String
  entryPrice            Float
  stopLoss              Float
  takeProfit1           Float
  takeProfit2           Float
  takeProfit3          Float
  riskRewardRatio       Float
  detailedAnalysis      Json     // Full TimeframeAnalysis array
  createdAt             DateTime @default(now())
  expiresAt             DateTime // Cache expiry (15 min)
  
  @@index([symbol, createdAt])
  @@index([expiresAt])
}

// Smart Money Concepts Detection Results
model SMCDetection {
  id                String   @id @default(cuid())
  symbol            String
  timeframe         String
  orderBlocks       Json     // Array of OrderBlock objects
  fairValueGaps     Json     // Array of FairValueGap objects
  liquiditySweeps   Json     // Array of LiquiditySweep objects
  breakOfStructure  Json     // Array of BOS objects
  changeOfCharacter Json     // Array of CHoCH objects
  createdAt         DateTime @default(now())
  expiresAt         DateTime
  
  @@index([symbol, timeframe, createdAt])
  @@index([expiresAt])
}

// News Sentiment Analysis Results
model NewsSentiment {
  id              String   @id @default(cuid())
  title           String
  content         String   @db.Text
  source          String
  url             String?
  publishedAt     DateTime
  sentiment       String   // very_negative, negative, neutral, positive, very_positive
  confidence      Float
  numericScore    Float    // -1 to +1
  provider        String   // gemini, openai, vader, etc.
  processingTime  Int      // milliseconds
  keywords        String[]
  entities        String[]
  symbolsMentioned String[]
  createdAt       DateTime @default(now())
  
  @@index([publishedAt, sentiment])
  @@index([symbolsMentioned])
}

// Economic Calendar Events
model EconomicEvent {
  id          String   @id @default(cuid())
  title       String
  country     String
  currency    String
  impact      String   // low, medium, high
  date        DateTime
  forecast    String?
  previous    String?
  actual      String?
  description String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([date, impact])
  @@index([currency, date])
}
```

## Migration Command

After adding to schema.prisma, run:

```bash
npx prisma migrate dev --name add_advanced_features
npx prisma generate
```

This will create all new tables and update the Prisma client.
