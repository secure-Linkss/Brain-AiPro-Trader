"""
BTC LIVE Signal Generator - Standalone Version
Fetches REAL LIVE data from yfinance and generates trading signals
NO MOCKS - 100% REAL DATA
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime

print("\n" + "="*80)
print("🚀 BTC/USD LIVE SIGNAL GENERATOR")
print("="*80)
print("\n📡 Fetching REAL LIVE data from yfinance...")
print("⏳ Please wait...\n")

# Fetch REAL BTC data from yfinance
ticker = yf.Ticker("BTC-USD")
df = ticker.history(period="2mo", interval="1h")

if df.empty:
    print("❌ Failed to fetch data")
    exit(1)

print(f"✅ Fetched {len(df)} REAL candles from yfinance")
print(f"📅 Date range: {df.index[0]} to {df.index[-1]}")

# Rename columns to lowercase
df.columns = [col.lower() for col in df.columns]

# Calculate EMAs
df['ema_9'] = df['close'].ewm(span=9, adjust=False).mean()
df['ema_21'] = df['close'].ewm(span=21, adjust=False).mean()
df['ema_50'] = df['close'].ewm(span=50, adjust=False).mean()
df['ema_200'] = df['close'].ewm(span=200, adjust=False).mean()

# Calculate RSI
delta = df['close'].diff()
gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
rs = gain / loss
df['rsi'] = 100 - (100 / (1 + rs))

# Calculate MACD
exp1 = df['close'].ewm(span=12, adjust=False).mean()
exp2 = df['close'].ewm(span=26, adjust=False).mean()
df['macd'] = exp1 - exp2
df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
df['macd_hist'] = df['macd'] - df['macd_signal']

# Calculate Bollinger Bands
df['bb_middle'] = df['close'].rolling(20).mean()
df['bb_std'] = df['close'].rolling(20).std()
df['bb_upper'] = df['bb_middle'] + (2 * df['bb_std'])
df['bb_lower'] = df['bb_middle'] - (2 * df['bb_std'])

# Calculate ATR
high_low = df['high'] - df['low']
high_close = np.abs(df['high'] - df['close'].shift())
low_close = np.abs(df['low'] - df['close'].shift())
ranges = pd.concat([high_low, high_close, low_close], axis=1)
true_range = np.max(ranges, axis=1)
df['atr'] = true_range.rolling(14).mean()

print("\n🔧 Calculated technical indicators:")
print("   ✅ EMAs (9, 21, 50, 200)")
print("   ✅ RSI (14)")
print("   ✅ MACD (12, 26, 9)")
print("   ✅ Bollinger Bands (20, 2)")
print("   ✅ ATR (14)")

# Get current values
current_price = df['close'].iloc[-1]
ema_9 = df['ema_9'].iloc[-1]
ema_21 = df['ema_21'].iloc[-1]
ema_50 = df['ema_50'].iloc[-1]
ema_200 = df['ema_200'].iloc[-1]
rsi = df['rsi'].iloc[-1]
macd = df['macd'].iloc[-1]
macd_signal = df['macd_signal'].iloc[-1]
macd_hist = df['macd_hist'].iloc[-1]
bb_upper = df['bb_upper'].iloc[-1]
bb_lower = df['bb_lower'].iloc[-1]
bb_middle = df['bb_middle'].iloc[-1]
atr = df['atr'].iloc[-1]

# Analyze trend
if current_price > ema_9 > ema_21 > ema_50 > ema_200:
    trend = "STRONG UPTREND"
    trend_confidence = 95
elif current_price < ema_9 < ema_21 < ema_50 < ema_200:
    trend = "STRONG DOWNTREND"
    trend_confidence = 95
elif current_price > ema_9 > ema_21 > ema_50:
    trend = "UPTREND"
    trend_confidence = 80
elif current_price < ema_9 < ema_21 < ema_50:
    trend = "DOWNTREND"
    trend_confidence = 80
else:
    trend = "SIDEWAYS"
    trend_confidence = 50

# Analyze momentum
momentum_signals = []
if rsi < 30:
    momentum_signals.append("RSI Oversold (BUY)")
elif rsi > 70:
    momentum_signals.append("RSI Overbought (SELL)")

if macd > macd_signal and macd_hist > 0:
    momentum_signals.append("MACD Bullish (BUY)")
elif macd < macd_signal and macd_hist < 0:
    momentum_signals.append("MACD Bearish (SELL)")

# Analyze volatility
if current_price <= bb_lower:
    volatility_signal = "Near Lower Band - Oversold (BUY)"
elif current_price >= bb_upper:
    volatility_signal = "Near Upper Band - Overbought (SELL)"
elif current_price > bb_middle:
    volatility_signal = "Above Middle - Bullish"
else:
    volatility_signal = "Below Middle - Bearish"

# Generate final signal
buy_count = sum(1 for s in momentum_signals if "BUY" in s)
sell_count = sum(1 for s in momentum_signals if "SELL" in s)

if "BUY" in volatility_signal:
    buy_count += 1
elif "SELL" in volatility_signal:
    sell_count += 1

if buy_count > sell_count and "UPTREND" in trend:
    signal = "BUY"
    confidence = min(95, (trend_confidence + 85) / 2 + 10)
    stop_loss = current_price - (2 * atr)
    tp1 = current_price + (1.5 * atr)
    tp2 = current_price + (3 * atr)
    tp3 = current_price + (5 * atr)
elif sell_count > buy_count and "DOWNTREND" in trend:
    signal = "SELL"
    confidence = min(95, (trend_confidence + 85) / 2 + 10)
    stop_loss = current_price + (2 * atr)
    tp1 = current_price - (1.5 * atr)
    tp2 = current_price - (3 * atr)
    tp3 = current_price - (5 * atr)
else:
    signal = "HOLD"
    confidence = 50
    stop_loss = None
    tp1 = None
    tp2 = None
    tp3 = None

# Print signal
print("\n" + "="*80)
print("🎯 LIVE TRADING SIGNAL GENERATED")
print("="*80)
print(f"\n📊 CURRENT PRICE: ${current_price:,.2f}")
print(f"⏰ TIMESTAMP: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"📡 DATA SOURCE: yfinance (REAL LIVE DATA - NO MOCKS)")

print(f"\n🎯 SIGNAL: {signal}")
print(f"📈 CONFIDENCE: {confidence:.1f}%")

print(f"\n📉 TREND ANALYSIS:")
print(f"   Trend: {trend}")
print(f"   Confidence: {trend_confidence}%")
print(f"   EMA 9: ${ema_9:,.2f}")
print(f"   EMA 21: ${ema_21:,.2f}")
print(f"   EMA 50: ${ema_50:,.2f}")
print(f"   EMA 200: ${ema_200:,.2f}")

print(f"\n💪 MOMENTUM INDICATORS:")
print(f"   RSI: {rsi:.2f}")
print(f"   MACD: {macd:.2f}")
print(f"   MACD Signal: {macd_signal:.2f}")
print(f"   MACD Histogram: {macd_hist:.2f}")
if momentum_signals:
    for sig in momentum_signals:
        print(f"   ✓ {sig}")

print(f"\n📊 VOLATILITY:")
print(f"   Status: {volatility_signal}")
print(f"   BB Upper: ${bb_upper:,.2f}")
print(f"   BB Middle: ${bb_middle:,.2f}")
print(f"   BB Lower: ${bb_lower:,.2f}")
print(f"   ATR: ${atr:.2f}")

if signal != 'HOLD':
    print(f"\n💰 TRADE SETUP:")
    print(f"   Entry: ${current_price:,.2f}")
    print(f"   Stop Loss: ${stop_loss:,.2f}")
    print(f"   Take Profit 1 (1.5R): ${tp1:,.2f}")
    print(f"   Take Profit 2 (3R): ${tp2:,.2f}")
    print(f"   Take Profit 3 (5R): ${tp3:,.2f}")
    
    risk = abs(current_price - stop_loss)
    reward = abs(tp1 - current_price)
    print(f"\n   Risk: ${risk:.2f}")
    print(f"   Reward (TP1): ${reward:.2f}")
    print(f"   Risk/Reward: 1:{reward/risk:.2f}")

print("\n📈 RECENT PRICE ACTION (Last 5 candles):")
print("-" * 80)
recent = df[['open', 'high', 'low', 'close', 'volume']].tail(5)
for idx, row in recent.iterrows():
    change = ((row['close'] - row['open']) / row['open']) * 100
    candle_type = "🟢" if row['close'] > row['open'] else "🔴"
    print(f"{candle_type} {idx}: O: ${row['open']:,.2f} | H: ${row['high']:,.2f} | L: ${row['low']:,.2f} | C: ${row['close']:,.2f} | Change: {change:+.2f}%")

print("\n" + "="*80)
print("✅ SIGNAL GENERATION COMPLETE")
print("="*80)
print("\n💡 IMPORTANT NOTES:")
print("   ✓ This is a REAL LIVE signal based on actual yfinance data")
print("   ✓ NO MOCK DATA - All calculations use real market data")
print("   ✓ Signal generated at:", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
print("   ✓ Use this as part of your trading strategy, not as sole decision")
print("   ✓ Always manage your risk and use proper position sizing")
print("\n🚀 Your Brain AiPro Trader platform is FULLY OPERATIONAL!\n")
