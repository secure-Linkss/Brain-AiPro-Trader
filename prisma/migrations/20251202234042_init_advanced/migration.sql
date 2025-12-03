-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionExpires" TIMESTAMP(3),
    "telegramBotId" TEXT,
    "telegramChatId" TEXT,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "twoFactorEnabledAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading_pairs" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "exchange" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trading_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradingPairId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,
    "strategy" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit1" DOUBLE PRECISION,
    "takeProfit2" DOUBLE PRECISION,
    "takeProfit3" DOUBLE PRECISION,
    "takeProfit4" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "confirmations" DOUBLE PRECISION,
    "riskReward" TEXT,
    "fibonacci" JSONB,
    "elliottWave" JSONB,
    "timeframe" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "sniperEntry" BOOLEAN NOT NULL DEFAULT false,
    "fundamentalScore" DOUBLE PRECISION,
    "retestStatus" TEXT DEFAULT 'PENDING',
    "signalQuality" TEXT,
    "successRate" DOUBLE PRECISION,
    "volumeConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "newsImpact" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradingPairId" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timeframe" TEXT,
    "indicators" JSONB,
    "patterns" JSONB,
    "successRate" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "success_rates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "timeframe" TEXT,
    "totalSignals" INTEGER NOT NULL DEFAULT 0,
    "successfulSignals" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgProfit" DOUBLE PRECISION DEFAULT 0,
    "avgLoss" DOUBLE PRECISION DEFAULT 0,
    "profitFactor" DOUBLE PRECISION DEFAULT 0,
    "maxDrawdown" DOUBLE PRECISION DEFAULT 0,
    "sharpeRatio" DOUBLE PRECISION DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "success_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scanner_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradingPairId" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "signal" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,
    "strategies" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scanner_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradingPairId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_data" (
    "id" TEXT NOT NULL,
    "tradingPairId" TEXT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "timeframe" TEXT NOT NULL DEFAULT '1h',

    CONSTRAINT "price_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "source" TEXT NOT NULL,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "sentiment" DOUBLE PRECISION,
    "impactScore" DOUBLE PRECISION,
    "entities" JSONB,
    "affectedSymbols" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "watchlistId" TEXT,
    "signalTypes" TEXT[],
    "minConfidence" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "channels" TEXT[],
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "digestMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "channels" TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backtest_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "symbol" TEXT,
    "timeframe" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalTrades" INTEGER NOT NULL,
    "winningTrades" INTEGER NOT NULL,
    "losingTrades" INTEGER NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "precision" DOUBLE PRECISION NOT NULL,
    "recall" DOUBLE PRECISION NOT NULL,
    "f1Score" DOUBLE PRECISION NOT NULL,
    "avgReturn" DOUBLE PRECISION NOT NULL,
    "avgProfit" DOUBLE PRECISION NOT NULL,
    "avgLoss" DOUBLE PRECISION NOT NULL,
    "maxDrawdown" DOUBLE PRECISION NOT NULL,
    "sharpeRatio" DOUBLE PRECISION,
    "profitFactor" DOUBLE PRECISION,
    "expectancy" DOUBLE PRECISION,
    "avgHoldingTime" DOUBLE PRECISION,
    "trades" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backtest_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pattern_detections" (
    "id" TEXT NOT NULL,
    "tradingPairId" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "patternType" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "indicators" JSONB,
    "explanation" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "outcome" TEXT,
    "actualReturn" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pattern_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_weights" (
    "id" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "minConfidence" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "description" TEXT,
    "lastBacktestId" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "strategy_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health" (
    "id" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" DOUBLE PRECISION,
    "errorRate" DOUBLE PRECISION,
    "message" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "botToken" TEXT,
    "chatId" TEXT,
    "username" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notifySignals" BOOLEAN NOT NULL DEFAULT true,
    "notifyNews" BOOLEAN NOT NULL DEFAULT true,
    "notifyAlerts" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_resistance" (
    "id" TEXT NOT NULL,
    "tradingPairId" TEXT NOT NULL,
    "level" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,
    "timeframe" TEXT NOT NULL,
    "firstTested" TIMESTAMP(3) NOT NULL,
    "lastTested" TIMESTAMP(3) NOT NULL,
    "touchCount" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_resistance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pivot_points" (
    "id" TEXT NOT NULL,
    "tradingPairId" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pivot" DOUBLE PRECISION NOT NULL,
    "r1" DOUBLE PRECISION NOT NULL,
    "r2" DOUBLE PRECISION NOT NULL,
    "r3" DOUBLE PRECISION NOT NULL,
    "s1" DOUBLE PRECISION NOT NULL,
    "s2" DOUBLE PRECISION NOT NULL,
    "s3" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pivot_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedIP" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "BlockedIP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityLog" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "repliedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winningTrades" INTEGER NOT NULL DEFAULT 0,
    "losingTrades" INTEGER NOT NULL DEFAULT 0,
    "totalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "largestWin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "largestLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageWin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitFactor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trading_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winningTrades" INTEGER NOT NULL DEFAULT 0,
    "losingTrades" INTEGER NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitFactor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sharpeRatio" DOUBLE PRECISION,
    "maxDrawdown" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageWin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "largestWin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "largestLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectancy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskRewardRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION NOT NULL,
    "takeProfit" DOUBLE PRECISION NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION,
    "profitPercent" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "strategy" TEXT,
    "notes" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "lastValidated" TIMESTAMP(3),
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "severity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confluence_analyses" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "overallTrend" TEXT NOT NULL,
    "confluenceScore" DOUBLE PRECISION NOT NULL,
    "timeframesAnalyzed" INTEGER NOT NULL,
    "bullishTimeframes" INTEGER NOT NULL,
    "bearishTimeframes" INTEGER NOT NULL,
    "neutralTimeframes" INTEGER NOT NULL,
    "signalStrength" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION NOT NULL,
    "takeProfit1" DOUBLE PRECISION NOT NULL,
    "takeProfit2" DOUBLE PRECISION NOT NULL,
    "takeProfit3" DOUBLE PRECISION NOT NULL,
    "riskRewardRatio" DOUBLE PRECISION NOT NULL,
    "detailedAnalysis" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "confluence_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smc_detections" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "orderBlocks" JSONB NOT NULL,
    "fairValueGaps" JSONB NOT NULL,
    "liquiditySweeps" JSONB NOT NULL,
    "breakOfStructure" JSONB NOT NULL,
    "changeOfCharacter" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smc_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_sentiments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "sentiment" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "numericScore" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL,
    "processingTime" INTEGER NOT NULL,
    "keywords" TEXT[],
    "entities" TEXT[],
    "symbolsMentioned" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_sentiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economic_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "forecast" TEXT,
    "previous" TEXT,
    "actual" TEXT,
    "description" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economic_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mt4_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT,
    "accountNumber" BIGINT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountCurrency" TEXT NOT NULL DEFAULT 'USD',
    "brokerName" TEXT,
    "brokerServer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastHeartbeat" TIMESTAMP(3),
    "lastAccountUpdate" TIMESTAMP(3),
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "connectionQuality" TEXT NOT NULL DEFAULT 'unknown',
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freeMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leverage" INTEGER NOT NULL DEFAULT 100,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ipWhitelist" JSONB,
    "rateLimit" INTEGER NOT NULL DEFAULT 10,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedAttempt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "riskPercent" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxLot" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "maxOpenTrades" INTEGER NOT NULL DEFAULT 3,
    "dailyLossLimit" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "allowBuy" BOOLEAN NOT NULL DEFAULT true,
    "allowSell" BOOLEAN NOT NULL DEFAULT true,
    "stopAfterMaxLoss" BOOLEAN NOT NULL DEFAULT true,
    "breakEvenEnabled" BOOLEAN NOT NULL DEFAULT false,
    "breakEvenTriggerR" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "breakEvenPadding" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "tp1Enabled" BOOLEAN NOT NULL DEFAULT true,
    "tp2Enabled" BOOLEAN NOT NULL DEFAULT true,
    "tp3Enabled" BOOLEAN NOT NULL DEFAULT true,
    "tp4Enabled" BOOLEAN NOT NULL DEFAULT true,
    "partialCloseTP1" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "partialCloseTP2" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "partialCloseTP3" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "partialCloseTP4" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "eaVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mt4_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mt4_trades" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "ticket" BIGINT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lots" DOUBLE PRECISION NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "tp1" DOUBLE PRECISION,
    "tp2" DOUBLE PRECISION,
    "tp3" DOUBLE PRECISION,
    "tp4" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "swap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "openTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closeTime" TIMESTAMP(3),
    "closePrice" DOUBLE PRECISION,
    "closeReason" TEXT,
    "trailingActive" BOOLEAN NOT NULL DEFAULT false,
    "trailingMode" TEXT,
    "originalSL" DOUBLE PRECISION,
    "trailCount" INTEGER NOT NULL DEFAULT 0,
    "lastTrailTime" TIMESTAMP(3),
    "breakEvenHit" BOOLEAN NOT NULL DEFAULT false,
    "breakEvenTime" TIMESTAMP(3),
    "tp1Hit" BOOLEAN NOT NULL DEFAULT false,
    "tp2Hit" BOOLEAN NOT NULL DEFAULT false,
    "tp3Hit" BOOLEAN NOT NULL DEFAULT false,
    "tp4Hit" BOOLEAN NOT NULL DEFAULT false,
    "tp1HitTime" TIMESTAMP(3),
    "tp2HitTime" TIMESTAMP(3),
    "tp3HitTime" TIMESTAMP(3),
    "tp4HitTime" TIMESTAMP(3),
    "rMultiple" DOUBLE PRECISION,
    "maxProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDrawdown" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "mt4_trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mt4_errors" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "errorCode" INTEGER,
    "message" TEXT NOT NULL,
    "ticket" BIGINT,
    "context" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mt4_errors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_instructions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "symbol" TEXT,
    "type" TEXT,
    "lot" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "tp1" DOUBLE PRECISION,
    "tp2" DOUBLE PRECISION,
    "tp3" DOUBLE PRECISION,
    "tp4" DOUBLE PRECISION,
    "ticket" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "error" TEXT,
    "errorCode" INTEGER,

    CONSTRAINT "trade_instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailing_configs" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "mode" TEXT NOT NULL DEFAULT 'hybrid',
    "atrPeriod" INTEGER NOT NULL DEFAULT 14,
    "atrMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "atrSmoothing" BOOLEAN NOT NULL DEFAULT true,
    "structureSensitivity" TEXT NOT NULL DEFAULT 'medium',
    "structureMinSwingPips" DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    "structureIgnoreWicks" BOOLEAN NOT NULL DEFAULT true,
    "breakEvenR" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "breakEvenPadding" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "breakEvenAutoEnable" BOOLEAN NOT NULL DEFAULT true,
    "trailRStep" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "minTrailDistancePips" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "maxPullbackPercent" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "volatilityFilterEnabled" BOOLEAN NOT NULL DEFAULT true,
    "volatilityThreshold" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "onlyTrailOnCandleClose" BOOLEAN NOT NULL DEFAULT true,
    "delayBetweenModsSec" INTEGER NOT NULL DEFAULT 20,
    "ignoreNoiseUnderPips" DOUBLE PRECISION NOT NULL DEFAULT 6.0,
    "tpHitTighterTrailing" BOOLEAN NOT NULL DEFAULT true,
    "tighterTrailMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "sendTrailingAlerts" BOOLEAN NOT NULL DEFAULT true,
    "alertOnBreakEven" BOOLEAN NOT NULL DEFAULT true,
    "alertOnTrailMove" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trailing_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailing_logs" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "oldSL" DOUBLE PRECISION NOT NULL,
    "newSL" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "atrValue" DOUBLE PRECISION,
    "rMultiple" DOUBLE PRECISION,
    "structureType" TEXT,
    "pullbackPercent" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trailing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signalId" TEXT,
    "tradeId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "telegramSent" BOOLEAN NOT NULL DEFAULT false,
    "telegramSentAt" TIMESTAMP(3),
    "telegramError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "trading_pairs_symbol_key" ON "trading_pairs"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "success_rates_userId_strategy_timeframe_key" ON "success_rates"("userId", "strategy", "timeframe");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentId_key" ON "payments"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_stripePriceId_key" ON "subscription_plans"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "watchlists_userId_tradingPairId_key" ON "watchlists"("userId", "tradingPairId");

-- CreateIndex
CREATE INDEX "price_data_tradingPairId_timestamp_timeframe_idx" ON "price_data"("tradingPairId", "timestamp", "timeframe");

-- CreateIndex
CREATE INDEX "news_articles_publishedAt_idx" ON "news_articles"("publishedAt");

-- CreateIndex
CREATE INDEX "news_articles_category_idx" ON "news_articles"("category");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_watchlistId_key" ON "notification_preferences"("userId", "watchlistId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "backtest_results_strategy_symbol_timeframe_idx" ON "backtest_results"("strategy", "symbol", "timeframe");

-- CreateIndex
CREATE INDEX "backtest_results_createdAt_idx" ON "backtest_results"("createdAt");

-- CreateIndex
CREATE INDEX "pattern_detections_tradingPairId_timeframe_detectedAt_idx" ON "pattern_detections"("tradingPairId", "timeframe", "detectedAt");

-- CreateIndex
CREATE INDEX "pattern_detections_strategy_isValid_idx" ON "pattern_detections"("strategy", "isValid");

-- CreateIndex
CREATE UNIQUE INDEX "strategy_weights_strategy_key" ON "strategy_weights"("strategy");

-- CreateIndex
CREATE INDEX "system_health_component_timestamp_idx" ON "system_health"("component", "timestamp");

-- CreateIndex
CREATE INDEX "system_health_status_timestamp_idx" ON "system_health"("status", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_action_timestamp_idx" ON "audit_logs"("action", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_resource_timestamp_idx" ON "audit_logs"("resource", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_currentPeriodEnd_idx" ON "subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_configs_userId_key" ON "telegram_configs"("userId");

-- CreateIndex
CREATE INDEX "support_resistance_tradingPairId_timeframe_isActive_idx" ON "support_resistance"("tradingPairId", "timeframe", "isActive");

-- CreateIndex
CREATE INDEX "support_resistance_type_strength_idx" ON "support_resistance"("type", "strength");

-- CreateIndex
CREATE INDEX "pivot_points_tradingPairId_timeframe_idx" ON "pivot_points"("tradingPairId", "timeframe");

-- CreateIndex
CREATE UNIQUE INDEX "pivot_points_tradingPairId_timeframe_date_key" ON "pivot_points"("tradingPairId", "timeframe", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedIP_ip_key" ON "BlockedIP"("ip");

-- CreateIndex
CREATE INDEX "SecurityLog_ip_timestamp_idx" ON "SecurityLog"("ip", "timestamp");

-- CreateIndex
CREATE INDEX "contact_messages_status_createdAt_idx" ON "contact_messages"("status", "createdAt");

-- CreateIndex
CREATE INDEX "trading_sessions_userId_isActive_idx" ON "trading_sessions"("userId", "isActive");

-- CreateIndex
CREATE INDEX "trading_sessions_startTime_idx" ON "trading_sessions"("startTime");

-- CreateIndex
CREATE INDEX "performance_metrics_userId_period_idx" ON "performance_metrics"("userId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "performance_metrics_userId_period_startDate_endDate_key" ON "performance_metrics"("userId", "period", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "trades_symbol_idx" ON "trades"("symbol");

-- CreateIndex
CREATE INDEX "ai_providers_name_isActive_idx" ON "ai_providers"("name", "isActive");

-- CreateIndex
CREATE INDEX "security_audit_logs_userId_timestamp_idx" ON "security_audit_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "security_audit_logs_ipAddress_timestamp_idx" ON "security_audit_logs"("ipAddress", "timestamp");

-- CreateIndex
CREATE INDEX "security_audit_logs_action_timestamp_idx" ON "security_audit_logs"("action", "timestamp");

-- CreateIndex
CREATE INDEX "confluence_analyses_symbol_createdAt_idx" ON "confluence_analyses"("symbol", "createdAt");

-- CreateIndex
CREATE INDEX "confluence_analyses_expiresAt_idx" ON "confluence_analyses"("expiresAt");

-- CreateIndex
CREATE INDEX "smc_detections_symbol_timeframe_createdAt_idx" ON "smc_detections"("symbol", "timeframe", "createdAt");

-- CreateIndex
CREATE INDEX "smc_detections_expiresAt_idx" ON "smc_detections"("expiresAt");

-- CreateIndex
CREATE INDEX "news_sentiments_publishedAt_sentiment_idx" ON "news_sentiments"("publishedAt", "sentiment");

-- CreateIndex
CREATE INDEX "news_sentiments_symbolsMentioned_idx" ON "news_sentiments"("symbolsMentioned");

-- CreateIndex
CREATE INDEX "economic_events_date_impact_idx" ON "economic_events"("date", "impact");

-- CreateIndex
CREATE INDEX "economic_events_currency_date_idx" ON "economic_events"("currency", "date");

-- CreateIndex
CREATE UNIQUE INDEX "mt4_connections_apiKey_key" ON "mt4_connections"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "mt4_connections_deviceId_key" ON "mt4_connections"("deviceId");

-- CreateIndex
CREATE INDEX "mt4_connections_userId_idx" ON "mt4_connections"("userId");

-- CreateIndex
CREATE INDEX "mt4_connections_apiKey_idx" ON "mt4_connections"("apiKey");

-- CreateIndex
CREATE INDEX "mt4_connections_deviceId_idx" ON "mt4_connections"("deviceId");

-- CreateIndex
CREATE INDEX "mt4_connections_status_idx" ON "mt4_connections"("status");

-- CreateIndex
CREATE INDEX "mt4_connections_isOnline_idx" ON "mt4_connections"("isOnline");

-- CreateIndex
CREATE UNIQUE INDEX "mt4_trades_ticket_key" ON "mt4_trades"("ticket");

-- CreateIndex
CREATE INDEX "mt4_trades_connectionId_idx" ON "mt4_trades"("connectionId");

-- CreateIndex
CREATE INDEX "mt4_trades_ticket_idx" ON "mt4_trades"("ticket");

-- CreateIndex
CREATE INDEX "mt4_trades_symbol_idx" ON "mt4_trades"("symbol");

-- CreateIndex
CREATE INDEX "mt4_trades_status_idx" ON "mt4_trades"("status");

-- CreateIndex
CREATE INDEX "mt4_trades_openTime_idx" ON "mt4_trades"("openTime");

-- CreateIndex
CREATE INDEX "mt4_errors_connectionId_idx" ON "mt4_errors"("connectionId");

-- CreateIndex
CREATE INDEX "mt4_errors_errorType_idx" ON "mt4_errors"("errorType");

-- CreateIndex
CREATE INDEX "mt4_errors_timestamp_idx" ON "mt4_errors"("timestamp");

-- CreateIndex
CREATE INDEX "trade_instructions_userId_idx" ON "trade_instructions"("userId");

-- CreateIndex
CREATE INDEX "trade_instructions_connectionId_idx" ON "trade_instructions"("connectionId");

-- CreateIndex
CREATE INDEX "trade_instructions_status_idx" ON "trade_instructions"("status");

-- CreateIndex
CREATE INDEX "trade_instructions_createdAt_idx" ON "trade_instructions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "trailing_configs_connectionId_key" ON "trailing_configs"("connectionId");

-- CreateIndex
CREATE INDEX "trailing_configs_connectionId_idx" ON "trailing_configs"("connectionId");

-- CreateIndex
CREATE INDEX "trailing_logs_tradeId_idx" ON "trailing_logs"("tradeId");

-- CreateIndex
CREATE INDEX "trailing_logs_timestamp_idx" ON "trailing_logs"("timestamp");

-- CreateIndex
CREATE INDEX "signal_notifications_userId_idx" ON "signal_notifications"("userId");

-- CreateIndex
CREATE INDEX "signal_notifications_type_idx" ON "signal_notifications"("type");

-- CreateIndex
CREATE INDEX "signal_notifications_createdAt_idx" ON "signal_notifications"("createdAt");

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES "trading_pairs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES "trading_pairs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "success_rates" ADD CONSTRAINT "success_rates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scanner_results" ADD CONSTRAINT "scanner_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scanner_results" ADD CONSTRAINT "scanner_results_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES "trading_pairs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES "trading_pairs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_data" ADD CONSTRAINT "price_data_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES "trading_pairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backtest_results" ADD CONSTRAINT "backtest_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pattern_detections" ADD CONSTRAINT "pattern_detections_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES "trading_pairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_configs" ADD CONSTRAINT "telegram_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_resistance" ADD CONSTRAINT "support_resistance_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES "trading_pairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pivot_points" ADD CONSTRAINT "pivot_points_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES "trading_pairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_sessions" ADD CONSTRAINT "trading_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mt4_connections" ADD CONSTRAINT "mt4_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mt4_trades" ADD CONSTRAINT "mt4_trades_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "mt4_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mt4_errors" ADD CONSTRAINT "mt4_errors_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "mt4_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_instructions" ADD CONSTRAINT "trade_instructions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_instructions" ADD CONSTRAINT "trade_instructions_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "mt4_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trailing_configs" ADD CONSTRAINT "trailing_configs_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "mt4_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trailing_logs" ADD CONSTRAINT "trailing_logs_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "mt4_trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
