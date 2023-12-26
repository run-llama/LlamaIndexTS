import os

from llama_index import ServiceContext
from llama_index.llms import OpenAI
from app.engine.constants import CHUNK_SIZE, CHUNK_OVERLAP


def create_base_context():
    model = os.getenv("MODEL", "gpt-3.5-turbo")
    return ServiceContext.from_defaults(
        llm=OpenAI(model=model),
    )


def create_service_context():
    base = create_base_context()
    return ServiceContext.from_defaults(
        llm=base.llm,
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
