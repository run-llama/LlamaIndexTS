# Kjerne Moduler

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

LlamaIndex.TS tilbyr flere kjerne moduler, delt inn i høy-nivå moduler for å komme raskt i gang, og lav-nivå moduler for å tilpasse nøkkelkomponenter etter behov.

## Høy-Nivå Moduler

- [**Dokument**](./high_level/documents_and_nodes.md): Et dokument representerer en tekstfil, PDF-fil eller annen sammenhengende data.

- [**Node**](./high_level/documents_and_nodes.md): Byggeklossen for data. Vanligvis er dette deler av dokumentet som er delt opp i håndterbare biter som er små nok til å mates inn i en innebygd modell og LLM.

- [**Leser/Laster**](./high_level/data_loader.md): En leser eller laster er noe som tar inn et dokument i den virkelige verden og transformerer det til en Dokumentklasse som deretter kan brukes i indeksen og spørringer. Vi støtter for øyeblikket vanlige tekstfiler og PDF-er, med mange flere som kommer.

- [**Indekser**](./high_level/data_index.md): Indekser lagrer Nodene og innkapslingene av disse nodene.

- [**Spørringsmotor**](./high_level/query_engine.md): Spørringsmotorer er det som genererer spørringen du legger inn og gir deg resultatet tilbake. Spørringsmotorer kombinerer vanligvis en forhåndsbygd ledetekst med valgte noder fra indeksen din for å gi LLM konteksten den trenger for å svare på spørringen din.

- [**ChatEngine**](./high_level/chat_engine.md): En ChatEngine hjelper deg med å bygge en chatbot som vil samhandle med indeksene dine.

## Lav-nivå Modul

- [**LLM**](./low_level/llm.md): LLM-klassen er et enhetlig grensesnitt over en stor språkmodell-leverandør som OpenAI GPT-4, Anthropic Claude eller Meta LLaMA. Du kan lage en underklasse av den for å skrive en tilkobling til din egen store språkmodell.

- [**Embedding**](./low_level/embedding.md): En embedding representeres som en vektor av flyttall. OpenAI's text-embedding-ada-002 er vår standard embedding-modell, og hver embedding den genererer består av 1 536 flyttall. En annen populær embedding-modell er BERT, som bruker 768 flyttall for å representere hver Node. Vi tilbyr en rekke verktøy for å jobbe med embeddings, inkludert 3 alternativer for beregning av likhet og Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Strategier for tekstdeling er utrolig viktige for den generelle effektiviteten til embedding-søket. For øyeblikket har vi en standardløsning, men det finnes ingen universalløsning. Avhengig av kilde dokumentene, kan du ønske å bruke forskjellige delingsstørrelser og strategier. For øyeblikket støtter vi deling etter fast størrelse, deling etter fast størrelse med overlappende seksjoner, deling etter setning og deling etter avsnitt. Tekstsplitteren brukes av NodeParser når den deler `Documenter` inn i `Noder`.

- [**Retriever**](./low_level/retriever.md): Retrieveren er det som faktisk velger Nodene som skal hentes fra indeksen. Her kan du ønske å prøve å hente flere eller færre Noder per spørring, endre likhetsfunksjonen din eller opprette din egen retriever for hver enkelt brukssak i applikasjonen din. For eksempel kan du ønske å ha en separat retriever for kodeinnhold vs. tekstinnhold.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizeren er ansvarlig for å ta en spørringsstreng og bruke en liste over `Noder` for å generere et svar. Dette kan ta mange former, som å iterere over all kontekst og forbedre et svar, eller bygge et tre av sammendrag og returnere rot-sammendraget.

- [**Storage**](./low_level/storage.md): På et tidspunkt vil du ønske å lagre indeksene dine, dataene og vektorene i stedet for å kjøre embedding-modellene hver gang. IndexStore, DocStore, VectorStore og KVStore er abstraksjoner som lar deg gjøre det. Sammen danner de StorageContext. For øyeblikket lar vi deg lagre embeddingene dine i filer på filsystemet (eller et virtuelt minnebasert filsystem), men vi legger også aktivt til integrasjoner for Vector Databaser.
