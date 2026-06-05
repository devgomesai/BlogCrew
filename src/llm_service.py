from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
import os

# Load environment variables from a .env file
load_dotenv()

def get_llm():
    return init_chat_model(os.environ["LLM_CHOICE"])