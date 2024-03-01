from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader

DATA_DIR = "data"  # directory containing the documents


def get_documents():
    parser = LlamaParse(
        result_type="markdown",
        verbose=True,
    )

    reader = SimpleDirectoryReader(DATA_DIR, file_extractor={".pdf": parser})
    return reader.load_data()
