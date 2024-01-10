## Readers Example

These example show how to use reader classes to load documents and test query.

1. Make sure you are in `examples` directory

```bash
cd ./examples
```

2. Prepare `OPENAI_API_KEY` environment variable:

```bash
export OPENAI_API_KEY=your_openai_api_key
```

3. Run the following command to load documents and test query:

- MarkdownReader Example

```bash
npx ts-node readers/load-md.ts
```

- DocxReader Example

```bash
npx ts-node readers/load-docx.ts
```
