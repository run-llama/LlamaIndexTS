# Postgres Vector Store

There are two scripts available here: load-docs.ts and query.ts

## Prerequisites

You'll need a postgres database instance against which to run these scripts. A simple docker command would look like this:

> `docker run -d --rm --name vector-db -p 5432:5432 -e "POSTGRES_HOST_AUTH_METHOD=trust" ankane/pgvector`

Set the PGHOST and PGUSER (and PGPASSWORD) environment variables to match your database setup.

You'll also need a value for OPENAI_API_KEY in your environment.

**NOTE:** Using `--rm` in the example docker command above means that the vector store will be deleted every time the container is stopped. For production purposes, use a volume to ensure persistence across restarts.

## Use a database on cloud

We recommend using a managed database service on cloud. For example, you can use [Timescale](https://docs.timescale.com/use-timescale/latest/services/create-a-service/?ref=timescale.com) to create a PostgreSQL database instance. You can then run the following command to set up environment variables for the database connection:

```bash
export PGHOST=<your database host>
export PGUSER=<your database user>
export PGPASSWORD=<your database password>
export PGDATABASE=<your database name>
export PGPORT=<your database port>
export OPENAI_API_KEY=<your openai api key>s
```

## Setup and Loading Docs

Read and follow the instructions in the README.md file located one directory up to make sure your JS/TS dependencies are set up. The commands listed below are also run from that parent directory.

To import documents and save the embedding vectors to your database:

> `npx ts-node pg-vector-store/load-docs.ts data`

where data is the directory containing your input files. Using the _data_ directory in the example above will read all of the files in that directory using the llamaindexTS default readers for each file type.

## RAG Querying

To query using the resulting vector store:

> `npx ts-node pg-vector-store/query.ts`

The script will prompt for a question, then process and present the answer using the PGVectorStore data and your OpenAI API key. It will continue to prompt until you enter `q`, `quit` or `exit` as the next query.
