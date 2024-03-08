import os
from app.engine.index import get_index


def get_chat_engine():
    system_prompt = os.getenv("SYSTEM_PROMPT")

    return get_index().as_chat_engine(
        similarity_top_k=3,
        system_prompt=system_prompt,
        chat_mode="condense_plus_context",
    )
