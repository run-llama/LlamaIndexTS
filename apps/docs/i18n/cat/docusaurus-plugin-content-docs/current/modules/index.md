# Mòduls principals

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

LlamaIndex.TS ofereix diversos mòduls principals, separats en mòduls de nivell alt per començar ràpidament i mòduls de nivell baix per personalitzar els components clau segons les teves necessitats.

## Mòduls de Nivell Alt

- [**Document**](./high_level/documents_and_nodes.md): Un document representa un fitxer de text, un fitxer PDF o una altra peça de dades contínua.

- [**Node**](./high_level/documents_and_nodes.md): El bloc de construcció de dades bàsic. Normalment, aquests són parts del document dividides en peces manejables que són prou petites per ser alimentades a un model d'incrustació i LLM.

- [**Reader/Loader**](./high_level/data_loader.md): Un lector o carregador és quelcom que pren un document del món real i el transforma en una classe Document que després es pot utilitzar en el teu índex i consultes. Actualment, donem suport a fitxers de text pla i PDFs, i en el futur en donarem suport a molts més.

- [**Índexs**](./high_level/data_index.md): els índexs emmagatzemen els Nodes i les incrustacions d'aquests nodes.

- [**Motor de Consulta**](./high_level/query_engine.md): Els motors de consulta són els que generen la consulta que introduïu i us retornen el resultat. Els motors de consulta generalment combinen una indicació predefinida amb nodes seleccionats del vostre índex per donar al LLM el context que necessita per respondre a la vostra consulta.

- [**Motor de Xat**](./high_level/chat_engine.md): Un motor de xat us ajuda a construir un chatbot que interactuarà amb els vostres índexs.

## Mòdul de nivell baix

- [**LLM**](./low_level/llm.md): La classe LLM és una interfície unificada per a un proveïdor de models de llenguatge gran com OpenAI GPT-4, Anthropic Claude o Meta LLaMA. Pots crear una subclasse per escriure un connector per al teu propi model de llenguatge gran.

- [**Embedding**](./low_level/embedding.md): Un embedding es representa com un vector de nombres de punt flotant. El nostre model d'embedding per defecte és el text-embedding-ada-002 de OpenAI i cada embedding que genera consisteix en 1.536 nombres de punt flotant. Un altre model d'embedding popular és BERT, que utilitza 768 nombres de punt flotant per representar cada node. Proporcionem diverses utilitats per treballar amb embeddings, incloent-hi 3 opcions de càlcul de similitud i Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Les estratègies de divisió de text són increïblement importants per a l'eficàcia global de la cerca d'embedding. Actualment, tot i que tenim una opció per defecte, no hi ha una solució única per a tots els casos. Depenent dels documents font, potser voldràs utilitzar diferents mides i estratègies de divisió. Actualment, donem suport a la divisió per mida fixa, la divisió per mida fixa amb seccions superposades, la divisió per frases i la divisió per paràgrafs. El text splitter s'utilitza pel NodeParser per dividir els `Document`s en `Node`s.

- [**Retriever**](./low_level/retriever.md): El Retriever és el que decideix quins Nodes recuperar de l'índex. Aquí, potser voldràs provar a recuperar més o menys Nodes per consulta, canviar la funció de similitud o crear el teu propi retriever per a cada cas d'ús individual de l'aplicació. Per exemple, potser voldràs tenir un retriever separat per al contingut de codi i el contingut de text.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): El ResponseSynthesizer és responsable de prendre una cadena de consulta i utilitzar una llista de `Node`s per generar una resposta. Això pot prendre diverses formes, com iterar sobre tot el context i refinar una resposta o construir un arbre de resums i retornar el resum principal.

- [**Storage**](./low_level/storage.md): En algun moment, voldràs emmagatzemar els teus índexs, dades i vectors en comptes d'executar els models d'embedding cada vegada. IndexStore, DocStore, VectorStore i KVStore són abstraccions que et permeten fer-ho. En conjunt, formen el StorageContext. Actualment, et permetem persistir els teus embeddings en fitxers al sistema de fitxers (o en un sistema de fitxers virtual a la memòria), però també estem afegint activament integracions amb bases de dades de vectors.
