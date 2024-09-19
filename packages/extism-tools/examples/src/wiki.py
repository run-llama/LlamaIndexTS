import extism
import json
from os.path import join, dirname


def read_local_wasm(file_name):
    path = join(dirname(__file__), file_name)  # Change this to your wasm file path
    with open(path, "rb") as wasm_file:
        return wasm_file.read()


def _manifest(file_name):
    wasm = read_local_wasm(file_name)
    return {
        "wasm": [{"data": wasm}],
        "allowed_hosts": ["*.wikipedia.org"],
    }


manifest = _manifest("wiki.wasm")
with extism.Plugin(manifest, wasi=True) as plugin:
    metadata = plugin.call(
        "getMetadata",
        "",
        parse=lambda output: json.loads(bytes(output).decode("utf-8")),
    )
    data = plugin.call(
        "call",
        json.dumps({"query": "Ho Chi Minh City"}),
        parse=lambda output: json.loads(bytes(output).decode("utf-8")),
    )

print(metadata)
print(data)
