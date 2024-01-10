import os

from llama_index import ServiceContext
from llama_index.llms import OpenAI
from llama_index.engine import BaseChatEngine
from dotenv import load_dotenv


def create_base_context():
    model = os.getenv("MODEL", "gpt-3.5-turbo")
    return ServiceContext.from_defaults(
        llm=OpenAI(model=model),
    )
