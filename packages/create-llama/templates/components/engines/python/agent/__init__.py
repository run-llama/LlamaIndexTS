from llama_index.core.settings import Settings
from llama_index.core.agent import AgentRunner
from llama_index.core.tools.query_engine import QueryEngineTool
from app.engine.tools import ToolFactory
from app.engine.index import get_index


def get_chat_engine():
    tools = []

    # Add query tool
    index = get_index()
    query_engine = index.as_query_engine(similarity_top_k=3)
    query_engine_tool = QueryEngineTool.from_defaults(query_engine=query_engine)
    tools.append(query_engine_tool)

    # Add additional tools
    tools += ToolFactory.from_env()

    return AgentRunner.from_llm(
        llm=Settings.llm,
        tools=tools,
        verbose=True,
    )
