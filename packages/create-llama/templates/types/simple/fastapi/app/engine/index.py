from llama_index.chat_engine import SimpleChatEngine

from app.context import create_base_context


def get_chat_engine():
    return SimpleChatEngine.from_defaults(service_context=create_base_context())
