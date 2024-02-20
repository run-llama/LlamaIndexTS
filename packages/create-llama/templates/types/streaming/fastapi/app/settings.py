import os
from llama_index.llms.openai import OpenAI
from llama_index.core.settings import Settings


def init_base_settings():
    model = os.getenv("MODEL", "gpt-3.5-turbo")
    Settings.llm = OpenAI(model=model)
