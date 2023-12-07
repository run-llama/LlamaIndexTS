---
sidebar_position: 3
---

# Høynivåkonsepter

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

LlamaIndex.TS hjelper deg med å bygge LLM-drevne applikasjoner (f.eks. spørsmål og svar, chatbot) over egendefinerte data.

I denne veiledningen om høynivåkonsepter vil du lære:

- hvordan en LLM kan svare på spørsmål ved hjelp av dine egne data.
- nøkkelkonsepter og moduler i LlamaIndex.TS for å komponere din egen spørringspipeline.

## Å svare på spørsmål over dine data

LlamaIndex bruker en todelt metode når du bruker en LLM med dine data:

1. **indekseringsstadiet**: forbereder en kunnskapsbase, og
2. **spørringsstadiet**: henter relevant kontekst fra kunnskapen for å hjelpe LLM-en med å svare på et spørsmål

![](./_static/concepts/rag.jpg)

Denne prosessen er også kjent som Retrieval Augmented Generation (RAG).

LlamaIndex.TS gir deg det essensielle verktøyet for å gjøre begge trinnene superenkelt.

La oss utforske hvert trinn i detalj.

### Indekseringsstadiet

LlamaIndex.TS hjelper deg med å forberede kunnskapsbasen med en pakke med datakoblinger og indekser.

![](./_static/concepts/indexing.jpg)

[**Datainnlastere**](./modules/high_level/data_loader.md):
En datakobling (dvs. `Reader`) henter data fra forskjellige datakilder og dataformater inn i en enkel `Document`-representasjon (tekst og enkel metadata).

[**Dokumenter / Noder**](./modules/high_level/documents_and_nodes.md): Et `Document` er en generisk beholder for hvilken som helst datakilde - for eksempel en PDF, en API-utgang eller hentede data fra en database. En `Node` er den atomære enheten av data i LlamaIndex og representerer en "chunk" av en kilde `Document`. Det er en rik representasjon som inkluderer metadata og relasjoner (til andre noder) for å muliggjøre nøyaktige og uttrykksfulle hentingsoperasjoner.

[**Dataindekser**](./modules/high_level/data_index.md):
Når du har lastet inn dataene dine, hjelper LlamaIndex deg med å indeksere dataene i et format som er enkelt å hente.

Under panseret analyserer LlamaIndex de rå dokumentene til mellomliggende representasjoner, beregner vektorembbedinger og lagrer dataene dine i minnet eller på disk.

### Spørringsstadiet

I spørringsstadiet henter spørringspipelinen den mest relevante konteksten gitt en brukerspørring,
og sender den til LLM-en (sammen med spørringen) for å syntetisere et svar.

Dette gir LLM-en oppdatert kunnskap som ikke er i dens opprinnelige treningsdata,
(reduserer også hallusinasjoner).

Den største utfordringen i spørringsstadiet er henting, orkestrering og resonnement over (potensielt mange) kunnskapsbaser.

LlamaIndex tilbyr sammensetningsbare moduler som hjelper deg med å bygge og integrere RAG-pipeliner for spørsmål og svar (spørringsmotor), chatbot (chatmotor), eller som en del av en agent.

Disse byggeklossene kan tilpasses for å gjenspeile rangeringspreferanser, samt sammensettes for å resonnere over flere kunnskapsbaser på en strukturert måte.

![](./_static/concepts/querying.jpg)

#### Byggeklosser

[**Retrievers**](./modules/low_level/retriever.md):
En retriever definerer hvordan man effektivt henter relevant kontekst fra en kunnskapsbase (dvs. indeks) når man har en spørring.
Den spesifikke hentelogikken varierer for forskjellige indekser, hvor den mest populære er tett henting mot en vektorindeks.

[**Response Synthesizers**](./modules/low_level/response_synthesizer.md):
En response synthesizer genererer et svar fra en LLM ved hjelp av en brukerspørring og en gitt mengde hentede tekstbiter.

"

#### Pipeliner

[**Spørringsmotorer**](./modules/high_level/query_engine.md):
En spørringsmotor er en helhetlig pipeline som lar deg stille spørsmål om dine data.
Den tar imot en naturlig språkspørring og returnerer et svar, sammen med referansekonteksten som er hentet og sendt til LLM-en.

[**Chatmotorer**](./modules/high_level/chat_engine.md):
En chatmotor er en helhetlig pipeline for å ha en samtale med dine data
(flere frem-og-tilbake i stedet for et enkelt spørsmål og svar).

"
