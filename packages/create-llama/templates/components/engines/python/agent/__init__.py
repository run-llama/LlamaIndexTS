from typing import Any, Optional
from llama_index.core.llms import LLM
from llama_index.core.settings import Settings
from llama_index.llms.openai import OpenAI
from llama_index.agent.openai import OpenAIAgent
from llama_index.core.agent import AgentRunner, ReActAgent
from llama_index.core.tools.query_engine import QueryEngineTool
from llama_index.llms.openai.utils import is_function_calling_model
from app.engine.tools import ToolFactory
from app.engine.index import get_index


def create_agent_from_llm(
    llm: Optional[LLM] = None,
    **kwargs: Any,
) -> AgentRunner:
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
    query_engine = index.as_query_engine(similarity_top_k=3)
    query_engine_tool = QueryEngineTool.from_defaults(query_engine=query_engine)
    tools.append(query_engine_tool)

    # Add additional tools
    tools += ToolFactory.from_env()

    return create_agent_from_llm(
        llm=Settings.llm,
        tools=tools,
        verbose=True,
    )
