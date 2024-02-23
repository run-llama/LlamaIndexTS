from llama_index.core.chat_engine import SimpleChatEngine


def get_chat_engine():
    return SimpleChatEngine.from_defaults()
