from dotenv import load_dotenv

load_dotenv()
import os
import logging
from llama_index.vector_stores import PineconeVectorStore

from app.engine.constants import DATA_DIR
from app.engine.context import create_service_context
from app.engine.loader import get_documents


from llama_index import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    StorageContext,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()


def generate_datasource(service_context):
    logger.info("Creating new index")
    # load the documents and create the index
    documents = get_documents()
    store = PineconeVectorStore(
        api_key=os.environ["PINECONE_API_KEY"],
        index_name=os.environ["PINECONE_INDEX_NAME"],
        environment=os.environ["PINECONE_ENVIRONMENT"],
    )
    storage_context = StorageContext.from_defaults(vector_store=store)
    VectorStoreIndex.from_documents(
        documents,
        service_context=service_context,
        storage_context=storage_context,
        show_progress=True,  # this will show you a progress bar as the embeddings are created
    )
    logger.info(
        f"Successfully created embeddings and save to your Pinecone index {os.environ['PINECONE_INDEX_NAME']}"
    )


if __name__ == "__main__":
    generate_datasource(create_service_context())
