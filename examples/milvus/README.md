# Milvus Vector Store

Here are two sample scripts which work with loading and querying data from a Milvus Vector Store.

## Prerequisites

- An Milvus Vector Database
  - Hosted https://milvus.io/
  - Self Hosted https://milvus.io/docs/install_standalone-docker.md
- An OpenAI API Key

## Setup

1. Set your env variables:

- `MILVUS_ADDRESS`: Address of your Milvus Vector Store (like localhost:19530)
- `MILVUS_USERNAME`: empty or username for your Milvus Vector Store
- `MILVUS_PASSWORD`: empty or password for your Milvus Vector Store
- `OPENAI_API_KEY`: Your OpenAI key

2. `cd` Into the `examples` directory
3. run `npm i`

## Load the data

This sample loads the same dataset of movie reviews as sample dataset. You can install https://github.com/zilliztech/attu to inspect the loaded data.

run `npx ts-node milvus/load`

## Use RAG to Query the data

Check out your data in Attu and change the sample query as you see fit.

run `npx ts-node milvus/query`
