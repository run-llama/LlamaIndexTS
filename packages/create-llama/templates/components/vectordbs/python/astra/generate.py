import os
import logging

from llama_index.vector_stores import AstraDBVectorStore

from app.engine.context import create_service_context
from app.engine.loader import get_documents


from llama_index import (
    VectorStoreIndex,
    StorageContext,
)

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()


def generate_datasource(service_context):
    logger.info("Creating new index")

    # load the documents and create the index
    documents = get_documents()

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

    # Build the storage context
    storage_context = StorageContext.from_defaults(vector_store=store)

    # Create the index
    VectorStoreIndex.from_documents(
        documents,
        service_context=service_context,
        storage_context=storage_context,
        show_progress=True,  # this will show you a progress bar as the embeddings are created
    )
    logger.info(
        f"Successfully created embeddings in the AstraDB collection {collection_name}"
    )


if __name__ == "__main__":
    generate_datasource(create_service_context())
