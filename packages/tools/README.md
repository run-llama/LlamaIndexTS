## Usage

```ts
import { TestTool } from "@llamaindex/tools";

const testTool = new TestTool();
console.log(testTool.metadata);
console.log(testTool.call("Some query string here."));
```
