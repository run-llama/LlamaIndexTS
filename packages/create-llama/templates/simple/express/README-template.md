1. Install the dependencies
```
pnpm install
```

2. Run the server
```
pnpm run dev
```

3. Call the API to LLM Chat
```
curl --location 'localhost:3000/api/llm' \
--header 'Content-Type: application/json' \
--data '{
    "message": "Hello",
    "chatHistory": []
}'
```