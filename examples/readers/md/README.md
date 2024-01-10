## MarkdownReader Example

This example shows how to use `MarkdownReader` to load documents and test query.
Supported document formats are: `.md`, `.mdx`.

1. Make sure you are in `examples` directory

```bash
cd ./examples
```

2. Prepare `OPENAI_API_KEY` environment variable:

```bash
export OPENAI_API_KEY=your_openai_api_key
```

3. Run the following command to load documents and test query:

```bash
npx ts-node readers/md/index.ts
```
