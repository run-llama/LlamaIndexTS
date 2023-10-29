const llama = require("llamaindex");

async function ask() {
  const text = document.getElementById("text-file").content;
  const doc = new llama.Document({text: text});
  const localLLm = new llama.LocalLLM();
  const serviceContext = llama.serviceContextFromDefaults({
    llm: localLLm,
    embedModel: new llama.LocalEmbedding(),
  });
  const qaResponseBuilder = new llama.QaResponseBuilder(localLLm);
  const responseSynthetizer = new llama.ResponseSynthesizer({responseBuilder: qaResponseBuilder, serviceContext: serviceContext});
  const storageContext = await llama.storageContextFromDefaults({});
  const index = await llama.VectorStoreIndex.fromDocuments([doc], { storageContext, serviceContext });
  const queryEngine = index.asQueryEngine({responseSynthesizer: responseSynthetizer});
  const response = await queryEngine.query(
    document.getElementById('question').value,
  );
  const res = response.response.answer;
  document.getElementById('answer').innerHTML = "Answer: " + res;
}

window.ask = ask;

