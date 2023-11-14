from braintrust import Eval
from autoevals import LevenshteinScorer

from app.utils.index import get_index
 
def task(input):
    # Replace with your LLM call
    index = get_index()
    chat_engine = index.as_chat_engine()
    response = chat_engine.chat(input, [])

    output = response.content
    return output

Eval(
  "Create-llama",
  data=lambda: [
      {
        "input": "Respond with: Hello World!",
        "expected": "Hello World!",
      },
  ],  # Replace with your eval dataset
  task=task,
  scores=[LevenshteinScorer],
)