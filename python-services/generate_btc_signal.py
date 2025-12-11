"""
BTC Signal Generator - Live Demo
Fetches real BTC data from yfinance and generates trading signals
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def calculate_indicators(df):
    """Calculate technical indicators"""
    # EMAs
    df['ema_9'] = df['close'].ewm(span=9, adjust=False).mean()
    df['ema_21'] = df['close'].ewm(span=21, adjust=False).mean()
    df['ema_50'] = df['close'].ewm(span=50, adjust=False).mean()
    df['ema_200'] = df['close'].ewm(span=200, adjust=False).mean()
    
    # RSI
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    
    # MACD
    exp1 = df['close'].ewm(span=12, adjust=False).mean()
    exp2 = df['close'].ewm(span=26, adjust=False).mean()
    df['macd'] = exp1 - exp2
    df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
    df['macd_hist'] = df['macd'] - df['macd_signal']
    
    # Bollinger Bands
    df['bb_middle'] = df['close'].rolling(20).mean()
    df['bb_std'] = df['close'].rolling(20).std()
    df['bb_upper'] = df['bb_middle'] + (2 * df['bb_std'])
    df['bb_lower'] = df['bb_middle'] - (2 * df['bb_std'])
    
    # ATR
    high_low = df['high'] - df['low']
    high_close = np.abs(df['high'] - df['close'].shift())
    low_close = np.abs(df['low'] - df['close'].shift())
    ranges = pd.concat([high_low, high_close, low_close], axis=1)
    true_range = np.max(ranges, axis=1)
    df['atr'] = true_range.rolling(14).mean()
    
    return df

def analyze_trend(df):
    """Analyze trend using EMAs"""
    current_price = df['close'].iloc[-1]
    ema_9 = df['ema_9'].iloc[-1]
    ema_21 = df['ema_21'].iloc[-1]
    ema_50 = df['ema_50'].iloc[-1]
    ema_200 = df['ema_200'].iloc[-1]
    
    # Perfect bullish alignment
    if current_price > ema_9 > ema_21 > ema_50 > ema_200:
        return "STRONG UPTREND", 95
    # Perfect bearish alignment
    elif current_price < ema_9 < ema_21 < ema_50 < ema_200:
        return "STRONG DOWNTREND", 95
    # Partial bullish
    elif current_price > ema_9 > ema_21 > ema_50:
        return "UPTREND", 80
    # Partial bearish
    elif current_price < ema_9 < ema_21 < ema_50:
        return "DOWNTREND", 80
    else:
        return "SIDEWAYS", 50

def analyze_momentum(df):
    """Analyze momentum using RSI and MACD"""
    rsi = df['rsi'].iloc[-1]
    macd = df['macd'].iloc[-1]
    macd_signal = df['macd_signal'].iloc[-1]
    macd_hist = df['macd_hist'].iloc[-1]
    
    signals = []
    
    # RSI signals
    if rsi < 30:
        signals.append(("RSI Oversold", "BUY", 85))
    elif rsi > 70:
        signals.append(("RSI Overbought", "SELL", 85))
    
    # MACD signals
    if macd > macd_signal and macd_hist > 0:
        signals.append(("MACD Bullish", "BUY", 80))
    elif macd < macd_signal and macd_hist < 0:
        signals.append(("MACD Bearish", "SELL", 80))
    
    return signals, rsi

def analyze_volatility(df):
    """Analyze volatility using Bollinger Bands"""
    current_price = df['close'].iloc[-1]
    bb_upper = df['bb_upper'].iloc[-1]
    bb_lower = df['bb_lower'].iloc[-1]
    bb_middle = df['bb_middle'].iloc[-1]
    
    # Price position
    if current_price <= bb_lower:
        return "Near Lower Band (Oversold)", "BUY", 85
    elif current_price >= bb_upper:
        return "Near Upper Band (Overbought)", "SELL", 85
    elif current_price > bb_middle:
        return "Above Middle (Bullish)", "HOLD", 60
    else:
        return "Below Middle (Bearish)", "HOLD", 60

def generate_signal(df):
    """Generate comprehensive trading signal"""
    current_price = df['close'].iloc[-1]
    atr = df['atr'].iloc[-1]
    
    # Analyze all aspects
    trend, trend_confidence = analyze_trend(df)
    momentum_signals, rsi = analyze_momentum(df)
    volatility_status, volatility_signal, volatility_confidence = analyze_volatility(df)
    
    # Determine overall signal
    buy_signals = sum(1 for _, signal, _ in momentum_signals if signal == "BUY")
    sell_signals = sum(1 for _, signal, _ in momentum_signals if signal == "SELL")
    
    if volatility_signal == "BUY":
        buy_signals += 1
    elif volatility_signal == "SELL":
        sell_signals += 1
    
    # Generate final signal
    if buy_signals > sell_signals and "UPTREND" in trend:
        signal_type = "BUY"
        confidence = min(95, (trend_confidence + volatility_confidence) / 2 + 10)
        stop_loss = current_price - (2 * atr)
        take_profit_1 = current_price + (1.5 * atr)
        take_profit_2 = current_price + (3 * atr)
        take_profit_3 = current_price + (5 * atr)
    elif sell_signals > buy_signals and "DOWNTREND" in trend:
        signal_type = "SELL"
        confidence = min(95, (trend_confidence + volatility_confidence) / 2 + 10)
        stop_loss = current_price + (2 * atr)
        take_profit_1 = current_price - (1.5 * atr)
        take_profit_2 = current_price - (3 * atr)
        take_profit_3 = current_price - (5 * atr)
    else:
        signal_type = "HOLD"
        confidence = 50
        stop_loss = None
        take_profit_1 = None
        take_profit_2 = None
        take_profit_3 = None
    
    return {
        'signal': signal_type,
        'confidence': confidence,
        'current_price': current_price,
        'trend': trend,
        'trend_confidence': trend_confidence,
        'rsi': rsi,
        'volatility': volatility_status,
        'momentum_signals': momentum_signals,
        'stop_loss': stop_loss,
        'take_profit_1': take_profit_1,
        'take_profit_2': take_profit_2,
        'take_profit_3': take_profit_3,
        'atr': atr,
        'timestamp': datetime.now()
    }

def print_signal(signal):
    """Print signal in a nice format"""
    print("\n" + "="*80)
    print("🚀 BTC/USD TRADING SIGNAL - LIVE ANALYSIS")
    print("="*80)
    print(f"\n📊 CURRENT PRICE: ${signal['current_price']:,.2f}")
    print(f"⏰ TIMESTAMP: {signal['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}")
    
    print(f"\n🎯 SIGNAL: {signal['signal']}")
    print(f"📈 CONFIDENCE: {signal['confidence']:.1f}%")
    
    print(f"\n📉 TREND ANALYSIS:")
    print(f"   Trend: {signal['trend']}")
    print(f"   Confidence: {signal['trend_confidence']}%")
    
    print(f"\n💪 MOMENTUM INDICATORS:")
    print(f"   RSI: {signal['rsi']:.2f}")
    for indicator, sig, conf in signal['momentum_signals']:
        print(f"   {indicator}: {sig} ({conf}% confidence)")
    
    print(f"\n📊 VOLATILITY:")
    print(f"   Status: {signal['volatility']}")
    print(f"   ATR: ${signal['atr']:.2f}")
    
    if signal['signal'] != 'HOLD':
        print(f"\n💰 TRADE SETUP:")
        print(f"   Entry: ${signal['current_price']:,.2f}")
        print(f"   Stop Loss: ${signal['stop_loss']:,.2f}")
        print(f"   Take Profit 1 (1.5R): ${signal['take_profit_1']:,.2f}")
        print(f"   Take Profit 2 (3R): ${signal['take_profit_2']:,.2f}")
        print(f"   Take Profit 3 (5R): ${signal['take_profit_3']:,.2f}")
        
        risk = abs(signal['current_price'] - signal['stop_loss'])
        reward_1 = abs(signal['take_profit_1'] - signal['current_price'])
        print(f"\n   Risk: ${risk:.2f}")
        print(f"   Reward (TP1): ${reward_1:.2f}")
        print(f"   Risk/Reward: 1:{reward_1/risk:.2f}")
    
    print("\n" + "="*80)

def main():
    """Main function to generate BTC signal"""
    print("\n🚀 Starting BTC Signal Generator...")
    print("📡 Fetching live data from yfinance...\n")
    
    # Initialize fetcher
    fetcher = YFinanceDataFetcher()
    
    # Fetch BTC data for 1 hour timeframe
    print("⏳ Fetching BTC/USD 1hr data...")
    df = fetcher.fetch_symbol_timeframe('BTCUSD', '1hr')
    
    if df is None or df.empty:
        print("❌ Failed to fetch BTC data")
        return
    
    print(f"✅ Fetched {len(df)} candles")
    print(f"📅 Date range: {df.index[0]} to {df.index[-1]}")
    
    # Calculate indicators
    print("\n🔧 Calculating technical indicators...")
    df = calculate_indicators(df)
    
    # Generate signal
    print("🎯 Generating trading signal...")
    signal = generate_signal(df)
    
    # Print signal
    print_signal(signal)
    
    # Show recent price action
    print("\n📈 RECENT PRICE ACTION (Last 5 candles):")
    print("-" * 80)
    recent = df[['open', 'high', 'low', 'close', 'volume']].tail(5)
    for idx, row in recent.iterrows():
        print(f"{idx}: O: ${row['open']:,.2f} | H: ${row['high']:,.2f} | L: ${row['low']:,.2f} | C: ${row['close']:,.2f}")
    
    print("\n✅ Signal generation complete!")
    print("\n💡 TIP: This is a LIVE signal based on real yfinance data (NO MOCKS)")
    print("💡 Use this signal as part of your trading strategy, not as sole decision maker")
    print("💡 Always manage your risk and never risk more than you can afford to lose\n")

if __name__ == "__main__":
    main()
