import {
  Anthropic,
  LlamaDeuce,
  OpenAI,
  PapaCSVReader,
  PDFReader,
  Portkey,
} from "llamaindex";

async function main() {
  const response = {
    status: "success",
    message: "",
    assertions: {},
  };

  function makeAssertion(name, condition) {
    if (!condition) {
      response.status = "failure";
      response.message = `Assertion failed for ${name}.`;
    }
    response.assertions[name] = condition;
  }

  makeAssertion("OpenAI", typeof OpenAI === "function");
  makeAssertion("LlamaDeuce", typeof LlamaDeuce === "function");
  makeAssertion("Anthropic", typeof Anthropic === "function");
  makeAssertion("Portkey", typeof Portkey === "function");

  const { VectorStoreIndex } = await import("llamaindex");
  makeAssertion("VectorStoreIndex", typeof VectorStoreIndex === "function");

  const pdfReader = new PDFReader();
  makeAssertion("pdfReader.loadData", typeof pdfReader.loadData === "function");

  const csvReader = new PapaCSVReader();
  makeAssertion("csvReader.loadData", typeof csvReader.loadData === "function");

  console.log(JSON.stringify(response));
}

main();
