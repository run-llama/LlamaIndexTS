from llama_index.core.settings import Settings
from app.engine.constants import CHUNK_SIZE, CHUNK_OVERLAP
from app.settings import init_base_settings


def init_settings():
    init_base_settings()

    Settings.chunk_size = CHUNK_SIZE
    Settings.chunk_overlap = CHUNK_OVERLAP
