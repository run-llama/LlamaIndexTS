from app.engine.index import get_index


def get_chat_engine():
    return get_index().as_chat_engine(
        similarity_top_k=3, chat_mode="condense_plus_context"
    )
