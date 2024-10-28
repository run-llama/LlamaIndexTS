# @llamaindex/readers

> Utilities for reading data from various sources

## Usage

```shell
npm i @llamaindex/readers
```

```ts
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";

const reader = new SimpleDirectoryReader();
const documents = reader.loadData("./directory");
```

## License

MIT
