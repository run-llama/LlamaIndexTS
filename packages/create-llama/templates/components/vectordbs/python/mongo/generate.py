from dotenv import load_dotenv

load_dotenv()
import os
import logging
from llama_index.vector_stores import MongoDBAtlasVectorSearch

from app.engine.constants import DATA_DIR
from app.engine.context import create_service_context


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
    documents = SimpleDirectoryReader(DATA_DIR).load_data()
    store = MongoDBAtlasVectorSearch(
        db_name=os.environ["MONGODB_DATABASE"],
        collection_name=os.environ["MONGODB_VECTORS"],
        index_name=os.environ["MONGODB_VECTOR_INDEX"],
    )
    storage_context = StorageContext.from_defaults(vector_store=store)
    VectorStoreIndex.from_documents(
        documents,
        service_context=service_context,
        storage_context=storage_context,
        show_progress=True,  # this will show you a progress bar as the embeddings are created
    )
    logger.info(
        f"Successfully created embeddings in the MongoDB collection {os.environ['MONGODB_VECTORS']}"
    )
    logger.info(
        """IMPORTANT: You can't query your index yet because you need to create a vector search index in MongoDB's UI now.
See https://github.com/run-llama/mongodb-demo/tree/main?tab=readme-ov-file#create-a-vector-search-index"""
    )


if __name__ == "__main__":
    generate_datasource(create_service_context())
