---
"@llamaindex/cloud": patch
---

Improve the loadJson function in LlamaParseReader to align with loadData by allowing URL inputs. Ensures s3://, http://, and https:// paths are not treated as local file paths.
