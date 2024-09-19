function getMetadata() {
  const metadata = {
    name: "wikipedia_tool",
    description: "A tool that uses a query engine to search Wikipedia.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The query to search for",
        },
      },
      required: ["query"],
    },
  };
  Host.outputString(JSON.stringify(metadata));
}

function call() {
  const params = JSON.parse(Host.inputString());
  const query = params?.query;
  if (!query) throw new Error("No query provided");
  const request = {
    method: "GET",
    url: `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
  };
  const response = Http.request(request);
  if (response.status != 200)
    throw new Error(`Got non 200 response ${response.status}`);
  Host.outputString(response.body);
}

module.exports = { getMetadata, call };
