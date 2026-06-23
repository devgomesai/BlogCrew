from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
import os

load_dotenv()

def get_llm():
    model = init_chat_model(os.environ["LLM_CHOICE"])
    return model