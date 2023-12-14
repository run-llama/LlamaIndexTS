# DataStax AstraDB Vector Store

Here are two sample scripts which work well with the sample data in the Astra Portal

## Prerequisites

- An Astra DB account. You can [create one here](https://astra.datastax.com/register).
  - An Astra Vector Database
- An OpenAI API Key

## Setup

1. Set your env variables:

- `ASTRA_DB_APPLICATION_TOKEN`: The generated app token for your Astra database
- `ASTRA_DB_ENDPOINT`: The API endpoint for your Astra database
- `OPENAI_API_KEY`: Your OpenAI key

2. `cd` Into the `examples` directory
3. run `npm i`

## Load the data

This sample loads the same dataset of movie reviews as the Astra Portal sample dataset. (Feel free to load the data in your the Astra Data Explorer to compare)

run `ts-node astradb/load`

## Use RAG to Query the data

Check out your data in the Astra Data Explorer and change the sample query as you see fit.

run `ts-node astradb/query`
