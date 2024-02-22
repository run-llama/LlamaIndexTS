import logging
import os

from llama_index import (
    VectorStoreIndex,
)
from llama_index.vector_stores import PineconeVectorStore

from app.engine.context import create_service_context


def get_index():
    service_context = create_service_context()
    logger = logging.getLogger("uvicorn")
    logger.info("Connecting to index from Pinecone...")
    store = PineconeVectorStore(
        api_key=os.environ["PINECONE_API_KEY"],
        index_name=os.environ["PINECONE_INDEX_NAME"],
        environment=os.environ["PINECONE_ENVIRONMENT"],
    )
    index = VectorStoreIndex.from_vector_store(store, service_context)
    logger.info("Finished connecting to index from Pinecone.")
    return index
