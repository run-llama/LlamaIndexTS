from dotenv import load_dotenv

load_dotenv()
import logging

from app.engine.constants import DATA_DIR
from app.engine.context import create_service_context
from app.engine.utils import init_pg_vector_store_from_env

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
    store = init_pg_vector_store_from_env()
    storage_context = StorageContext.from_defaults(vector_store=store)
    VectorStoreIndex.from_documents(
        documents,
        service_context=service_context,
        storage_context=storage_context,
        show_progress=True,  # this will show you a progress bar as the embeddings are created
    )
    logger.info(
        f"Successfully created embeddings in the PG vector store, schema={store.schema_name} table={store.table_name}"
    )


if __name__ == "__main__":
    generate_datasource(create_service_context())
