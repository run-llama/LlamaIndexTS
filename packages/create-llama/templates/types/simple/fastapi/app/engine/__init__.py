from llama_index.core.chat_engine import SimpleChatEngine
from app.settings import init_base_settings


def get_chat_engine():
    init_base_settings()
    return SimpleChatEngine.from_defaults()
