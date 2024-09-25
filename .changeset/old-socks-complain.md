---
"@llamaindex/core": patch
"llamaindex": minor
---

fix: backward support for legacy typescript config

This change is a breaking change as we don't support submodule import in `llamaindex` module.

In the future, we will support multiple JS runtime natively instead of customizing submodule import.
