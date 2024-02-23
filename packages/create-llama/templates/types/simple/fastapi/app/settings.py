import os
from llama_index.llms.openai import OpenAI
from llama_index.core.settings import Settings


def init_settings():
    model = os.getenv("MODEL", "gpt-3.5-turbo")
    Settings.llm = OpenAI(model=model)
    Settings.chunk_size = 1024
    Settings.chunk_overlap = 20
