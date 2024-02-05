import os
import json
import importlib


from typing import Union
from pydantic import BaseModel, field_validator, computed_field
from llama_index.tools.types import BaseTool
from llama_index.tools.tool_spec.base import BaseToolSpec
from llama_index.agent import OpenAIAgent, ReActAgent
from llama_index.tools.query_engine import QueryEngineTool


class ToolConfig(BaseModel):
    name: str
    raw_config: str

    @computed_field
    def config(self) -> dict:
        return json.loads(self.raw_config)

    @field_validator("raw_config")
    @classmethod
    def config_must_serializable(cls, value) -> str:
        try:
            json.loads(value)
            return value
        except json.JSONDecodeError as e:
            raise ValueError(f"Config {value} is not a serializable JSON!")

    @staticmethod
    def from_env() -> "ToolConfig":
        return ToolConfig(
            name=os.environ.get("TOOL", ""),
            raw_config=os.environ.get("TOOL_CONFIG", ""),
        )


class ToolFactory:

    @staticmethod
    def create_tool(tool_name: str, **kwargs) -> Union[BaseTool, BaseToolSpec]:
        try:
            module_name = f"llama_hub.tools.{tool_name}.base"
            module = importlib.import_module(module_name)
            tool_cls_name = tool_name.title().replace("_", "") + "ToolSpec"
            tool_class = getattr(module, tool_cls_name)
            return tool_class(**kwargs)
        except (ImportError, AttributeError) as e:
            raise ValueError(f"Unsupported tool: {tool_name}") from e
        except TypeError as e:
            raise ValueError(
                f"Could not create tool: {tool_name}. With config: {kwargs}"
            ) from e

    @staticmethod
    def from_env():
        tool_config = ToolConfig.from_env()
        return ToolFactory.create_tool(tool_name=tool_config.name, **tool_config.config)
