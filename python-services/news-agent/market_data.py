import yfinance as yf
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class MarketDataFetcher:
    """
    Fetches real-time market data using Yahoo Finance (Public/Free).
    Acts as the 'Eyes' for the Local LLM to see live prices.
    """
    
    def get_live_data(self, symbol: str) -> Dict[str, str]:
        """
        Get live price, change, and volume for a symbol.
        Returns a formatted string context for the LLM and raw data.
        """
        try:
            formatted_symbol = self._format_symbol(symbol)
            logger.info(f"Fetching live data for {formatted_symbol}...")
            
            ticker = yf.Ticker(formatted_symbol)
            # fast_info is faster than .info
            info = ticker.fast_info
            
            # Using fast_info (requires yfinance >= 0.2.0)
            price = info.last_price
            prev_close = info.previous_close
            
            if price is None:
                # Fallback to history for some symbols
                hist = ticker.history(period="1d")
                if not hist.empty:
                    price = hist['Close'].iloc[-1]
                    prev_close = hist['Open'].iloc[-1] # Approx for same day
                else:
                    return {"context": f"Live data unavailable for {symbol}."}

            change = price - prev_close
            change_pct = (change / prev_close) * 100
            
            direction = "UP" if change >= 0 else "DOWN"
            
            context = (
                f"LIVE MARKET DATA ({symbol}): "
                f"Price: {price:.5f}, "
                f"24h Change: {change_pct:.2f}% ({direction})."
            )
            
            return {
                "price": price,
                "change_pct": change_pct,
                "context": context
            }
            
        except Exception as e:
            logger.warning(f"Failed to fetch market data for {symbol}: {e}")
            return {"context": f"Live data unavailable for {symbol}."}

    def _format_symbol(self, symbol: str) -> str:
        """Map common symbols to YFinance format"""
        s = symbol.upper()
        
        # Crypto
        if s in ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE']:
            return f"{s}-USD"
        if s.endswith('USDT'):
            return f"{s.replace('USDT', '')}-USD"
            
        # Forex (simplified)
        if len(s) == 6 and s.isalpha() and s not in ['NVDA', 'GOOG', 'AMZN', 'TSLA', 'MSFT', 'AAPL']:
             return f"{s}=X" # e.g. EURUSD=X
             
        return s

market_fetcher = MarketDataFetcher()
