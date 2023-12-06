---
sidebar_position: 6
---

# ResponseSynthesizer

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

O ResponseSynthesizer é responsável por enviar a consulta, os nós e os modelos de prompt para o LLM (Language Model) a fim de gerar uma resposta. Existem alguns modos principais para gerar uma resposta:

- `Refine`: "criar e refinar" uma resposta percorrendo sequencialmente cada trecho de texto recuperado. Isso faz uma chamada separada para o LLM por nó. Bom para respostas mais detalhadas.
- `CompactAndRefine` (padrão): "compactar" o prompt durante cada chamada ao LLM, inserindo o máximo de trechos de texto que couberem no tamanho máximo do prompt. Se houver muitos trechos para caber em um único prompt, "criar e refinar" uma resposta percorrendo vários prompts compactos. O mesmo que `refine`, mas deve resultar em menos chamadas ao LLM.
- `TreeSummarize`: Dado um conjunto de trechos de texto e a consulta, construir recursivamente uma árvore e retornar o nó raiz como resposta. Bom para fins de sumarização.
- `SimpleResponseBuilder`: Dado um conjunto de trechos de texto e a consulta, aplicar a consulta a cada trecho de texto enquanto acumula as respostas em uma matriz. Retorna uma string concatenada de todas as respostas. Bom quando você precisa executar a mesma consulta separadamente para cada trecho de texto.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Eu tenho 10 anos." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John tem 20 anos." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Qual é a minha idade?",
  nodesWithScore,
);
console.log(response.response);
```

## Referência da API

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)
