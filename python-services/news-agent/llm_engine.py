import os
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

try:
    from llama_cpp import Llama
    LLAMA_CPP_AVAILABLE = True
except ImportError:
    LLAMA_CPP_AVAILABLE = False
    logger.warning("llama-cpp-python not available, will use fallback sentiment only")

class LocalLLMEngine:
    _instance = None
    _model = None
    _model_available = False

    def __init__(self):
        self.model_path = "./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
        self.context_size = 2048

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def is_available(self) -> bool:
        """Check if the LLM model is available and loaded"""
        return self._model_available and self._model is not None

    def load_model(self):
        """
        Load the model into memory if not already loaded.
        This is designed to be optional - if it fails, the service
        continues with fallback sentiment analysis.
        """
        if self._model is not None:
            self._model_available = True
            return True

        if not LLAMA_CPP_AVAILABLE:
            logger.warning("⚠️  llama-cpp-python not installed, skipping LLM load")
            self._model_available = False
            return False

        if not os.path.exists(self.model_path):
            logger.warning(f"⚠️  Model not found at {self.model_path}")
            logger.warning(f"⚠️  Service will use fallback sentiment analysis (VADER/TextBlob)")
            logger.warning(f"⚠️  To enable local LLM: run download_model.py")
            self._model_available = False
            return False

        try:
            logger.info(f"📦 Loading Local LLM from {self.model_path}...")
            self._model = Llama(
                model_path=self.model_path,
                n_ctx=self.context_size,
                n_threads=os.cpu_count() or 4,
                n_gpu_layers=0,
                verbose=False
            )
            self._model_available = True
            logger.info("✓ Local LLM loaded successfully")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to load Local LLM: {e}")
            logger.warning(f"⚠️  Continuing with fallback sentiment analysis")
            self._model = None
            self._model_available = False
            return False

    def analyze_sentiment(self, text: str) -> Optional[Dict[str, float]]:
        """
        Analyze sentiment using the Local LLM.
        Returns a dictionary with score (-1 to 1) and confidence,
        or None if LLM is not available (fallback will be used).
        """
        if self._model is None and not self.load_model():
            return None

        if not self._model_available:
            return None

        prompt = f"""<|system|>
You are a financial sentiment analyst. Analyze the following news text and determine if the sentiment is POSITIVE, NEGATIVE, or NEUTRAL.
Provide a sentiment score between -1.0 (very negative) and 1.0 (very positive).
Format: Score: [SCORE]
</s>
<|user|>
Text: {text[:500]}
</s>
<|assistant|>
"""

        try:
            output = self._model(
                prompt,
                max_tokens=32,
                stop=["</s>"],
                echo=False,
                temperature=0.1
            )

            response_text = output['choices'][0]['text'].strip()
            logger.debug(f"LLM Response: {response_text}")

            score = 0.0
            if "Score:" in response_text:
                try:
                    score_str = response_text.split("Score:")[1].strip().split()[0]
                    score = float(score_str)
                except (ValueError, IndexError):
                    logger.debug(f"Could not parse score from: {response_text}")

            elif "POSITIVE" in response_text.upper():
                score = 0.8
            elif "NEGATIVE" in response_text.upper():
                score = -0.8

            return {
                "score": max(-1.0, min(1.0, score)),
                "confidence": 0.8
            }

        except Exception as e:
            logger.error(f"LLM inference failed: {e}")
            logger.warning("Falling back to traditional sentiment analysis")
            return None

llm_engine = LocalLLMEngine.get_instance()
