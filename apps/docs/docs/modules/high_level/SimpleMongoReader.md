import { MongoClient } from "mongodb";
import { SimpleMongoReader } from "llamaindex";

const client = new MongoClient("your_mongodb_uri");
const reader = new SimpleMongoReader(client);
```

## Methods

The `SimpleMongoReader` class has a single method, `loadData`.

### loadData

This method is used to load data from a MongoDB collection. It takes the following parameters:

- `db_name`: The name of the database to load.
- `collection_name`: The name of the collection to load.
- `max_docs` (optional): Maximum number of documents to return. 0 means no limit.
- `query_dict` (optional): Specific query, as specified by MongoDB Node.js documentation.
- `query_options` (optional): Specific query options, as specified by MongoDB Node.js documentation.
- `projection` (optional): Projection options, as specified by MongoDB Node.js documentation.

The method returns a Promise that resolves to an array of `Document` instances.

```typescript
reader.loadData("myDatabase", "myCollection").then(documents => {
  console.log(documents);
});
