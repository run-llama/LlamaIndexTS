import logging
import os

from llama_index.core.indices import VectorStoreIndex
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch


logger = logging.getLogger("uvicorn")


def get_index():
    logger.info("Connecting to index from MongoDB...")
    store = MongoDBAtlasVectorSearch(
        db_name=os.environ["MONGODB_DATABASE"],
        collection_name=os.environ["MONGODB_VECTORS"],
        index_name=os.environ["MONGODB_VECTOR_INDEX"],
    )
    index = VectorStoreIndex.from_vector_store(store)
    logger.info("Finished connecting to index from MongoDB.")
    return index
