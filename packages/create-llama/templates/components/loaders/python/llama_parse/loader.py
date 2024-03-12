import os
from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader

DATA_DIR = "data"  # directory containing the documents


def get_documents():
    if os.getenv("LLAMA_CLOUD_API_KEY") is None:
        raise ValueError(
            "LLAMA_CLOUD_API_KEY environment variable is not set. "
            "Please set it in .env file or in your shell environment then run again!"
        )
    parser = LlamaParse(result_type="markdown", verbose=True, language="en")

    reader = SimpleDirectoryReader(DATA_DIR, file_extractor={".pdf": parser})
    return reader.load_data()
