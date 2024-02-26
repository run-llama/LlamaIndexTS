# Evaluating

## Concept

Evaluation and benchmarking are crucial concepts in LLM development. To improve the perfomance of an LLM app (RAG, agents) you must have a way to measure it.

LlamaIndex offers key modules to measure the quality of generated results. We also offer key modules to measure retrieval quality.

- **Response Evaluation**: Does the response match the retrieved context? Does it also match the query? Does it match the reference answer or guidelines?
- **Retrieval Evaluation**: Are the retrieved sources relevant to the query?

## Response Evaluation

Evaluation of generated results can be difficult, since unlike traditional machine learning the predicted result is not a single number, and it can be hard to define quantitative metrics for this problem.

LlamaIndex offers LLM-based evaluation modules to measure the quality of results. This uses a “gold” LLM (e.g. GPT-4) to decide whether the predicted answer is correct in a variety of ways.

Note that many of these current evaluation modules do not require ground-truth labels. Evaluation can be done with some combination of the query, context, response, and combine these with LLM calls.

These evaluation modules are in the following forms:

- **Correctness**: Whether the generated answer matches that of the reference answer given the query (requires labels).

- **Faithfulness**: Evaluates if the answer is faithful to the retrieved contexts (in other words, whether if there’s hallucination).

- **Relevancy**: Evaluates if the response from a query engine matches any source nodes.

## Usage

- [Correctness Evaluator](correctness.md)
- [Faithfulness Evaluator](faithfulness.md)
- [Relevancy Evaluator](relevancy.md)
