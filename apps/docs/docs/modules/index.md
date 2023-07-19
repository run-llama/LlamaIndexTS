# Core Modules

LlamaIndex.TS offers several core modules, seperated into high-level modules for quickly getting started, and low-level modules for customizing key components as you need.

## High-Level Modules

- [**Document**](./high_level/documents_and_nodes.md): A document represents a text file, PDF file or other contiguous piece of data.

- [**Node**](./high_level/documents_and_nodes.md): The basic data building block. Most commonly, these are parts of the document split into manageable pieces that are small enough to be fed into an embedding model and LLM.

- [**Reader/Loader**](./high_level/data_loader.md): A reader or loader is something that takes in a document in the real world and transforms into a Document class that can then be used in your Index and queries. We currently support plain text files and PDFs with many many more to come.

- [**Indexes**](./high_level/data_index.md): indexes store the Nodes and the embeddings of those nodes.

-[**QueryEngine**](./high_level/query_engine.md): Query engines are what generate the query you put in and give you back the result. Query engines generally combine a pre-built prompt with selected nodes from your Index to give the LLM the context it needs to answer your query.

- [**ChatEngine**](./high_level/chat_engine.md): A ChatEngine helps you build a chatbot that will interact with your Indexes.

## Low Level Module

- [**LLM**](./low_level/llm.md): The LLM class is a unified interface over a large language model provider such as OpenAI GPT-4, Anthropic Claude, or Meta LLaMA. You can subclass it to write a connector to your own large language model.

- [**Embedding**](./low_level/embedding.md): An embedding is represented as a vector of floating point numbers. OpenAI's text-embedding-ada-002 is our default embedding model and each embedding it generates consists of 1,536 floating point numbers. Another popular embedding model is BERT which uses 768 floating point numbers to represent each Node. We provide a number of utilities to work with embeddings including 3 similarity calculation options and Maximum Marginal Relevance

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Text splitting strategies are incredibly important to the overall efficacy of the embedding search. Currently, while we do have a default, there's no one size fits all solution. Depending on the source documents, you may want to use different splitting sizes and strategies. Currently we support spliltting by fixed size, splitting by fixed size with overlapping sections, splitting by sentence, and splitting by paragraph. The text splitter is used by the NodeParser when splitting `Document`s into `Node`s.

- [**Retriever**](./low_level/retriever.md): The Retriever is what actually chooses the Nodes to retrieve from the index. Here, you may wish to try retrieving more or fewer Nodes per query, changing your similarity function, or creating your own retriever for each individual use case in your application. For example, you may wish to have a separate retriever for code content vs. text content.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): The ResponseSynthesizer is responsible for taking a query string, and using a list of `Node`s to generate a response. This can take many forms, like iterating over all the context and refining an answer, or building a tree of summaries and returning the root summary.

- [**Storage**](./low_level/storage.md): At some point you're going to want to store your indexes, data and vectors instead of re-running the embedding models every time. IndexStore, DocStore, VectorStore, and KVStore are abstractions that let you do that. Combined, they form the StorageContext. Currently, we allow you to persist your embeddings in files on the filesystem (or a virtual in memory file system), but we are also actively adding integrations to Vector Databases.
