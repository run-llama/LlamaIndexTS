import os
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.settings import Settings


def init_settings():
    llm_model = os.getenv("MODEL", "gpt-3.5-turbo")
    embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")

    Settings.llm = OpenAI(model=llm_model)
    Settings.embed_model = OpenAIEmbedding(model=embedding_model)
    Settings.chunk_size = 1024
    Settings.chunk_overlap = 20
