import os
from huggingface_hub import hf_hub_download
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_REPO = "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF"
MODEL_FILE = "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
MODEL_PATH = "./models"

def download_model():
    """Download the GGUF model for local inference"""
    if not os.path.exists(MODEL_PATH):
        os.makedirs(MODEL_PATH)
    
    destination = os.path.join(MODEL_PATH, MODEL_FILE)
    
    if os.path.exists(destination):
        logger.info(f"Model already exists at {destination}")
        return

    logger.info(f"Downloading {MODEL_FILE} from {MODEL_REPO}...")
    try:
        model_path = hf_hub_download(
            repo_id=MODEL_REPO,
            filename=MODEL_FILE,
            local_dir=MODEL_PATH,
            local_dir_use_symlinks=False
        )
        logger.info(f"Model downloaded successfully to {model_path}")
    except Exception as e:
        logger.error(f"Failed to download model: {e}")
        raise e

if __name__ == "__main__":
    download_model()
