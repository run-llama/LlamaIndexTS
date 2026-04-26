---
"@llamaindex/core": patch
---

fix(prompts): preserve literal braces that are not template vars in PromptTemplate

When `templateVars` is explicitly defined, `PromptTemplate.format()` now leaves
any `{...}` patterns that are not in the template var set unchanged instead of
throwing `Replacement index out of range`. This allows templates containing
code snippets or JSON-like content alongside substitution variables.
