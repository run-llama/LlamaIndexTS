import logging
import os

from llama_index import (
    VectorStoreIndex,
)
from llama_index.vector_stores import MongoDBAtlasVectorSearch

from app.engine.context import create_service_context


def get_chat_engine():
    service_context = create_service_context()
    logger = logging.getLogger("uvicorn")
    logger.info("Connecting to index from MongoDB...")
    store = MongoDBAtlasVectorSearch(
        db_name=os.environ["MONGODB_DATABASE"],
        collection_name=os.environ["MONGODB_VECTORS"],
        index_name=os.environ["MONGODB_VECTOR_INDEX"],
    )
    index = VectorStoreIndex.from_vector_store(store, service_context)
    logger.info("Finished connecting to index from MongoDB.")
    return index.as_chat_engine(similarity_top_k=5)
