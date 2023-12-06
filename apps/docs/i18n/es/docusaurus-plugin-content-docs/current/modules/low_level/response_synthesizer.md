---
sidebar_position: 6
---

# ResponseSynthesizer (SintetizadorDeRespuestas)

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

El ResponseSynthesizer es responsable de enviar la consulta, los nodos y las plantillas de indicaciones al LLM para generar una respuesta. Hay algunos modos clave para generar una respuesta:

- `Refine` (Refinar): "crear y refinar" una respuesta pasando secuencialmente por cada fragmento de texto recuperado. Esto realiza una llamada separada al LLM por cada Nodo. Bueno para respuestas más detalladas.
- `CompactAndRefine` (CompactarYRefinar) (por defecto): "compactar" la indicación durante cada llamada al LLM al llenar tantos fragmentos de texto como sea posible dentro del tamaño máximo de la indicación. Si hay demasiados fragmentos para llenar en una sola indicación, "crear y refinar" una respuesta pasando por múltiples indicaciones compactas. Es lo mismo que `refine`, pero debería resultar en menos llamadas al LLM.
- `TreeSummarize` (ResumirÁrbol): Dado un conjunto de fragmentos de texto y la consulta, construye recursivamente un árbol y devuelve el nodo raíz como respuesta. Bueno para fines de resumen.
- `SimpleResponseBuilder` (ConstructorDeRespuestasSimples): Dado un conjunto de fragmentos de texto y la consulta, aplica la consulta a cada fragmento de texto mientras acumula las respuestas en un array. Devuelve una cadena concatenada de todas las respuestas. Bueno cuando necesitas ejecutar la misma consulta por separado en cada fragmento de texto.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Tengo 10 años." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John tiene 20 años." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "¿Qué edad tengo?",
  nodesWithScore,
);
console.log(response.response);
```

## Referencia de la API

- [ResponseSynthesizer (SintetizadorDeRespuestas)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Refinar)](../../api/classes/Refine.md)
- [CompactAndRefine (CompactarYRefinar)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (ResumirÁrbol)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (ConstructorDeRespuestasSimples)](../../api/classes/SimpleResponseBuilder.md)

"
