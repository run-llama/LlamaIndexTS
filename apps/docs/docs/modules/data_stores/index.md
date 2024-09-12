# Storage

Storage in LlamaIndex.TS works automatically once you've configured a
`StorageContext` object.

## Local Storage

You can configure the `persistDir` and attach it to an index.

```typescript
import {
  Document,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## PostgreSQL Storage

You can configure the `schemaName`, `tableName`, `namespace`, and
`connectionString`. If a `connectionString` is not
provided, it will use the environment variables `PGHOST`, `PGUSER`,
`PGPASSWORD`, `PGDATABASE` and `PGPORT`.

```typescript
import {
  Document,
  VectorStoreIndex,
  PostgresDocumentStore,
  PostgresIndexStore,
  storageContextFromDefaults,
} from "llamaindex";

const storageContext = await storageContextFromDefaults({
  docStore: new PostgresDocumentStore(),
  indexStore: new PostgresIndexStore(),
});

const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Reference

- [StorageContext](../../api/interfaces/StorageContext.md)
