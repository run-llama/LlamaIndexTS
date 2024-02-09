import logging
import os

from llama_index import (
    VectorStoreIndex,
)
from llama_index.vector_stores import AstraDBVectorStore

from app.engine.context import create_service_context


def get_index():
    service_context = create_service_context()
    logger = logging.getLogger("uvicorn")
    logger.info("Connecting to index from AstraDB...")

    # Load the required authentication and connection parameters
    token = os.environ["ASTRA_DB_APPLICATION_TOKEN"]
    api_endpoint = os.environ["ASTRA_DB_API_ENDPOINT"]

    # Get the collection name, or set a default if not provided
    collection_name = os.environ.get("ASTRA_DB_COLLECTION", "astra_v_table_createllama")

    # Initialize the AstraDBVectorStore
    store = AstraDBVectorStore(
        token=token,
        api_endpoint=api_endpoint,
        collection_name=collection_name,
        embedding_dimension=1536,
    )

    # Create the index
    index = VectorStoreIndex.from_vector_store(store, service_context)

    logger.info("Finished connecting to index from AstraDB.")

    return index
