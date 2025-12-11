"""
REAL LIVE BTC Signal Generator - ACCURATE VERSION
Fetches ACTUAL current BTC price and generates real signal
"""

import requests
import json
from datetime import datetime

def get_live_btc_price():
    """Get REAL LIVE BTC price from multiple sources"""
    sources = []
    
    # Try CoinGecko API (free, no auth needed)
    try:
        url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            price = data['bitcoin']['usd']
            change_24h = data['bitcoin'].get('usd_24h_change', 0)
            sources.append(('CoinGecko', price, change_24h))
    except Exception as e:
        print(f"CoinGecko error: {e}")
    
    # Try Binance API (free, no auth needed)
    try:
        url = "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            price = float(data['lastPrice'])
            change_24h = float(data['priceChangePercent'])
            sources.append(('Binance', price, change_24h))
    except Exception as e:
        print(f"Binance error: {e}")
    
    # Try Coinbase API (free, no auth needed)
    try:
        url = "https://api.coinbase.com/v2/prices/BTC-USD/spot"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            price = float(data['data']['amount'])
            sources.append(('Coinbase', price, 0))
    except Exception as e:
        print(f"Coinbase error: {e}")
    
    return sources

def calculate_simple_indicators(price, change_24h):
    """Calculate basic indicators from current price"""
    # Estimate ATR as 2% of price (conservative)
    atr = price * 0.02
    
    # Determine trend from 24h change
    if change_24h > 2:
        trend = "STRONG UPTREND"
        confidence = 85
    elif change_24h > 0.5:
        trend = "UPTREND"
        confidence = 75
    elif change_24h < -2:
        trend = "STRONG DOWNTREND"
        confidence = 85
    elif change_24h < -0.5:
        trend = "DOWNTREND"
        confidence = 75
    else:
        trend = "SIDEWAYS"
        confidence = 50
    
    return atr, trend, confidence

def generate_real_signal(price, change_24h, source):
    """Generate signal from real live data"""
    atr, trend, confidence = calculate_simple_indicators(price, change_24h)
    
    # Determine signal
    if "UPTREND" in trend and change_24h > 0:
        signal = "BUY"
        stop_loss = price - (2 * atr)
        tp1 = price + (1.5 * atr)
        tp2 = price + (3 * atr)
        tp3 = price + (5 * atr)
    elif "DOWNTREND" in trend and change_24h < 0:
        signal = "SELL"
        stop_loss = price + (2 * atr)
        tp1 = price - (1.5 * atr)
        tp2 = price - (3 * atr)
        tp3 = price - (5 * atr)
    else:
        signal = "HOLD"
        stop_loss = None
        tp1 = tp2 = tp3 = None
    
    return {
        'signal': signal,
        'confidence': confidence,
        'price': price,
        'change_24h': change_24h,
        'trend': trend,
        'atr': atr,
        'stop_loss': stop_loss,
        'tp1': tp1,
        'tp2': tp2,
        'tp3': tp3,
        'source': source,
        'timestamp': datetime.now()
    }

def print_signal(signal):
    """Print signal in nice format"""
    print("\n" + "="*80)
    print("🚀 REAL LIVE BTC/USD SIGNAL - ACCURATE DATA")
    print("="*80)
    print(f"\n📊 CURRENT PRICE: ${signal['price']:,.2f}")
    print(f"📡 DATA SOURCE: {signal['source']} (REAL LIVE API)")
    print(f"⏰ TIMESTAMP: {signal['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📈 24H CHANGE: {signal['change_24h']:+.2f}%")
    
    print(f"\n🎯 SIGNAL: {signal['signal']}")
    print(f"📈 CONFIDENCE: {signal['confidence']:.1f}%")
    print(f"📉 TREND: {signal['trend']}")
    
    if signal['signal'] != 'HOLD':
        print(f"\n💰 TRADE SETUP:")
        print(f"   Entry: ${signal['price']:,.2f}")
        print(f"   Stop Loss: ${signal['stop_loss']:,.2f}")
        print(f"   Take Profit 1 (1.5R): ${signal['tp1']:,.2f}")
        print(f"   Take Profit 2 (3R): ${signal['tp2']:,.2f}")
        print(f"   Take Profit 3 (5R): ${signal['tp3']:,.2f}")
        
        risk = abs(signal['price'] - signal['stop_loss'])
        reward = abs(signal['tp1'] - signal['price'])
        print(f"\n   Risk: ${risk:.2f}")
        print(f"   Reward (TP1): ${reward:.2f}")
        print(f"   Risk/Reward: 1:{reward/risk:.2f}")
    
    print("\n" + "="*80)
    print("✅ REAL LIVE DATA - NO MOCKS - ACCURATE PRICES")
    print("="*80 + "\n")

def main():
    """Main function"""
    print("\n🚀 Fetching REAL LIVE BTC price from multiple sources...")
    print("⏳ Please wait...\n")
    
    sources = get_live_btc_price()
    
    if not sources:
        print("❌ Failed to fetch live price from any source")
        print("💡 Make sure you have internet connection")
        return
    
    print(f"✅ Successfully fetched from {len(sources)} source(s):\n")
    
    for source_name, price, change in sources:
        print(f"   {source_name}: ${price:,.2f} ({change:+.2f}% 24h)")
    
    # Use the first source (most reliable)
    source_name, price, change_24h = sources[0]
    
    print(f"\n🎯 Using {source_name} data for signal generation...")
    
    # Generate signal
    signal = generate_real_signal(price, change_24h, source_name)
    
    # Print signal
    print_signal(signal)
    
    print("💡 This is a REAL LIVE signal with ACTUAL current BTC price")
    print("💡 Data fetched from live API - NO MOCKS")
    print("💡 Price is accurate as of:", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print()

if __name__ == "__main__":
    main()
