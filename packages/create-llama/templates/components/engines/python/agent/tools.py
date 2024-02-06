import json
import importlib

from llama_index.tools.tool_spec.base import BaseToolSpec


class ToolFactory:

    @staticmethod
    def create_tool(tool_name: str, **kwargs) -> BaseToolSpec:
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
    def from_env() -> list[BaseToolSpec]:
        with open("tools_config.json", "r") as f:
            tool_configs = json.load(f)
            return [
                ToolFactory.create_tool(name, **config)
                for name, config in tool_configs.items()
            ]
