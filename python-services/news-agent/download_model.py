import os
from huggingface_hub import hf_hub_download
import logging
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_REPO = "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF"
MODEL_FILE = "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
MODEL_PATH = "./models"

def download_model():
    """
    Download the GGUF model for local inference.
    This function is designed to be optional - if it fails, the service
    should still start and use fallback sentiment analysis (VADER/TextBlob).
    """
    try:
        if not os.path.exists(MODEL_PATH):
            os.makedirs(MODEL_PATH)

        destination = os.path.join(MODEL_PATH, MODEL_FILE)

        if os.path.exists(destination):
            file_size = os.path.getsize(destination)
            logger.info(f"✓ Model already exists at {destination} ({file_size} bytes)")
            return True

        logger.info(f"📥 Downloading {MODEL_FILE} from {MODEL_REPO}...")
        logger.info("⏳ This may take a few minutes on first deployment...")

        model_path = hf_hub_download(
            repo_id=MODEL_REPO,
            filename=MODEL_FILE,
            local_dir=MODEL_PATH,
            local_dir_use_symlinks=False
        )

        logger.info(f"✓ Model downloaded successfully to {model_path}")
        return True

    except Exception as e:
        logger.warning(f"⚠️  Failed to download model: {e}")
        logger.warning("⚠️  Service will start without local LLM and use fallback sentiment analysis")
        logger.warning("⚠️  This is expected behavior - the service remains fully functional")
        return False

if __name__ == "__main__":
    success = download_model()
    if not success:
        logger.info("💡 Note: You can manually download the model later if needed")
        logger.info("💡 The service will use VADER and TextBlob for sentiment analysis")
    sys.exit(0)
