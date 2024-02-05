import logging
import os
import json

from app.engine.constants import STORAGE_DIR
from app.engine.context import create_service_context
from app.engine.tools import ToolFactory
from llama_index.agent import OpenAIAgent
from llama_index import (
    StorageContext,
    load_index_from_storage,
)


def get_chat_engine():
    service_context = create_service_context()
    if os.environ.get("TOOL", "") != "":
        tools = ToolFactory.from_env().to_tool_list()
        return OpenAIAgent.from_tools(
            tools=tools, llm=service_context.llm, verbose=True
        )
    logger = logging.getLogger("uvicorn")
    # load the existing index
    logger.info(f"Loading index from {STORAGE_DIR}...")
    storage_context = StorageContext.from_defaults(persist_dir=STORAGE_DIR)
    index = load_index_from_storage(storage_context, service_context=service_context)
    logger.info(f"Finished loading index from {STORAGE_DIR}")
    return index.as_chat_engine(similarity_top_k=5, chat_mode="condense_plus_context")
