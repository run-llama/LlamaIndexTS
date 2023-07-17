---
sidebar_position: 3
---

# High-Level Concepts

LlamaIndex helps you build LLM-powered applications (e.g. Q&A, chatbot, and agents) over custom data.

In this high-level concepts guide, you will learn:
* the retrieval augmented generation (RAG) paradigm for combining LLM with custom data,
* key concepts and modules in LlamaIndex for composing your own RAG pipeline.

## Retrieval Augmented Generation (RAG)
Retrieval augmented generation (RAG) is a paradigm for augmenting LLM with custom data.
It generally consists of two stages: 

1) **indexing stage**: preparing a knowledge base, and
2) **querying stage**: retrieving relevant context from the knowledge to assist the LLM in responding to a question

![](./_static/concepts/rag.jpg)


LlamaIndex provides the essential toolkit for making both steps super easy.
Let's explore each stage in detail.

### Indexing Stage
LlamaIndex help you prepare the knowledge base with a suite of data connectors and indexes.
![](./_static/concepts/indexing.jpg) 

[**Data Connectors**](/core_modules/data_modules/connector/root.md):
A data connector (i.e. `Reader`) ingest data from different data sources and data formats into a simple `Document` representation (text and simple metadata).

[**Documents / Nodes**](/core_modules/data_modules/documents_and_nodes/root.md): A `Document` is a generic container around any data source - for instance, a PDF, an API output, or retrieved data from a database. A `Node` is the atomic unit of data in LlamaIndex and represents a "chunk" of a source `Document`. It's a rich representation that includes metadata and relationships (to other nodes) to enable accurate and expressive retrieval operations.

[**Data Indexes**](/core_modules/data_modules/index/root.md): 
Once you've ingested your data, LlamaIndex help you index data into a format that's easy to retrieve.
Under the hood, LlamaIndex parse the raw documents into intermediate representations, calculate vector embeddings, and infer metadata, etc.
The most commonly used index is the [VectorStoreIndex](/core_modules/data_modules/index/vector_store_guide.ipynb)

### Querying Stage
In the querying stage, the RAG pipeline retrieves the most relevant context given a user query,
and pass that to the LLM (along with the query) to synthesize a response.
This gives the LLM up-to-date knowledge that is not in its original training data,
(also reducing hallucination).
The key challenge in the querying stage is retrieval, orchestration, and reasoning over (potentially many) knowledge bases.

LlamaIndex provides composable modules that help you build and integrate RAG pipelines for Q&A (query engine), chatbot (chat engine), or as part of an agent.
These building blocks can be customized to reflect ranking preferences, as well as composed to reason over multiple knowledge bases in a structured way.

![](./_static/concepts/querying.jpg)

#### Building Blocks
[**Retrievers**](/core_modules/query_modules/retriever/root.md): 
A retriever defines how to efficiently retrieve relevant context from a knowledge base (i.e. index) when given a query.
The specific retrieval logic differs for difference indices, the most popular being dense retrieval against a vector index.

[**Node Postprocessors**](/core_modules/query_modules/node_postprocessors/root.md):
A node postprocessor takes in a set of nodes, then apply transformation, filtering, or re-ranking logic to them. 

[**Response Synthesizers**](/core_modules/query_modules/response_synthesizers/root.md):
A response synthesizer generates a response from an LLM, using a user query and a given set of retrieved text chunks.  

#### Pipelines

[**Query Engines**](/core_modules/query_modules/query_engine/root.md):
A query engine is an end-to-end pipeline that allow you to ask question over your data.
It takes in a natural language query, and returns a response, along with reference context retrieved and passed to the LLM.


[**Chat Engines**](/core_modules/query_modules/chat_engines/root.md): 
A chat engine is an end-to-end pipeline for having a conversation with your data
(multiple back-and-forth instead of a single question & answer).

[**Agents**](/core_modules/agent_modules/agents/root.md): 
An agent is an automated decision maker (powered by an LLM) that interacts with the world via a set of tools.
Agent may be used in the same fashion as query engines or chat engines. 
The main distinction is that an agent dynamically decides the best sequence of actions, instead of following a predetermined logic.
This gives it additional flexibility to tackle more complex tasks.

# Concepts

LlamaIndex.TS is a typescript package that allows you to quickly load data and query/chat with your own data. The diagram below 

LlamaIndex.TS offers various key abstractions, which can be categorized as a **High Level API**, as well as a **Low Level API** for more granular customization.

## High Level API

- **Document**: A document represents a text file, PDF file or other contiguous piece of data.

- **Node**: The basic data building block. Most commonly, these are parts of the document split into manageable pieces that are small enough to be fed into an embedding model and LLM.

- **Indexes**: indexes store the Nodes and the embeddings of those nodes.

- **QueryEngine**: Query engines are what generate the query you put in and give you back the result. Query engines generally combine a pre-built prompt with selected nodes from your Index to give the LLM the context it needs to answer your query.

- **ChatEngine**: A ChatEngine helps you build a chatbot that will interact with your Indexes.

## Low Level API

- **SimplePrompt**: A simple standardized function call definition that takes in inputs and puts them in a prebuilt template.

- **LLM**: The LLM class is a unified interface over a large language model provider such as OpenAI GPT-4, Anthropic Claude, or Meta LLaMA. You can subclass it to write a connector to your own large language model.

- **Embedding**: An embedding is represented as a vector of floating point numbers. OpenAI's text-embedding-ada-002 is our default embedding model and each embedding it generates consists of 1,536 floating point numbers. Another popular embedding model is BERT which uses 768 floating point numbers to represent each Node. We provide a number of utilities to work with embeddings including 3 similarity calculation options and Maximum Marginal Relevance

- **Reader/Loader**: A reader or loader is something that takes in a document in the real world and transforms into a Document class that can then be used in your Index and queries. We currently support plain text files and PDFs with many many more to come.

- **TextSplitter**: Text splitting strategies are incredibly important to the overall efficacy of the embedding search. Currently, while we do have a default, there's no one size fits all solution. Depending on the source documents, you may want to use different splitting sizes and strategies. Currently we support spliltting by fixed size, splitting by fixed size with overlapping sections, splitting by sentence, and splitting by paragraph.

- **Retriever**: The Retriever is what actually chooses the Nodes to retrieve from the index. Here, you may wish to try retrieving more or fewer Nodes per query, changing your similarity function, or creating your own retriever for each individual use case in your application. For example, you may wish to have a separate retriever for code content vs. text content.

- **Storage**: At some point you're going to want to store your indexes, data and vectors instead of re-running the embedding models every time. IndexStore, DocStore, VectorStore, and KVStore are abstractions that let you do that. Combined, they form the StorageContext. Currently, we allow you to persist your embeddings in files on the filesystem (or a virtual in memory file system), but we are also actively adding integrations to Vector Databases.
