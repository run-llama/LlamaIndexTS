# JSONReader

A simple JSON data loader with various options.
Either parses the entire string, cleaning it and treat each line as an embedding or performs a recursive depth-first traversal yielding JSON paths.

## Usage

```ts
import { JSONReader } from "llamaindex";

const file = "../../PATH/TO/FILE";

const reader = new JSONReader({ levelsBack: 0, collapseLength: 100 });
const docs = reader.loadData(file);
```

### Options

Basic:

-`ensureAscii?`: Wether to ensure only ASCII characters be present in the output by converting non-ASCII characters to their unicode escape sequence. Default is `false`.

-`isJsonLines?`: Wether the JSON is in JSON Lines format. If true, will split into lines, remove empty one and parse each line as JSON. Default is `false`

-`cleanJson?`: Whether to clean the JSON by filtering out structural characters (`{}, [], and ,`). If set to false, it will just parse the JSON, not removing structural characters. Default is `true`.

Depth-First-Traversal:

-`levelsBack?`: Specifies how many levels up the JSON structure to include in the output. `cleanJson` will be ignored. If set to 0, all levels are included. If undefined, parses the entire JSON, treat each line as an embedding and create a document per top-level array. Default is `undefined`

-`collapseLength?`: The maximum length of JSON string representation to be collapsed into a single line. Only applicable when `levelsBack` is set. Default is `undefined`

#### Examples

<!-- prettier-ignore-start -->
Input:

```json
{"a": {"1": {"key1": "value1"}, "2": {"key2": "value2"}}, "b": {"3": {"k3": "v3"}, "4": {"k4": "v4"}}}
```

Default options:
`LevelsBack` = `undefined` & `cleanJson` = `true`

Output:

```json
"a": {
"1": {
"key1": "value1"
"2": {
"key2": "value2"
"b": {
"3": {
"k3": "v3"
"4": {
"k4": "v4"
```

Depth-First Traversal all levels:
`levelsBack` = `0`

Output:

```json
a 1 key1 value1
a 2 key2 value2
b 3 k3 v3
b 4 k4 v4
```

Depth-First Traversal and Collapse:
`levelsBack` = `0` & `collapseLength` = `35`

Output:

```json
a 1 {"key1":"value1"}
a 2 {"key2":"value2"}
b {"3":{"k3":"v3"},"4":{"k4":"v4"}}
```

Depth-First Traversal limited levels:
`levelsBack` = `2`

Output:

```json
1 key1 value1
2 key2 value2
3 k3 v3
4 k4 v4
```

Uncleaned JSON:
`levelsBack` = `undefined` & `cleanJson` = `false`

Output:

```json
{"a":{"1":{"key1":"value1"},"2":{"key2":"value2"}},"b":{"3":{"k3":"v3"},"4":{"k4":"v4"}}}
```

ASCII-Conversion:

Input:

```json
{ "message": "こんにちは世界" }
```

Output:

```json
"message": "\u3053\u3093\u306b\u3061\u306f\u4e16\u754c"
```

JSON Lines Format:

Input:

```json
{"tweet": "Hello world"}\n{"tweet": "こんにちは世界"}
```

Output:

```json
"tweet": "Hello world"

"tweet": "こんにちは世界"
```
<!-- prettier-ignore-end -->

## API Reference

- [JSONReader](../../api/classes/JSONReader.md)
