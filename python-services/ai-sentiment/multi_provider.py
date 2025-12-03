"""
Multi-Provider AI Sentiment Analysis Service
Supports: Gemini, ChatGPT, Claude, OpenRouter + Fallbacks (VADER, TextBlob, Rule-based)
"""

import asyncio
import aiohttp
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json
import hashlib
from collections import defaultdict
import re

# Fallback sentiment analyzers (no API required)
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
except:
    VADER_AVAILABLE = False

try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except:
    TEXTBLOB_AVAILABLE = False


class AIProvider(Enum):
    """Supported AI providers"""
    GEMINI = "gemini"
    OPENAI = "openai"
    CLAUDE = "claude"
    OPENROUTER = "openrouter"
    VADER = "vader"  # Fallback
    TEXTBLOB = "textblob"  # Fallback
    RULE_BASED = "rule_based"  # Ultimate fallback


class SentimentScore(Enum):
    """Sentiment classification"""
    VERY_NEGATIVE = "very_negative"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    POSITIVE = "positive"
    VERY_POSITIVE = "very_positive"


@dataclass
class NewsArticle:
    """News article data structure"""
    title: str
    content: str
    source: str
    url: Optional[str]
    published_at: datetime
    symbols_mentioned: List[str] = field(default_factory=list)


@dataclass
class SentimentResult:
    """Sentiment analysis result"""
    article: NewsArticle
    sentiment: SentimentScore
    confidence: float  # 0-1
    numeric_score: float  # -1 to +1
    provider: AIProvider
    processing_time_ms: float
    keywords_extracted: List[str]
    entities_mentioned: List[str]
    timestamp: datetime


class RateLimiter:
    """
    Advanced rate limiter with exponential backoff
    Tracks requests per provider and implements cooling periods
    """
    
    def __init__(self):
        self.request_counts = defaultdict(int)
        self.last_request_time = defaultdict(lambda: datetime.min)
        self.cooldown_until = defaultdict(lambda: datetime.min)
        
        # Rate limits per provider (requests per minute)
        self.limits = {
            AIProvider.GEMINI: 60,
            AIProvider.OPENAI: 60,
            AIProvider.CLAUDE: 50,
            AIProvider.OPENROUTER: 100,
        }
        
    async def wait_if_needed(self, provider: AIProvider):
        """Wait if rate limit exceeded or in cooldown"""
        now = datetime.now()
        
        # Check if in cooldown
        if now < self.cooldown_until[provider]:
            wait_seconds = (self.cooldown_until[provider] - now).total_seconds()
            await asyncio.sleep(wait_seconds)
            
        # Check rate limit
        if provider in self.limits:
            time_since_last = (now - self.last_request_time[provider]).total_seconds()
            if time_since_last < 60:  # Within 1 minute window
                if self.request_counts[provider] >= self.limits[provider]:
                    # Wait until minute resets
                    await asyncio.sleep(60 - time_since_last)
                    self.request_counts[provider] = 0
            else:
                # Reset counter for new minute
                self.request_counts[provider] = 0
                
        self.request_counts[provider] += 1
        self.last_request_time[provider] = now
        
    def trigger_cooldown(self, provider: AIProvider, seconds: int = 300):
        """Trigger cooldown period for a provider (default 5 min)"""
        self.cooldown_until[provider] = datetime.now() + timedelta(seconds=seconds)


class MultiAIProvider:
    """
    Manages multiple AI providers with automatic rotation and fallback
    Implements intelligent provider selection and error recovery
    """
    
    def __init__(self, api_keys: Dict[str, str]):
        """
        Initialize multi-AI provider
        
        Args:
            api_keys: Dictionary of {provider_name: api_key}
                     e.g., {"gemini": "key1", "openai": "key2", ...}
        """
        self.api_keys = api_keys
        self.rate_limiter = RateLimiter()
        self.provider_failures = defaultdict(int)
        self.last_successful_provider = None
        
        # Initialize fallback analyzers
        self.vader = SentimentIntensityAnalyzer() if VADER_AVAILABLE else None
        
        # Provider endpoints
        self.endpoints = {
            AIProvider.GEMINI: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
            AIProvider.OPENAI: "https://api.openai.com/v1/chat/completions",
            AIProvider.CLAUDE: "https://api.anthropic.com/v1/messages",
            AIProvider.OPENROUTER: "https://openrouter.ai/api/v1/chat/completions",
        }
        
    async def analyze_sentiment(
        self,
        text: str,
        preferred_provider: Optional[AIProvider] = None
    ) -> SentimentResult:
        """
        Analyze sentiment with automatic provider rotation
        
        Args:
            text: Text to analyze (news article, headline, etc.)
            preferred_provider: Try this provider first
            
        Returns:
            SentimentResult with analysis
        """
        start_time = datetime.now()
        
        # Determine provider order
        providers_to_try = self._get_provider_order(preferred_provider)
        
        last_error = None
        for provider in providers_to_try:
            try:
                result = await self._analyze_with_provider(provider, text)
                if result:
                    # Success! Reset failure count
                    self.provider_failures[provider] = 0
                    self.last_successful_provider = provider
                    
                    processing_time = (datetime.now() - start_time).total_seconds() * 1000
                    result.processing_time_ms = processing_time
                    
                    return result
            except Exception as e:
                last_error = e
                self.provider_failures[provider] += 1
                
                # Trigger cooldown if repeated failures
                if self.provider_failures[provider] >= 3:
                    self.rate_limiter.trigger_cooldown(provider, seconds=600)  # 10 min
                    
                continue
                
        # All providers failed, use ultimate fallback
        return self._fallback_analysis(text, str(last_error))
    
    def _get_provider_order(
        self,
        preferred: Optional[AIProvider] = None
    ) -> List[AIProvider]:
        """
        Determine order of providers to try
        Prioritizes: preferred > last successful > least failures > fallbacks
        """
        order = []
        
        # Start with preferred
        if preferred and preferred in self.api_keys:
            order.append(preferred)
            
        # Add last successful
        if self.last_successful_provider and self.last_successful_provider not in order:
            order.append(self.last_successful_provider)
            
        # Add remaining API providers by failure count
        api_providers = [p for p in AIProvider if p.value in self.api_keys and p not in order]
        api_providers.sort(key=lambda p: self.provider_failures[p])
        order.extend(api_providers)
        
        # Add fallbacks
        if VADER_AVAILABLE:
            order.append(AIProvider.VADER)
        if TEXTBLOB_AVAILABLE:
            order.append(AIProvider.TEXTBLOB)
        order.append(AIProvider.RULE_BASED)  # Always available
        
        return order
    
    async def _analyze_with_provider(
        self,
        provider: AIProvider,
        text: str
    ) -> Optional[SentimentResult]:
        """Analyze with specific provider"""
        
        # Handle fallback providers
        if provider == AIProvider.VADER:
            return self._analyze_vader(text)
        elif provider == AIProvider.TEXTBLOB:
            return self._analyze_textblob(text)
        elif provider == AIProvider.RULE_BASED:
            return self._analyze_rule_based(text)
            
        # Handle API providers
        await self.rate_limiter.wait_if_needed(provider)
        
        if provider == AIProvider.GEMINI:
            return await self._analyze_gemini(text)
        elif provider == AIProvider.OPENAI:
            return await self._analyze_openai(text)
        elif provider == AIProvider.CLAUDE:
            return await self._analyze_claude(text)
        elif provider == AIProvider.OPENROUTER:
            return await self._analyze_openrouter(text)
            
        return None
    
    async def _analyze_gemini(self, text: str) -> Optional[SentimentResult]:
        """Analyze using Gemini Flash 2.0"""
        api_key = self.api_keys.get("gemini")
        if not api_key:
            return None
            
        url = f"{self.endpoints[AIProvider.GEMINI]}?key={api_key}"
        
        prompt = f"""Analyze the sentiment of this financial news text. Respond with ONLY a JSON object (no markdown):
{{
    "sentiment": "very_negative|negative|neutral|positive|very_positive",
    "score": -1.0 to 1.0,
    "confidence": 0.0 to 1.0,
    "keywords": ["keyword1", "keyword2"],
    "entities": ["entity1", "entity2"]
}}

Text: {text[:1000]}"""
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1}
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    result_text = data['candidates'][0]['content']['parts'][0]['text']
                    return self._parse_ai_response(result_text, AIProvider.GEMINI, text)
                elif response.status == 429:
                    raise Exception("Rate limit exceeded")
                else:
                    raise Exception(f"API error: {response.status}")
    
    async def _analyze_openai(self, text: str) -> Optional[SentimentResult]:
        """Analyze using ChatGPT"""
        api_key = self.api_keys.get("openai")
        if not api_key:
            return None
            
        url = self.endpoints[AIProvider.OPENAI]
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""Analyze the sentiment of this financial news. Respond with ONLY valid JSON:
{{"sentiment": "very_negative|negative|neutral|positive|very_positive", "score": -1.0 to 1.0, "confidence": 0.0 to 1.0, "keywords": [], "entities": []}}

Text: {text[:1000]}"""
        
        payload = {
            "model": "gpt-4-turbo-preview",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    result_text = data['choices'][0]['message']['content']
                    return self._parse_ai_response(result_text, AIProvider.OPENAI, text)
                elif response.status == 429:
                    raise Exception("Rate limit exceeded")
                else:
                    raise Exception(f"API error: {response.status}")
    
    async def _analyze_claude(self, text: str) -> Optional[SentimentResult]:
        """Analyze using Claude"""
        api_key = self.api_keys.get("claude")
        if not api_key:
            return None
            
        url = self.endpoints[AIProvider.CLAUDE]
        
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        
        prompt = f"""Analyze sentiment. JSON only: {{"sentiment": "very_negative|negative|neutral|positive|very_positive", "score": -1 to 1, "confidence": 0 to 1, "keywords": [], "entities": []}}

Text: {text[:1000]}"""
        
        payload = {
            "model": "claude-3-sonnet-20240229",
            "max_tokens": 256,
            "messages": [{"role": "user", "content": prompt}]
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    result_text = data['content'][0]['text']
                    return self._parse_ai_response(result_text, AIProvider.CLAUDE, text)
                elif response.status == 429:
                    raise Exception("Rate limit exceeded")
                else:
                    raise Exception(f"API error: {response.status}")
    
    async def _analyze_openrouter(self, text: str) -> Optional[SentimentResult]:
        """Analyze using OpenRouter (access to multiple models)"""
        api_key = self.api_keys.get("openrouter")
        if not api_key:
            return None
            
        url = self.endpoints[AIProvider.OPENROUTER]
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""Sentiment analysis JSON: {{"sentiment": "very_negative|negative|neutral|positive|very_positive", "score": -1 to 1, "confidence": 0 to 1, "keywords": [], "entities": []}}

{text[:1000]}"""
        
        payload = {
            "model": "anthropic/claude-3-haiku",  # Fastest, cheapest
            "messages": [{"role": "user", "content": prompt}]
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    result_text = data['choices'][0]['message']['content']
                    return self._parse_ai_response(result_text, AIProvider.OPENROUTER, text)
                elif response.status == 429:
                    raise Exception("Rate limit exceeded")
                else:
                    raise Exception(f"API error: {response.status}")
    
    def _parse_ai_response(
        self,
        response: str,
        provider: AIProvider,
        original_text: str
    ) -> SentimentResult:
        """Parse AI JSON response into SentimentResult"""
        try:
            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'\{[^}]+\}', response, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
            else:
                parsed = json.loads(response)
                
            sentiment_str = parsed.get('sentiment', 'neutral')
            score = float(parsed.get('score', 0))
            confidence = float(parsed.get('confidence', 0.5))
            keywords = parsed.get('keywords', [])
            entities = parsed.get('entities', [])
            
            # Map to enum
            sentiment_map = {
                'very_negative': SentimentScore.VERY_NEGATIVE,
                'negative': SentimentScore.NEGATIVE,
                'neutral': SentimentScore.NEUTRAL,
                'positive': SentimentScore.POSITIVE,
                'very_positive': SentimentScore.VERY_POSITIVE,
            }
            sentiment = sentiment_map.get(sentiment_str, SentimentScore.NEUTRAL)
            
            return SentimentResult(
                article=NewsArticle(
                    title="",
                    content=original_text,
                    source="",
                    url=None,
                    published_at=datetime.now()
                ),
                sentiment=sentiment,
                confidence=confidence,
                numeric_score=score,
                provider=provider,
                processing_time_ms=0,  # Set by caller
                keywords_extracted=keywords,
                entities_mentioned=entities,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            # Fallback parsing failed
            raise Exception(f"Failed to parse AI response: {str(e)}")
    
    def _analyze_vader(self, text: str) -> SentimentResult:
        """Fallback: VADER sentiment analysis"""
        if not self.vader:
            raise Exception("VADER not available")
            
        scores = self.vader.polarity_scores(text)
        compound = scores['compound']
        
        # Map compound score to sentiment
        if compound >= 0.5:
            sentiment = SentimentScore.VERY_POSITIVE
        elif compound >= 0.1:
            sentiment = SentimentScore.POSITIVE
        elif compound <= -0.5:
            sentiment = SentimentScore.VERY_NEGATIVE
        elif compound <= -0.1:
            sentiment = SentimentScore.NEGATIVE
        else:
            sentiment = SentimentScore.NEUTRAL
            
        # Extract simple keywords
        words = text.lower().split()
        keywords = [w for w in words if len(w) > 6][:5]
        
        return SentimentResult(
            article=NewsArticle(
                title="",
                content=text,
                source="vader",
                url=None,
                published_at=datetime.now()
            ),
            sentiment=sentiment,
            confidence=abs(compound),
            numeric_score=compound,
            provider=AIProvider.VADER,
            processing_time_ms=0,
            keywords_extracted=keywords,
            entities_mentioned=[],
            timestamp=datetime.now()
        )
    
    def _analyze_textblob(self, text: str) -> SentimentResult:
        """Fallback: TextBlob sentiment analysis"""
        if not TEXTBLOB_AVAILABLE:
            raise Exception("TextBlob not available")
            
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity  # -1 to 1
        subjectivity = blob.sentiment.subjectivity  # 0 to 1
        
        # Map polarity to sentiment
        if polarity >= 0.5:
            sentiment = SentimentScore.VERY_POSITIVE
        elif polarity >= 0.1:
            sentiment = SentimentScore.POSITIVE
        elif polarity <= -0.5:
            sentiment = SentimentScore.VERY_NEGATIVE
        elif polarity <= -0.1:
            sentiment = SentimentScore.NEGATIVE
        else:
            sentiment = SentimentScore.NEUTRAL
            
        return SentimentResult(
            article=NewsArticle(
                title="",
                content=text,
                source="textblob",
                url=None,
                published_at=datetime.now()
            ),
            sentiment=sentiment,
            confidence=1 - subjectivity,  # More objective = more confident
            numeric_score=polarity,
            provider=AIProvider.TEXTBLOB,
            processing_time_ms=0,
            keywords_extracted=[],
            entities_mentioned=[],
            timestamp=datetime.now()
        )
    
    def _analyze_rule_based(self, text: str) -> SentimentResult:
        """Ultimate fallback: Rule-based sentiment"""
        text_lower = text.lower()
        
        # Financial sentiment keywords
        positive_keywords = [
            'bull', 'surge', 'soar', 'rally', 'breakout', 'profit', 'gain',
            'bullish', 'uptrend', 'growth', 'strong', 'buy', 'upgrade'
        ]
        negative_keywords = [
            'bear', 'crash', 'plunge', 'drop', 'sell', 'loss', 'decline',
            'bearish', 'downtrend', 'weak', 'recession', 'downgrade', 'risk'
        ]
        
        pos_count = sum(1 for word in positive_keywords if word in text_lower)
        neg_count = sum(1 for word in negative_keywords if word in text_lower)
        
        total = pos_count + neg_count
        if total == 0:
            sentiment = SentimentScore.NEUTRAL
            score = 0
            confidence = 0.3
        else:
            ratio = (pos_count - neg_count) / total
            if ratio >= 0.6:
                sentiment = SentimentScore.VERY_POSITIVE
            elif ratio >= 0.2:
                sentiment = SentimentScore.POSITIVE
            elif ratio <= -0.6:
                sentiment = SentimentScore.VERY_NEGATIVE
            elif ratio <= -0.2:
                sentiment = SentimentScore.NEGATIVE
            else:
                sentiment = SentimentScore.NEUTRAL
                
            score = ratio
            confidence = min(total / 10, 1.0)  # More keywords = more confident
            
        return SentimentResult(
            article=NewsArticle(
                title="",
                content=text,
                source="rule_based",
                url=None,
                published_at=datetime.now()
            ),
            sentiment=sentiment,
            confidence=confidence,
            numeric_score=score,
            provider=AIProvider.RULE_BASED,
            processing_time_ms=0,
            keywords_extracted=[],
            entities_mentioned=[],
            timestamp=datetime.now()
        )
    
    def _fallback_analysis(self, text: str, error: str) -> SentimentResult:
        """Ultimate fallback when all providers fail"""
        print(f"All providers failed: {error}. Using rule-based fallback.")
        return self._analyze_rule_based(text)


__all__ = [
    'AIProvider',
    'SentimentScore',
    'NewsArticle',
    'SentimentResult',
    'MultiAIProvider',
    'RateLimiter'
]
