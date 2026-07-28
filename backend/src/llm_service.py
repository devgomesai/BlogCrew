import os
import sys
from functools import lru_cache

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

load_dotenv()


@lru_cache(maxsize=1)
def get_llm():
    """One client for the orchestrator and every subagent — same config."""
    choice = os.environ.get("LLM_CHOICE")
    if not choice:
        sys.exit("LLM_CHOICE is not set. Add it to backend/.env (see .env.example).")
    return init_chat_model(model=choice)
