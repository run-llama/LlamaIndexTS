# Weaviate Vector Store

Here are two sample scripts which work with loading and querying data from a Weaviate Vector Store.

## Prerequisites

- An Weaviate Vector Database
  - Hosted https://weaviate.io/
  - Self Hosted https://weaviate.io/developers/weaviate/installation/docker-compose#starter-docker-compose-file
- An OpenAI API Key

## Setup

1. Set your env variables:

- `WEAVIATE_CLUSTER_URL`: Address of your Weaviate Vector Store (like localhost:8080)
- `WEAVIATE_API_KEY`: Your Weaviate API key
- `OPENAI_API_KEY`: Your OpenAI key

2. `cd` Into the `examples` directory
3. run `npm i`

## Load the data

This sample loads the same dataset of movie reviews as sample dataset

run `npx tsx weaviate/load`

## Use RAG to Query the data

run `npx tsx weaviate/query`
