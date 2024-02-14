# Prompts

Prompting is the fundamental input that gives LLMs their expressive power. LlamaIndex uses prompts to build the index, do insertion, perform traversal during querying, and to synthesize the final answer.

Users may also provide their own prompt templates to further customize the behavior of the framework. The best method for customizing is copying the default prompt from the link above, and using that as the base for any modifications.

## Usage Pattern

Currently, there are two ways to customize prompts in LlamaIndex:

For both methods, you will need to create an function that overrides the default prompt.

```ts
// Define a custom prompt
const newTextQaPrompt: TextQaPrompt = ({ context, query }) => {
  return `Context information is below.
---------------------
${context}
---------------------
Given the context information and not prior knowledge, answer the query.
Answer the query in the style of a Sherlock Holmes detective novel.
Query: ${query}
Answer:`;
};
```

### 1. Customizing the default prompt on initialization

The first method is to create a new instance of `ResponseSynthesizer` (or the module you would like to update the prompt) and pass the custom prompt to the `responseBuilder` parameter. Then, pass the instance to the `asQueryEngine` method of the index.

```ts
// Create an instance of response synthesizer
const responseSynthesizer = new ResponseSynthesizer({
  responseBuilder: new CompactAndRefine(serviceContext, newTextQaPrompt),
});

// Create index
const index = await VectorStoreIndex.fromDocuments([document], {
  serviceContext,
});

// Query the index
const queryEngine = index.asQueryEngine({ responseSynthesizer });

const response = await queryEngine.query({
  query: "What did the author do in college?",
});
```

### 2. Customizing submodules prompt

The second method is that most of the modules in LlamaIndex have a `getPrompts` and a `updatePrompt` method that allows you to override the default prompt. This method is useful when you want to change the prompt on the fly or in submodules on a more granular level.

```ts
// Create index
const index = await VectorStoreIndex.fromDocuments([document], {
  serviceContext,
});

// Query the index
const queryEngine = index.asQueryEngine();

// Get a list of prompts for the query engine
const prompts = queryEngine.getPrompts();

// output: { "responseSynthesizer:textQATemplate": defaultTextQaPrompt, "responseSynthesizer:refineTemplate": defaultRefineTemplatePrompt }

// Now, we can override the default prompt
queryEngine.updatePrompt({
  "responseSynthesizer:textQATemplate": newTextQaPrompt,
});

const response = await queryEngine.query({
  query: "What did the author do in college?",
});
```
