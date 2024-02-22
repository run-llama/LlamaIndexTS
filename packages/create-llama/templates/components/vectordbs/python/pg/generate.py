from dotenv import load_dotenv

load_dotenv()

import logging
from llama_index.core.indices import VectorStoreIndex
from llama_index.core.storage import StorageContext

from app.engine.constants import DATA_DIR
from app.engine.loader import get_documents
from app.engine.settings import init_settings
from app.engine.utils import init_pg_vector_store_from_env

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()


def generate_datasource():
    logger.info("Creating new index")
    # load the documents and create the index
    documents = get_documents()
    store = init_pg_vector_store_from_env()
    storage_context = StorageContext.from_defaults(vector_store=store)
    VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        show_progress=True,  # this will show you a progress bar as the embeddings are created
    )
    logger.info(
        f"Successfully created embeddings in the PG vector store, schema={store.schema_name} table={store.table_name}"
    )


if __name__ == "__main__":
    init_settings()
    generate_datasource()
