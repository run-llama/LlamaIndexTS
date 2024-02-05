from llama_index.chat_engine import SimpleChatEngine

from app.context import create_base_context
from app.engine.index import get_index


def get_chat_engine():
    return get_index().as_chat_engine(
        similarity_top_k=5, chat_mode="condense_plus_context"
    )
