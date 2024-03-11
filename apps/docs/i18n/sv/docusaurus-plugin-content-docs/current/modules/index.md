# Kärnmoduler

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

LlamaIndex.TS erbjuder flera kärnmoduler, uppdelade i högnivåmoduler för att snabbt komma igång och lågnivåmoduler för att anpassa nyckelkomponenter efter behov.

## Högnivåmoduler

- [**Dokument**](./high_level/documents_and_nodes.md): Ett dokument representerar en textfil, PDF-fil eller annan sammanhängande data.

- [**Nod**](./high_level/documents_and_nodes.md): Den grundläggande byggstenen för data. Vanligtvis är dessa delar av dokumentet uppdelade i hanterbara bitar som är tillräckligt små för att matas in i en inbäddningsmodell och LLM.

- [**Läsare/Laddare**](./high_level/data_loader.md): En läsare eller laddare är något som tar emot ett dokument i den verkliga världen och omvandlar det till en dokumentklass som sedan kan användas i din Index och förfrågningar. För närvarande stöder vi vanliga textfiler och PDF-filer med många fler på gång.

- [**Index**](./high_level/data_index.md): Index lagrar Noderna och inbäddningarna av dessa noder.

- [**Frågemotor**](./high_level/query_engine.md): Frågemotorer genererar den förfrågan du skickar in och ger dig tillbaka resultatet. Frågemotorer kombinerar vanligtvis en förbyggd ledtråd med valda noder från din Index för att ge LLM:en den kontext den behöver för att svara på din förfrågan.

- [**Chattmotor**](./high_level/chat_engine.md): En chattmotor hjälper dig att bygga en chattbot som kommer att interagera med dina Index.

## Lågnivåmodul

- [**LLM**](./low_level/llm.md): Klassen LLM är ett enhetligt gränssnitt över en stor språkmodellsleverantör som OpenAI GPT-4, Anthropic Claude eller Meta LLaMA. Du kan ärva från den för att skriva en anslutning till din egen stora språkmodell.

- [**Inbäddning**](./low_level/embedding.md): En inbäddning representeras som en vektor av flyttal. OpenAI:s text-embedding-ada-002 är vår standardinbäddningsmodell och varje inbäddning den genererar består av 1 536 flyttal. En annan populär inbäddningsmodell är BERT som använder 768 flyttal för att representera varje nod. Vi tillhandahåller ett antal verktyg för att arbeta med inbäddningar, inklusive 3 alternativ för likhetsberäkning och Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Strategier för textuppdelning är otroligt viktiga för den övergripande effektiviteten hos inbäddningssökningen. För närvarande har vi en standardlösning, men det finns ingen universallösning. Beroende på källmaterialen kan du vilja använda olika uppdelningsstorlekar och strategier. För närvarande stöder vi uppdelning efter fast storlek, uppdelning efter fast storlek med överlappande sektioner, uppdelning efter mening och uppdelning efter stycke. Textuppdelaren används av NodeParser när den delar upp `Dokument` i `Noder`.

- [**Retriever**](./low_level/retriever.md): Retrievern är den som faktiskt väljer vilka noder som ska hämtas från indexet. Här kan du vilja försöka hämta fler eller färre noder per fråga, ändra din likhetsfunktion eller skapa din egen retriever för varje enskilt användningsfall i din applikation. Till exempel kan du vilja ha en separat retriever för kodinnehåll jämfört med textinnehåll.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizern är ansvarig för att ta en frågesträng och använda en lista med `Noder` för att generera ett svar. Detta kan ta olika former, som att iterera över allt sammanhang och förbättra ett svar, eller bygga ett träd av sammanfattningar och returnera rotsammanfattningen.

- [**Lagring**](./low_level/storage.md): Förr eller senare kommer du att vilja lagra dina index, data och vektorer istället för att köra inbäddningsmodellerna varje gång. IndexStore, DocStore, VectorStore och KVStore är abstraktioner som låter dig göra det. Tillsammans bildar de StorageContext. För närvarande tillåter vi dig att spara dina inbäddningar i filer på filsystemet (eller ett virtuellt filsystem i minnet), men vi lägger också aktivt till integrationer med vektor-databaser.
