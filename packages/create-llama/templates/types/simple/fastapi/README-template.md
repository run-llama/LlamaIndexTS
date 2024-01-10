This is a [LlamaIndex](https://www.llamaindex.ai/) project using [FastAPI](https://fastapi.tiangolo.com/) bootstrapped with [`create-llama`](https://github.com/run-llama/create-llama-ts).

## Getting Started

First, setup the environment:

```
poetry install
poetry shell
```

By default, we use the OpenAI LLM (though you can customize, see app/api/routers/chat.py). As a result you need to specify an `OPENAI_API_KEY` in an .env file in this directory.

Example `backend/.env` file:

```
OPENAI_API_KEY=<openai_api_key>
```

Second, generate the embeddings of the documents in the `./app/data` directory (if this folder exists - otherwise, skip this step):

```
python app/data/generate.py
```

Third, run the development server:

```
python main.py
```

Then call the API endpoint `/api/chat` to see the result:

```
curl --location '127.0.0.1:8000/api/chat' \
--header 'Content-Type: application/json' \
   - Examine the GitHub Actions error logs to identify the cause of the failure.
   - Look for error messages, stack traces, and warnings to pinpoint the root cause.
   - Ensure that all dependencies are correctly set up. Check for any missing or incompatible dependencies.
   - Verify the environment setup and configuration, including environment variables, secrets, and settings.
   - If the issue persists, refer to the [GitHub Actions documentation](https://docs.github.com/en/actions) for troubleshooting and further assistance.
   - Look for error messages, stack traces, and warnings to pinpoint the root cause.

2. **Fixing Common Issues**
   - Ensure that all dependencies are correctly set up. Check for any missing or incompatible dependencies.
   - Verify the environment setup and configuration, including environment variables, secrets, and settings.
   - If the issue persists, refer to the [GitHub Actions documentation](https://docs.github.com/en/actions) for troubleshooting and further assistance.
--data '{ "messages": [{ "role": "user", "content": "Hello" }] }'
```

You can start editing the API by modifying `app/api/routers/chat.py`. The endpoint auto-updates as you save the file.

Open [http://localhost:8000/docs](http://localhost:8000/docs) with your browser to see the Swagger UI of the API.

The API allows CORS for all origins to simplify development. You can change this behavior by setting the `ENVIRONMENT` environment variable to `prod`:

```
ENVIRONMENT=prod uvicorn main:app
```

## Learn More

To learn more about LlamaIndex, take a look at the following resources:

- [LlamaIndex Documentation](https://docs.llamaindex.ai) - learn about LlamaIndex.

You can check out [the LlamaIndex GitHub repository](https://github.com/run-llama/LlamaIndexTS) - your feedback and contributions are welcome!
