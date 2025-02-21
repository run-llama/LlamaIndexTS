# Firestore Vector Store

Here are some sample scripts which work with loading and querying data from a Firestore Vector Store.

## Prerequisites

- A Firestore Database
  - Hosted https://console.firebase.google.com/
- An OpenAI API Key

## Setup

1. Set your env variables:

- `FIRESTORE_DB`: Name of your Firestore database
- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_CREDENTIALS`: Your GCP credentials JSON
- `OPENAI_API_KEY`: Your OpenAI key

2. `cd` Into the `examples` directory
3. run `npm i`

## Load the data

This sample loads the same dataset of movie reviews as sample dataset

run `npx tsx firestore/load.ts`

## Use RAG to Query the data

run `npx tsx firestore/query.ts`

## Delete the data

run `npx tsx firestore/delete.ts`
