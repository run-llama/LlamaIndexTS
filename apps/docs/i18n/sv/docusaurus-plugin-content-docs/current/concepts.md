---
sidebar_position: 3
---

# Hög nivå koncept

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

LlamaIndex.TS hjälper dig att bygga LLM-drivna applikationer (t.ex. Q&A, chatbot) över anpassade data.

I denna guide om högnivåkoncept kommer du att lära dig:

- hur en LLM kan svara på frågor med hjälp av dina egna data.
- nyckelkoncept och moduler i LlamaIndex.TS för att komponera din egen frågepipeline.

## Att svara på frågor över dina data

LlamaIndex använder en tvåstegsmetod när du använder en LLM med dina data:

1. **indexeringssteg**: förbereder en kunskapsbas, och
2. **frågesteg**: hämtar relevant kontext från kunskapen för att hjälpa LLM:en att svara på en fråga.

![](./_static/concepts/rag.jpg)

Denna process kallas också Retrieval Augmented Generation (RAG).

LlamaIndex.TS tillhandahåller det nödvändiga verktyget för att göra båda stegen superenkla.

Låt oss utforska varje steg i detalj.

### Indexeringssteg

LlamaIndex.TS hjälper dig att förbereda kunskapsbasen med en uppsättning dataanslutningar och index.

![](./_static/concepts/indexing.jpg)

[**Data Loaders**](./modules/high_level/data_loader.md):
En dataanslutning (t.ex. `Reader`) tar in data från olika datakällor och dataformat och representerar det som en enkel `Document` (text och enkel metadata).

[**Dokument / Noder**](./modules/high_level/documents_and_nodes.md): Ett `Document` är en generisk behållare för vilken datakälla som helst - till exempel en PDF, en API-utdata eller hämtad data från en databas. En `Node` är den atomära enheten av data i LlamaIndex och representerar en "bit" av en källa `Document`. Det är en rik representation som inkluderar metadata och relationer (till andra noder) för att möjliggöra exakta och uttrycksfulla hämtningsoperationer.

[**Dataindex**](./modules/high_level/data_index.md):
När du har tagit in dina data hjälper LlamaIndex dig att indexera data i ett format som är lätt att hämta.

Under huven parser LlamaIndex de råa dokumenten till mellanliggande representationer, beräknar vektorinbäddningar och lagrar dina data i minnet eller på disk.

### Frågesteg

I frågestadiet hämtar frågepipelinen den mest relevanta kontexten med hjälp av en användarfråga,
och skickar den till LLM:en (tillsammans med frågan) för att syntetisera ett svar.

Detta ger LLM:en uppdaterad kunskap som inte finns i dess ursprungliga träningsdata,
(samtidigt som hallucination minskas).

Den största utmaningen i frågestadiet är att hämta, orkestrera och resonera över (potentiellt många) kunskapsbaser.

LlamaIndex tillhandahåller komponerbara moduler som hjälper dig att bygga och integrera RAG-pipelines för Q&A (frågemotor), chatbot (chattmotor) eller som en del av en agent.

Dessa byggstenar kan anpassas för att återspegla rangordningspreferenser och komponeras för att resonera över flera kunskapsbaser på ett strukturerat sätt.

![](./_static/concepts/querying.jpg)

#### Byggstenar

[**Retrievers**](./modules/low_level/retriever.md):
En retriever definierar hur man effektivt hämtar relevant kontext från en kunskapsbas (dvs. index) när man har en fråga.
Den specifika hämtlogiken skiljer sig åt för olika index, där den mest populära är tät hämtning mot en vektorindex.

[**Response Synthesizers**](./modules/low_level/response_synthesizer.md):
En response synthesizer genererar ett svar från en LLM med hjälp av en användarfråga och en given uppsättning hämtade textfragment.

"

#### Pipelines

[**Frågemotorer**](./modules/high_level/query_engine.md):
En frågemotor är en helhetspipeline som låter dig ställa frågor om dina data.
Den tar emot en naturlig språkfråga och returnerar ett svar, tillsammans med referenskontext som hämtats och skickats till LLM:en.

[**Chattmotorer**](./modules/high_level/chat_engine.md):
En chattmotor är en helhetspipeline för att ha en konversation med dina data
(flera fram och tillbaka istället för en enda fråga och svar).

"
