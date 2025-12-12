import os
import logging
from llama_cpp import Llama
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class LocalLLMEngine:
    _instance = None
    _model = None

    def __init__(self):
        self.model_path = "./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
        self.context_size = 2048
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self):
        """Load the model into memory if not already loaded"""
        if self._model is not None:
            return

        if not os.path.exists(self.model_path):
            logger.error(f"Model not found at {self.model_path}. Please run download_model.py first.")
            # Fallback for dev/testing if model missing
            raise FileNotFoundError(f"Model file missing: {self.model_path}")

        try:
            logger.info(f"Loading Local LLM from {self.model_path}...")
            # Initialize Llama model
            # n_gpu_layers=0 means CPU only (safe for Render starter)
            self._model = Llama(
                model_path=self.model_path,
                n_ctx=self.context_size,
                n_threads=os.cpu_count(),
                n_gpu_layers=0, 
                verbose=False
            )
            logger.info("Local LLM loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Local LLM: {e}")
            # Do NOT raise here if we want the service to start without LLM
            # raise e
            self._model = None

    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """
        Analyze sentiment using the Local LLM.
        Returns a dictionary with score (-1 to 1) and confidence.
        """
        if self._model is None:
            self.load_model()

        # Prompt engineering for TinyLlama
        prompt = f"""<|system|>
You are a financial sentiment analyst. Analyze the following news text and determine if the sentiment is POSITIVE, NEGATIVE, or NEUTRAL. 
Provide a sentiment score between -1.0 (very negative) and 1.0 (very positive).
Format: Score: [SCORE]
</s>
<|user|>
Text: {text}
</s>
<|assistant|>
"""
        
        try:
            output = self._model(
                prompt,
                max_tokens=32,
                stop=["</s>"],
                echo=False,
                temperature=0.1 # Low temp for determinism
            )
            
            response_text = output['choices'][0]['text'].strip()
            logger.info(f"LLM Response: {response_text}")
            
            # Simple parsing logic (can be made more robust)
            score = 0.0
            if "Score:" in response_text:
                try:
                    score_str = response_text.split("Score:")[1].strip().split()[0]
                    score = float(score_str)
                except ValueError:
                    logger.warning(f"Could not parse score from LLM response: {response_text}")
            
            # Fallback parsing if explicit score missing
            elif "POSITIVE" in response_text.upper():
                score = 0.8
            elif "NEGATIVE" in response_text.upper():
                score = -0.8
            
            return {
                "score": max(-1.0, min(1.0, score)),
                "confidence": 0.8 # Synthetic confidence for now
            }

        except Exception as e:
            logger.error(f"LLM inference failed: {e}")
            return {"score": 0.0, "confidence": 0.0}

llm_engine = LocalLLMEngine.get_instance()
