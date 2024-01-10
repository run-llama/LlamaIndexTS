This is a [LlamaIndex](https://www.llamaindex.ai/) project using [FastAPI](https://fastapi.tiangolo.com/) bootstrapped with [`create-llama`](https://github.com/run-llama/create-llama-ts).

## Getting Started

First, setup the environment:

```
poetry install
poetry shell
```

By default, we use the OpenAI LLM (though you can customize, see `app/context.py`). As a result, you need to specify an `OPENAI_API_KEY` in an .env file in this directory.

## Troubleshooting GitHub Actions

If GitHub Actions run into issues, follow these steps to troubleshoot and resolve common problems.

1. **Analyzing Error Logs**
   - Analyze the error logs from GitHub Actions to identify the cause of the failure.
   - Look for error messages, stack traces, and warnings to pinpoint the root cause.

2. **Fixing Common Issues**
   - Check for missing or incompatible dependencies, and ensure that the environment setup and configuration are correct.
   - Analyze and resolve common issues related to environment setup and dependencies.
   - Refer to the [GitHub Actions documentation](https://docs.github.com/en/actions) for further troubleshooting and assistance.

Example `.env` file:

```
OPENAI_API_KEY=your_actual_api_key_here
```

Second, generate the embeddings of the documents in the `./data` directory (if this folder exists - otherwise, skip this step):

```
python app/engine/generate_embeddings.py
```

Third, run the development server:

```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then call the API endpoint `/api/chat` to see the result:

```
curl --location 'https://api.llamaindex.ai/api/chat' \
--header 'Content-Type: application/json' \
--data '{ "messages": [{ "role": "user", "content": "Hello, how are you?" }] }'
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

For more information on troubleshooting GitHub Actions and understanding the error logs. For detailed information on using GitHub Actions, see the [GitHub Actions documentation](https://docs.github.com/en/actions)., refer to the [GitHub Actions documentation](https://docs.github.com/en/actions) for further troubleshooting.
