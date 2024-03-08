## Usage

```ts
import ToolFactory from "@llamaindex/tools";
const TestTool = ToolFactory.toClass("test-tool");
const testTool = new TestTool();
testTool.call("Some query string here.");
```
