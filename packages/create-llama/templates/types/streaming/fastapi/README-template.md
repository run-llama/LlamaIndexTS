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
   - Analyze the error logs to identify any missing setup, incorrect configurations, or environment variable issues.
   - Look for error messages, stack traces, warnings, or hints to pinpoint the root cause of the failure.

2. **Fixing Common Issues**
   - Verify that the workflow file (e.g., main.yml) is correctly configured and includes all necessary steps, environment variables, and dependencies.
   - Analyze the error logs to identify any missing setup, incorrect configurations, or environment variable issues.
   - Use the GitHub Actions documentation to troubleshoot and resolve common problems.

Example `.env` file:

```
OPENAI_API_KEY=your_openai_api_key
ANOTHER_VARIABLE=another_value
```

Second, generate the embeddings of the documents in the `./data` directory (if this folder exists - otherwise, skip this step):

```
generate-document-embeddings
```

Third, run the development server:

```
uvicorn app.main:app --reload
```

Then call the API endpoint `/api/chat` to see the result:

```
http POST :8000/api/chat messages:='[{ role=user, content=Hello }]'
```

To edit the API, modify the file located at `app/api/routers/chat.py`. The endpoint auto-updates as you save the file.

Access the Swagger UI of the API at [http://localhost:8000/docs](http://localhost:8000/docs).

To run the development server in production mode, set the `ENVIRONMENT` environment variable to `prod` and execute the following command:

```sh
uvicorn app.main:app --reload --workers 4 --host 0.0.0.0 --port 80
```
```

## Learn More

To learn more about LlamaIndex, take a look at the following resources:

- [LlamaIndex Documentation](https://docs.llamaindex.ai) - learn about LlamaIndex.

You can check out [the LlamaIndex GitHub repository](https://github.com/run-llama/LlamaIndexTS) - your feedback and contributions are welcome!

For more information on troubleshooting GitHub Actions, understanding the error logs, and deploying FastAPI applications, refer to the following resources:
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - learn about GitHub Actions.
- [FastAPI Deployment Documentation](https://fastapi.tiangolo.com/deployment/) - learn about deploying FastAPI applications.
