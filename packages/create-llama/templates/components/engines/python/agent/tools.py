import json
import importlib

from llama_index.tools.tool_spec.base import BaseToolSpec
from llama_index.tools.function_tool import FunctionTool


class ToolFactory:

    @staticmethod
    def create_tool(tool_name: str, **kwargs) -> list[FunctionTool]:
        try:
            module_name = f"llama_hub.tools.{tool_name}.base"
            module = importlib.import_module(module_name)
            tool_cls_name = tool_name.title().replace("_", "") + "ToolSpec"
            tool_class = getattr(module, tool_cls_name)
            tool_spec: BaseToolSpec = tool_class(**kwargs)
            return tool_spec.to_tool_list()
        except (ImportError, AttributeError) as e:
            raise ValueError(f"Unsupported tool: {tool_name}") from e
        except TypeError as e:
            raise ValueError(
                f"Could not create tool: {tool_name}. With config: {kwargs}"
            ) from e

    @staticmethod
    def from_env() -> list[FunctionTool]:
        tools = []
        with open("tools_config.json", "r") as f:
            tool_configs = json.load(f)
            for name, config in tool_configs.items():
                tools += ToolFactory.create_tool(name, **config)
        return tools
