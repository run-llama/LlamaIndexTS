# Postgres Vector Store

There are two scripts available here: `load-docs.ts` and `query.ts`

## Prerequisites

### Start a DB Instance

You'll need a postgres database instance against which to run these scripts. A simple docker command would look like this:

> `docker run -d --rm --name vector-db -p 5432:5432 -e "POSTGRES_HOST_AUTH_METHOD=trust" ankane/pgvector`

**NOTE:** Using `--rm` in the example docker command above means that the vector store will be deleted every time the container is stopped. For production purposes, use a volume to ensure persistence across restarts.

If you prefer using a managed service, you can use [Timescale](https://docs.timescale.com/use-timescale/latest/services/create-a-service/?ref=timescale.com) to create a PostgreSQL database instance in the cloud as an alternative.

### Set up Environment

Having created a DB instance, you can then set up environment variables for your database connection:

```bash
export PGHOST=<your database host>
export PGUSER=<your database user>
export PGPASSWORD=<your database password>
export PGDATABASE=<your database name>
export PGPORT=<your database port>
export OPENAI_API_KEY=<your openai api key>
```

Set the environment variables above to match your database setup.
Note that you'll also need an OpenAI key (`OPENAI_API_KEY`) in your environment.
You're now ready to start the scripts.

## Setup and Loading Docs

Read and follow the instructions in the README.md file located one directory up to make sure your JS/TS dependencies are set up. The commands listed below are also run from that parent directory.

To import documents and save the embedding vectors to your database:

> `npx ts-node pg-vector-store/load-docs.ts data`

where data is the directory containing your input files. Using the `data` directory in the example above will read all of the files in that directory using the LlamaIndexTS default readers for each file type.

## RAG Querying

To query using the resulting vector store:

> `npx ts-node pg-vector-store/query.ts`

The script will prompt for a question, then process and present the answer using the PGVectorStore data and your OpenAI API key. It will continue to prompt until you enter `q`, `quit` or `exit` as the next query.
