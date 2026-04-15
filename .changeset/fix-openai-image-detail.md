---
"@llamaindex/openai": patch
---

fix(openai): move image `detail` into `image_url` object for Chat Completions API

The `detail` parameter (`"high"`, `"low"`, `"auto"`) on `image_url` content blocks
was being passed as a sibling of `image_url` to OpenAI's Chat Completions API,
causing a `400 Invalid chat format` error. OpenAI expects `detail` inside the
`image_url` object. This adds a transform in `toOpenAIMessage()` to correctly
nest the `detail` parameter. The core `MessageContentImageDetail` type is
unchanged — this is a provider-layer transform only.
