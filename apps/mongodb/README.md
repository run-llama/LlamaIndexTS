# LlamaIndexTS retrieval augmented generation with MongoDB

### Prepare Environment

Make sure to run `pnpm install` and set your OpenAI environment variable before running these examples.

```
pnpm install
export OPENAI_API_KEY="sk-..."
```

### Sign up for MongoDB Atlas

We'll be using MongoDB's hosted database service, [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register). You can sign up for free and get a small hosted cluster for free:

![MongoDB Atlas signup](./docs/1_signup.png)

The signup process will walk you through the process of creating your cluster and ensuring it's configured for you to access. Once the cluster is created, choose "Connect" and then "Connect to your application". Choose Python, and you'll be presented with a connection string that looks like this:

![MongoDB Atlas connection string](./docs/2_connection_string.png)

### Set up environment variables

Copy the connection string (make sure you include your password) and put it into a file called `.env` in the root of this repo. It should look like this:

```
MONGODB_URI=mongodb+srv://seldo:xxxxxxxxxxx@llamaindexdemocluster.xfrdhpz.mongodb.net/?retryWrites=true&w=majority
```

You will also need to choose a name for your database, and the collection where we will store the tweets, and also include them in .env. They can be any string, but this is what we used:

```
MONGODB_DATABASE=tiny_tweets_db
MONGODB_COLLECTION=tiny_tweets_collection
```

### Import tweets into MongoDB

You are now ready to import our ready-made data set into Mongo. This is the file `tinytweets.json`, a selection of approximately 1000 tweets from @seldo on Twitter in mid-2019. With your environment set up you can do this by running

```
pnpm ts-node 1_import.ts
```

If you don't want to use tweets, you can replace `json_file` with any other array of JSON objects, but you will need to modify some code later to make sure the correct field gets indexed. There is no LlamaIndex-specific code here; you can load your data into Mongo any way you want to.

### Load and index your data

Now we're ready to index our data. To do this, LlamaIndex will pull your text out of Mongo, split it into chunks, and then send those chunks to OpenAI to be turned into [vector embeddings](https://docs.llamaindex.ai/en/stable/understanding/indexing/indexing.html#what-is-an-embedding). The embeddings will then be stored in a new collection in Mongo. This will take a while depending how much text you have, but the good news is that once it's done you will be able to query quickly without needing to re-index.

We'll be using OpenAI to do the embedding, so now is when you need to [generate an OpenAI API key](https://platform.openai.com/account/api-keys) if you haven't already and add it to your `.env` file like this:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

You'll also need to pick a name for the new collection where the embeddings will be stored, and add it to `.env`, along with the name of a vector search index (we'll be creating this in the next step, after you've indexed your data):

```
MONGODB_VECTORS=tiny_tweets_vectors
MONGODB_VECTOR_INDEX=tiny_tweets_vector_index
```

If the data you're indexing is the tweets we gave you, you're ready to go:

```bash
pnpm ts-node 2_load_and_index.ts
```

> Note: this script is running a couple of minutes and currently doesn't show any progress.

What you're doing here is creating a Reader which loads the data out of Mongo in the collection and database specified. It looks for text in a set of specific keys in each object. In this case we've given it just one key, "full_text".

Now you're creating a vector search client for Mongo. In addition to a MongoDB client object, you again tell it what database everything is in. This time you give it the name of the collection where you'll store the vector embeddings, and the name of the vector search index you'll create in the next step.

### Create a vector search index

Now if all has gone well you should be able to log in to the Mongo Atlas UI and see two collections in your database: the original data in `tiny_tweets_collection`, and the vector embeddings in `tiny_tweets_vectors`.

![MongoDB Atlas collections](./docs/3_vectors_in_db.png)

Now it's time to create the vector search index so that you can query the data. First, click the Search tab, and then click "Create Search Index":

![MongoDB Atlas create search index](./docs/4_search_tab.png)

It's not yet possible to create a vector search index using the Visual Editor, so select JSON editor:

![MongoDB Atlas JSON editor](./docs/5_json_editor.png)

Now under "database and collection" select `tiny_tweets_db` and within that select `tiny_tweets_vectors`. Then under "Index name" enter `tiny_tweets_vector_index` (or whatever value you put for MONGODB_VECTOR_INDEX in `.env`). Under that, you'll want to enter this JSON object:

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
```

This tells Mongo that the `embedding` field in each document (in the `tiny_tweets_vectors` collection) is a vector of 1536 dimensions (this is the size of embeddings used by OpenAI), and that we want to use cosine similarity to compare vectors. You don't need to worry too much about these values unless you want to use a different LLM to OpenAI entirely.

The UI will ask you to review and confirm your choices, then you need to wait a minute or two while it generates the index. If all goes well, you should see something like this screen:

![MongoDB Atlas index created](./docs/7_index_created.png)

Now you're ready to query your data!

### Run a test query

You can do this by running

```bash
pnpm ts-node 3_query.ts
```

This sets up a connection to Atlas just like `2_load_and_index.ts` did, then it creates a [query engine](https://docs.llamaindex.ai/en/stable/understanding/querying/querying.html#getting-started) and runs a query against it.

If all is well, you should get a nuanced opinion about web frameworks.
