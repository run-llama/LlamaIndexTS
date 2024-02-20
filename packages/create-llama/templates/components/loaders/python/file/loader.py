from llama_index.core.readers import SimpleDirectoryReader
from app.engine.constants import DATA_DIR


def get_documents():
    return SimpleDirectoryReader(DATA_DIR).load_data()
