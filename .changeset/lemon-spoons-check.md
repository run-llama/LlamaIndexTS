---
"llamaindex": major
"@llamaindex/llamaindex-test": patch
"@llamaindex/e2e": patch
---

# Breaking Change

## What Changed

Remove default setting of llm and embedModel in Settings

## Migration Guide

Set the llm provider and embed Model in the top of your code using Settings.llm = and Settings.embedModel
