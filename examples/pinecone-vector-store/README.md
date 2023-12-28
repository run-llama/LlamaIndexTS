# Pinecone Vector Store

There are two scripts available here: load-docs.ts and query.ts

## Prerequisites

You'll need a Pinecone account, project, and index. Pinecone does not allow automatic creation of indexes on the free plan,
so this vector store does not check and create the index (unlike, e.g., the PGVectorStore)

Set the **PINECONE_API_KEY** and **PINECONE_ENVIRONMENT** environment variables to match your specific values. You will likely also need to set **PINECONE_INDEX_NAME**, unless your
index is the default value "llama".

You'll also need a value for OPENAI_API_KEY in your environment.

## Setup and Loading Docs

Read and follow the instructions in the README.md file located one directory up to make sure your JS/TS dependencies are set up. The commands listed below are also run from that parent directory.

To import documents and save the embedding vectors to your database:

> `npx ts-node pinecone-vector-store/load-docs.ts data`

where data is the directory containing your input files. Using the _data_ directory in the example above will read all of the files in that directory using the llamaindexTS default readers for each file type.

**NOTE**: Sending text chunks as part of the Pinecone metadata means that upsert API calls can get arbitrarily large. Set the **PINECONE_CHUNK_SIZE** environment variable to a smaller value if the load script fails

## RAG Querying

To query using the resulting vector store:

> `npx ts-node pinecone-vector-store/query.ts`

The script will prompt for a question, then process and present the answer using the PineconeVectorStore data and your OpenAI API key. It will continue to prompt until you enter `q`, `quit` or `exit` as the next query.
