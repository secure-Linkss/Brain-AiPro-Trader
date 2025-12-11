import feedparser
import logging
from typing import List, Dict
from datetime import datetime
import time

logger = logging.getLogger(__name__)

class NewsScraper:
    """
    Real-time news scraper using RSS feeds.
    Serves as a reliable fallback when NewsAPI key is missing or limit reached.
    """
    
    FEEDS = {
        'crypto': [
            'https://cointelegraph.com/rss',
            'https://cryptopotato.com/feed/',
            'https://news.bitcoin.com/feed/',
            'https://www.coindesk.com/arc/outboundfeeds/rss/'
        ],
        'forex': [
            'https://www.investing.com/rss/news_1.rss',
            'https://www.fxstreet.com/rss/news'
        ],
        'stocks': [
            'https://finance.yahoo.com/news/rssindex',
            'https://www.investing.com/rss/news_25.rss'
        ]
    }

    def fetch_latest_news(self, symbol: str, limit: int = 15) -> List[Dict]:
        """Fetch real news for the symbol from RSS feeds"""
        articles = []
        
        # Determine category (simple heuristic)
        category = 'stocks'
        if symbol.upper() in ['BTC', 'ETH', 'SOL', 'XRP', 'bitcoin', 'ethereum']:
            category = 'crypto'
        elif symbol.upper() in ['EURUSD', 'GBPUSD', 'USDJPY', 'forex']:
            category = 'forex'
            
        logger.info(f"Scraping {category} feeds for {symbol}...")
        
        feeds = self.FEEDS.get(category, self.FEEDS['stocks'])
        
        for feed_url in feeds:
            try:
                feed = feedparser.parse(feed_url)
                for entry in feed.entries[:10]: # Check top 10 per feed
                    # Filter by symbol if specific symbol requested
                    text_content = (entry.title + " " + entry.get('description', '')).lower()
                    
                    if symbol.lower() in text_content or symbol == "general":
                        articles.append({
                            "title": entry.title,
                            "description": self._clean_html(entry.get('description', '')),
                            "url": entry.link,
                            "source": {"name": feed.feed.get('title', 'Unknown Source')},
                            "publishedAt": self._parse_date(entry),
                        })
                        
                    if len(articles) >= limit:
                        return articles
                        
            except Exception as e:
                logger.warning(f"Failed to parse feed {feed_url}: {e}")
                continue
                
        return articles

    def _clean_html(self, raw_html: str) -> str:
        from bs4 import BeautifulSoup
        try:
            return BeautifulSoup(raw_html, "html.parser").get_text()[:300] + "..."
        except:
            return raw_html[:300]

    def _parse_date(self, entry) -> str:
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            # Convert struct_time to ISO format
            dt = datetime.fromtimestamp(time.mktime(entry.published_parsed))
            return dt.isoformat()
        return datetime.now().isoformat()

news_scraper = NewsScraper()
