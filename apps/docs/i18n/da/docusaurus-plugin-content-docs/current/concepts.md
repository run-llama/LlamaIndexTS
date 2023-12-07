---
sidebar_position: 3
---

# Højtstående Koncepter

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

LlamaIndex.TS hjælper dig med at opbygge LLM-drevne applikationer (f.eks. Q&A, chatbot) over brugerdefinerede data.

I denne guide til højtstående koncepter vil du lære:

- hvordan en LLM kan besvare spørgsmål ved hjælp af dine egne data.
- centrale begreber og moduler i LlamaIndex.TS til sammensætning af din egen forespørgselspipeline.

## Besvarelse af spørgsmål på tværs af dine data

LlamaIndex bruger en totrinsmetode, når du bruger en LLM med dine data:

1. **indekseringsfase**: forberedelse af en vidensbase, og
2. **forespørgselsfase**: hentning af relevant kontekst fra viden for at hjælpe LLM med at svare på et spørgsmål

![](./_static/concepts/rag.jpg)

Denne proces er også kendt som Retrieval Augmented Generation (RAG).

LlamaIndex.TS giver det essentielle værktøjssæt til at gøre begge trin super nemme.

Lad os udforske hver fase i detaljer.

### Indekseringsfase

LlamaIndex.TS hjælper dig med at forberede vidensbasen med en række dataforbindelser og indekser.

![](./_static/concepts/indexing.jpg)

[**Dataindlæsere**](./modules/high_level/data_loader.md):
En dataforbindelse (dvs. `Reader`) indlæser data fra forskellige datakilder og dataformater i en simpel `Document`-repræsentation (tekst og simpel metadata).

[**Dokumenter / Noder**](./modules/high_level/documents_and_nodes.md): Et `Document` er en generisk beholder omkring enhver datakilde - for eksempel en PDF, en API-udgang eller hentede data fra en database. En `Node` er den atomare enhed af data i LlamaIndex og repræsenterer en "chunk" af en kilde-`Document`. Det er en rig repræsentation, der inkluderer metadata og relationer (til andre noder) for at muliggøre præcise og udtryksfulde hentningsoperationer.

[**Dataindeks**](./modules/high_level/data_index.md):
Når du har indlæst dine data, hjælper LlamaIndex dig med at indeksere data i et format, der er nemt at hente.

Under motorhjelmen analyserer LlamaIndex de rå dokumenter til mellemliggende repræsentationer, beregner vektorindlejringer og gemmer dine data i hukommelsen eller på disken.

"

### Forespørgselsfase

I forespørgselsfasen henter forespørgselspipelinen den mest relevante kontekst ud fra en brugerforespørgsel,
og sender det til LLM'en (sammen med forespørgslen) for at syntetisere et svar.

Dette giver LLM'en opdateret viden, der ikke er i dens oprindelige træningsdata,
(samtidig med at hallucination reduceres).

Den største udfordring i forespørgselsfasen er hentning, orkestrering og ræsonnement over (potentielt mange) vidensbaser.

LlamaIndex tilbyder sammensættelige moduler, der hjælper dig med at opbygge og integrere RAG-pipeliner til Q&A (forespørgselsmotor), chatbot (chatmotor) eller som en del af en agent.

Disse byggeklodser kan tilpasses til at afspejle rangeringspræferencer samt sammensættes til at ræsonnere over flere vidensbaser på en struktureret måde.

![](./_static/concepts/querying.jpg)

#### Byggeklodser

[**Retrievers**](./modules/low_level/retriever.md):
En retriever definerer, hvordan man effektivt henter relevant kontekst fra en vidensbase (dvs. indeks), når der gives en forespørgsel.
Den specifikke hentelogik varierer for forskellige indeks, hvoraf den mest populære er tæt hentning mod en vektorindeks.

[**Response Synthesizers**](./modules/low_level/response_synthesizer.md):
En response synthesizer genererer et svar fra en LLM ved hjælp af en brugerforespørgsel og en given mængde hentede tekststykker.

"

#### Pipelines

[**Forespørgselsmotorer**](./modules/high_level/query_engine.md):
En forespørgselsmotor er en end-to-end pipeline, der giver dig mulighed for at stille spørgsmål om dine data.
Den modtager en naturligt sprog forespørgsel og returnerer et svar sammen med den hentede referencekontekst, der sendes til LLM'en.

[**Chatmotorer**](./modules/high_level/chat_engine.md):
En chatmotor er en end-to-end pipeline til at føre en samtale med dine data
(flere frem-og-tilbage i stedet for et enkelt spørgsmål og svar).

"
