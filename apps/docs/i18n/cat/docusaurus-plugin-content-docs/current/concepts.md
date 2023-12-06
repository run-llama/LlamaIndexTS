---
sidebar_position: 3
---

# Conceptes de Nivell Alt

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

LlamaIndex.TS t'ajuda a construir aplicacions amb potència LLM (per exemple, Q&A, chatbot) sobre dades personalitzades.

En aquesta guia de conceptes de nivell alt, aprendràs:

- com un LLM pot respondre preguntes utilitzant les teves pròpies dades.
- conceptes clau i mòduls en LlamaIndex.TS per compondre la teva pròpia canalització de consulta.

## Resposta a preguntes a través de les teves dades

LlamaIndex utilitza un mètode de dues etapes quan utilitza un LLM amb les teves dades:

1. **etapa d'indexació**: preparació d'una base de coneixement, i
2. **etapa de consulta**: recuperació de context rellevant de la base de coneixement per ajudar el LLM a respondre a una pregunta

![](./_static/concepts/rag.jpg)

Aquest procés també és conegut com a Generació Augmentada per Recuperació (RAG).

LlamaIndex.TS proporciona les eines essencials per facilitar ambdós passos.

Explorarem cada etapa en detall.

### Etapa d'Indexació

LlamaIndex.TS t'ajuda a preparar la base de coneixement amb una sèrie de connectors de dades i índexs.

![](./_static/concepts/indexing.jpg)

[**Carregadors de Dades**](./modules/high_level/data_loader.md):
Un connector de dades (és a dir, `Reader`) ingestiona dades de diferents fonts de dades i formats de dades en una representació simple de `Document` (text i metadades simples).

[**Documents / Nodes**](./modules/high_level/documents_and_nodes.md): Un `Document` és un contenidor genèric al voltant de qualsevol font de dades - per exemple, un PDF, una sortida d'API o dades recuperades d'una base de dades. Un `Node` és la unitat atòmica de dades en LlamaIndex i representa un "tros" d'un `Document` origen. És una representació completa que inclou metadades i relacions (amb altres nodes) per permetre operacions de recuperació precises i expressives.

[**Índexs de Dades**](./modules/high_level/data_index.md):
Un cop hagis ingestat les teves dades, LlamaIndex t'ajuda a indexar les dades en un format fàcil de recuperar.

A sota dels panells, LlamaIndex analitza els documents en representacions intermèdies, calcula incrustacions vectorials i emmagatzema les teves dades a la memòria o al disc.

"

### Etapa de Consulta

En l'etapa de consulta, la canalització de consulta recupera el context més rellevant donada una consulta de l'usuari,
i ho passa al LLM (juntament amb la consulta) per sintetitzar una resposta.

Això proporciona al LLM un coneixement actualitzat que no es troba en les seves dades d'entrenament originals,
(i també redueix la al·lucinació).

El repte clau en l'etapa de consulta és la recuperació, l'orquestració i el raonament sobre bases de coneixement (potencialment moltes).

LlamaIndex proporciona mòduls componibles que t'ajuden a construir i integrar canalitzacions RAG per a Q&A (motor de consulta), chatbot (motor de xat) o com a part d'un agent.

Aquests blocs de construcció es poden personalitzar per reflectir les preferències de classificació, així com compondre el raonament sobre múltiples bases de coneixement de manera estructurada.

![](./_static/concepts/querying.jpg)

#### Blocs de Construcció

[**Recuperadors**](./modules/low_level/retriever.md):
Un recuperador defineix com recuperar eficientment el context rellevant d'una base de coneixement (és a dir, índex) quan se li dóna una consulta.
La lògica de recuperació específica difereix per a diferents índexs, sent la més popular la recuperació densa contra un índex vectorial.

[**Sintetitzadors de Resposta**](./modules/low_level/response_synthesizer.md):
Un sintetitzador de resposta genera una resposta a partir d'un LLM, utilitzant una consulta de l'usuari i un conjunt donat de trossos de text recuperats.

"

#### Canalitzacions

[**Motor de Consulta**](./modules/high_level/query_engine.md):
Un motor de consulta és una canalització de cap a cap que et permet fer preguntes sobre les teves dades.
Rebutja una consulta en llenguatge natural i retorna una resposta, juntament amb el context de referència recuperat i passat al LLM.

[**Motor de Xat**](./modules/high_level/chat_engine.md):
Un motor de xat és una canalització de cap a cap per mantenir una conversa amb les teves dades
(múltiples intercanvis en lloc d'una única pregunta i resposta).

"
