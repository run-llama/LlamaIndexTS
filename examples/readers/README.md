## Reader Examples

These examples show how to use a specific reader class by loading a document and running a test query.

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

- PdfReader Example

```bash
npx ts-node readers/load-pdf.ts
```

- HtmlReader Example

```bash
npx ts-node readers/load-html.ts
```

- CsvReader Example

```bash
npx ts-node readers/load-csv.ts
```

- NotionReader Example

```bash
export NOTION_TOKEN=your_notion_token
npx ts-node readers/load-notion.ts
```

- AssemblyAI Example

```bash
export ASSEMBLYAI_API_KEY=your_assemblyai_api_key
npx ts-node readers/load-assemblyai.ts
```
