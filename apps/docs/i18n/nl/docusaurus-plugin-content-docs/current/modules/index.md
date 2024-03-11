# Kernmodules

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

LlamaIndex.TS biedt verschillende kernmodules aan, onderverdeeld in modules op hoog niveau om snel aan de slag te gaan, en modules op laag niveau om belangrijke componenten aan te passen zoals u dat wilt.

## Modules op Hoog Niveau

- [**Document**](./high_level/documents_and_nodes.md): Een document vertegenwoordigt een tekstbestand, PDF-bestand of een ander aaneengesloten stuk gegevens.

- [**Node**](./high_level/documents_and_nodes.md): Het basisgegevensblok. Meestal zijn dit delen van het document die in beheersbare stukken zijn verdeeld en klein genoeg zijn om in een insluitingsmodel en LLM te worden gevoed.

- [**Reader/Loader**](./high_level/data_loader.md): Een lezer of lader is iets dat een document uit de echte wereld inneemt en omzet in een Document-klasse die vervolgens kan worden gebruikt in uw Index en query's. We ondersteunen momenteel platte tekstbestanden en PDF's, met nog veel meer in de toekomst.

- [**Indexes**](./high_level/data_index.md): Indexen slaan de Nodes en de insluitingen van die nodes op.

- [**QueryEngine**](./high_level/query_engine.md): Query-engines genereren de query die u invoert en geven u het resultaat terug. Query-engines combineren doorgaans een vooraf gebouwde prompt met geselecteerde nodes uit uw Index om de LLM de context te geven die nodig is om uw query te beantwoorden.

- [**ChatEngine**](./high_level/chat_engine.md): Een ChatEngine helpt u bij het bouwen van een chatbot die zal communiceren met uw Indexen.

## Module op Laag Niveau

- [**LLM**](./low_level/llm.md): De LLM-klasse is een uniforme interface voor een grote taalmodelprovider zoals OpenAI GPT-4, Anthropic Claude of Meta LLaMA. U kunt deze subklasseren om een verbinding te maken met uw eigen grote taalmodel.

- [**Embedding**](./low_level/embedding.md): Een embedding wordt weergegeven als een vector van zwevende komma getallen. OpenAI's text-embedding-ada-002 is ons standaard embeddingmodel en elke embedding die het genereert bestaat uit 1.536 zwevende komma getallen. Een ander populair embeddingmodel is BERT, dat 768 zwevende komma getallen gebruikt om elke Node voor te stellen. We bieden een aantal hulpprogramma's om met embeddings te werken, waaronder 3 opties voor het berekenen van gelijkenis en Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Strategieën voor het splitsen van tekst zijn ontzettend belangrijk voor de algehele effectiviteit van de embedding-zoekopdracht. Momenteel hebben we wel een standaard, maar er is geen universele oplossing. Afhankelijk van de bronbestanden wilt u mogelijk verschillende splitsingsgroottes en -strategieën gebruiken. Momenteel ondersteunen we splitsing op basis van vaste grootte, splitsing op basis van vaste grootte met overlappende secties, splitsing op basis van zin en splitsing op basis van alinea. De tekstsplitter wordt gebruikt door de NodeParser bij het splitsen van `Documenten` in `Nodes`.

- [**Retriever**](./low_level/retriever.md): De Retriever is degene die daadwerkelijk de Nodes kiest die uit de index moeten worden opgehaald. Hier kunt u ervoor kiezen om meer of minder Nodes per query op te halen, uw gelijkheidsfunctie te wijzigen of uw eigen retriever te maken voor elk individueel gebruiksscenario in uw toepassing. Bijvoorbeeld, u kunt ervoor kiezen om een aparte retriever te hebben voor code-inhoud versus tekstinhoud.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): De ResponseSynthesizer is verantwoordelijk voor het nemen van een zoekopdrachtstring en het gebruik van een lijst met `Nodes` om een antwoord te genereren. Dit kan verschillende vormen aannemen, zoals het itereren over alle context en het verfijnen van een antwoord, of het opbouwen van een boom van samenvattingen en het retourneren van de hoofdsamenvatting.

- [**Storage**](./low_level/storage.md): Op een gegeven moment wilt u uw indexen, gegevens en vectoren opslaan in plaats van de embeddingmodellen telkens opnieuw uit te voeren. IndexStore, DocStore, VectorStore en KVStore zijn abstracties waarmee u dat kunt doen. Samen vormen ze de StorageContext. Momenteel kunt u uw embeddings opslaan in bestanden op het bestandssysteem (of een virtueel in-memory bestandssysteem), maar we voegen ook actief integraties toe met Vector Databases.
