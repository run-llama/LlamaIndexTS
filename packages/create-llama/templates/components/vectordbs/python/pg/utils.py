import os
from llama_index.vector_stores import PGVectorStore
from pydantic import BaseModel
from urllib.parse import urlparse


class PGConnectionElements(BaseModel):
    user: str
    password: str
    host: str
    port: int
    database: str


def destruct_pg_connection_string(conn_string: str) -> PGConnectionElements:
    """
    Destructs the PostgreSQL connection string into its elements.
    """
    parsed_url = urlparse(conn_string)

    user = parsed_url.username
    password = parsed_url.password
    host = parsed_url.hostname
    port = parsed_url.port
    database = parsed_url.path[1:]

    return PGConnectionElements(
        user=user,
        password=password,
        host=host,
        port=port,
        database=database
    )


def get_pg_conn_elements_from_env() -> PGConnectionElements:
    """
    Returns the PostgreSQL connection elements from the environment variables:
    [PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE]
    """
    env_conn_str = os.environ.get("PG_CONNECTION_STRING")
    if env_conn_str is not None:
        return destruct_pg_connection_string(os.environ["PG_CONNECTION_STRING"])
    else:
        user = os.environ.get("PGUSER")
        password = os.environ.get("PGPASSWORD")
        host = os.environ.get("PGHOST")
        port = int(os.environ.get("PGPORT", 5432))
        database = os.environ.get("PGDATABASE")
        return PGConnectionElements(
            user=user,
            password=password,
            host=host,
            port=port,
            database=database
        )


def init_pg_vector_store_from_env():
    # Initialize the PGVectorStore instance from environment variables
    pg_conn_elements = get_pg_conn_elements_from_env()
    pg_schema = os.environ.get("PGSCHEMA", "public")
    pg_table = os.environ.get("POTABLE", "llamaindex_embedding")
    return PGVectorStore.from_params(
        **pg_conn_elements.model_dump(),
        schema_name=pg_schema,
        table_name=pg_table
    )
