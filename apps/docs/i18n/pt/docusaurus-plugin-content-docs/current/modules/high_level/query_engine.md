---
sidebar_position: 3
---

# QueryEngine (Motor de Consulta)

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

Um motor de consulta envolve um `Retriever` e um `ResponseSynthesizer` em um pipeline, que usará a string de consulta para buscar nós e, em seguida, enviá-los para o LLM para gerar uma resposta.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("string de consulta");
```

## Motor de Consulta de Subperguntas

O conceito básico do Motor de Consulta de Subperguntas é dividir uma única consulta em várias consultas, obter uma resposta para cada uma dessas consultas e, em seguida, combinar essas respostas diferentes em uma única resposta coerente para o usuário. Você pode pensar nisso como a técnica de "pensar passo a passo" mas iterando sobre suas fontes de dados!

### Começando

A maneira mais fácil de começar a experimentar o Motor de Consulta de Subperguntas é executar o arquivo subquestion.ts em [exemplos](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Ferramentas

O SubQuestionQueryEngine é implementado com Ferramentas. A ideia básica das Ferramentas é que elas são opções executáveis para o grande modelo de linguagem. Neste caso, nosso SubQuestionQueryEngine depende do QueryEngineTool, que, como você pode imaginar, é uma ferramenta para executar consultas em um QueryEngine. Isso nos permite dar ao modelo a opção de consultar diferentes documentos para diferentes perguntas, por exemplo. Você também pode imaginar que o SubQuestionQueryEngine poderia usar uma Ferramenta que busca algo na web ou obtém uma resposta usando o Wolfram Alpha.

Você pode aprender mais sobre as Ferramentas dando uma olhada na documentação do LlamaIndex Python em https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## Referência da API

- [RetrieverQueryEngine (Motor de Consulta do Retriever)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Motor de Consulta de Subpergunta)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Ferramenta do Motor de Consulta)](../../api/interfaces/QueryEngineTool.md)
