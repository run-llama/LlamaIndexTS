function getMetadata() {
  const metadata = {
    name: "todo_tool",
    description: "A tool helps search todo.",
    parameters: {
      type: "object",
      properties: {
        index: {
          type: "number",
          description: "The index of the todo to search for.",
        },
      },
      required: ["index"],
    },
  };
  Host.outputString(JSON.stringify(metadata));
}

function call() {
  const params = JSON.parse(Host.inputString());
  const index = params?.index;
  if (!index) throw new Error("No index provided");
  const request = {
    method: "GET",
    url: `https://jsonplaceholder.typicode.com/todos/${encodeURIComponent(index)}`,
  };
  const response = Http.request(request);
  if (response.status != 200)
    throw new Error(`Got non 200 response ${response.status}`);

  Host.outputString(response.body);
}

module.exports = { getMetadata, call };
