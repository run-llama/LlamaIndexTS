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
    tools = ToolFactory.from_env().to_tool_list()
    # TODO: get index by calling get_index and add query tool
    return ReactAgent.from_tools(tools=tools, llm=service_context.llm, verbose=True)
