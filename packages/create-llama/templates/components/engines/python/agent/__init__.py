import os

from typing import Any, Optional
from llama_index.llms import LLM
from llama_index.agent import AgentRunner

from app.engine.tools import ToolFactory
from app.engine.index import get_index
from llama_index.agent import ReActAgent
from llama_index.tools.query_engine import QueryEngineTool


def create_agent_from_llm(
    llm: Optional[LLM] = None,
    **kwargs: Any,
) -> AgentRunner:
    from llama_index.agent import OpenAIAgent, ReActAgent
    from llama_index.llms.openai import OpenAI
    from llama_index.llms.openai_utils import is_function_calling_model

    if isinstance(llm, OpenAI) and is_function_calling_model(llm.model):
        return OpenAIAgent.from_tools(
            llm=llm,
            **kwargs,
        )
    else:
        return ReActAgent.from_tools(
            llm=llm,
            **kwargs,
        )


def get_chat_engine():
    tools = []

    # Add query tool
    index = get_index()
    llm = index.service_context.llm
    query_engine = index.as_query_engine(similarity_top_k=5)
    query_engine_tool = QueryEngineTool.from_defaults(query_engine=query_engine)
    tools.append(query_engine_tool)

    # Add additional tools
    tools += ToolFactory.from_env()

    return create_agent_from_llm(
        llm=llm,
        tools=tools,
        verbose=True,
    )
