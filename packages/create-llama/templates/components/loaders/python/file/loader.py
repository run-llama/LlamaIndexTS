from llama_index.core.readers import SimpleDirectoryReader

DATA_DIR = "data"  # directory to cache the generated index


def get_documents():
    return SimpleDirectoryReader(DATA_DIR).load_data()
