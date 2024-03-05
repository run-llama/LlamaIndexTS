import logging
from llama_index.core.indices.vector_store import VectorStoreIndex
from app.engine.utils import init_pg_vector_store_from_env

logger = logging.getLogger("uvicorn")


def get_index():
    logger.info("Connecting to index from PGVector...")
    store = init_pg_vector_store_from_env()
    index = VectorStoreIndex.from_vector_store(store)
    logger.info("Finished connecting to index from PGVector.")
    return index
