import os
from llama_index.vector_stores import PGVectorStore
from urllib.parse import urlparse
from app.engine.constants import PGVECTOR_SCHEMA, PGVECTOR_TABLE


def init_pg_vector_store_from_env():
    original_conn_string = os.environ.get("PG_CONNECTION_STRING")
    if original_conn_string is None or original_conn_string == "":
        raise ValueError("PG_CONNECTION_STRING environment variable is not set.")

    # The PGVectorStore requires both two connection strings, one for psycopg2 and one for asyncpg
    # Update the configured scheme with the psycopg2 and asyncpg schemes
    original_scheme = urlparse(original_conn_string).scheme + "://"
    conn_string = original_conn_string.replace(
        original_scheme, "postgresql+psycopg2://"
    )
    async_conn_string = original_conn_string.replace(
        original_scheme, "postgresql+asyncpg://"
    )

    return PGVectorStore(
        connection_string=conn_string,
        async_connection_string=async_conn_string,
        schema_name=PGVECTOR_SCHEMA,
        table_name=PGVECTOR_TABLE,
    )
