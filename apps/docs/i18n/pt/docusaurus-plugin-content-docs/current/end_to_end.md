---
sidebar_position: 4
---

# Exemplos de Ponta a Ponta

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

Incluímos vários exemplos de ponta a ponta usando o LlamaIndex.TS no repositório.

Confira os exemplos abaixo ou experimente-os e complete-os em minutos com tutoriais interativos do Github Codespace fornecidos pelo Dev-Docs [aqui](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine (Motor de Chat)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Leia um arquivo e converse sobre ele com o LLM.

## [Índice Vetorial](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Crie um índice vetorial e faça consultas nele. O índice vetorial usará embeddings para buscar os nós mais relevantes do top k. Por padrão, o top k é 2.

## [Índice de Resumo](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Crie um índice de lista e consulte-o. Este exemplo também usa o `LLMRetriever`, que usará o LLM para selecionar os melhores nós a serem usados ao gerar uma resposta.

## [Salvar / Carregar um Índice](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Crie e carregue um índice de vetor. A persistência no disco no LlamaIndex.TS acontece automaticamente assim que um objeto de contexto de armazenamento é criado.

"

## [Índice Vetorial Personalizado](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Crie um índice vetorial e consulte-o, ao mesmo tempo em que configura o `LLM`, o `ServiceContext` e o `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Crie um OpenAI LLM e use-o diretamente para conversar.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Crie um Llama-2 LLM e use-o diretamente para bate-papo.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Utiliza o `SubQuestionQueryEngine`, que divide consultas complexas em várias perguntas e, em seguida, agrega uma resposta com base nas respostas de todas as subperguntas.

"

## [Módulos de Baixo Nível](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Este exemplo utiliza vários componentes de baixo nível, o que elimina a necessidade de um mecanismo de consulta real. Esses componentes podem ser usados em qualquer lugar, em qualquer aplicativo, ou personalizados e sub-classificados para atender às suas próprias necessidades.
