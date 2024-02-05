from llama_index.chat_engine import SimpleChatEngine

from app.context import create_base_context


def get_chat_engine():
    return get_index().as_chat_engine()
