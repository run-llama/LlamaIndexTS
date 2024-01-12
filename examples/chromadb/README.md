# Chroma Vector Store Example

How to run `examples/chromadb/test.ts`:

Export your OpenAI API Key using `export OPEN_API_KEY=insert your api key here`

If you haven't installed chromadb, run `pip install chromadb`. Start the server using `chroma run`.

Now, open a new terminal window and inside `examples`, run `pnpx ts-node chromadb/test.ts`.

Here's the output for the input query `Tell me about Godfrey Cheshire's rating of La Sapienza.`:

`Godfrey Cheshire gave La Sapienza a rating of 4 out of 4, describing it as fresh and the most astonishing and important movie to emerge from France in quite some time.`
