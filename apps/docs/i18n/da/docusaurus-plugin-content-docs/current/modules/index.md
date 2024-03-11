# Kerne Moduler

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

LlamaIndex.TS tilbyder flere kerne moduler, opdelt i højniveau moduler til hurtig opstart og lavniveau moduler til tilpasning af nøglekomponenter efter behov.

## Højniveau Moduler

- [**Dokument**](./high_level/documents_and_nodes.md): Et dokument repræsenterer en tekstfil, PDF-fil eller anden sammenhængende data.

- [**Node**](./high_level/documents_and_nodes.md): Den grundlæggende databyggesten. Typisk er disse dele af dokumentet opdelt i håndterbare stykker, der er små nok til at blive fodret ind i en indlejringsmodel og LLM.

- [**Læser/Indlæser**](./high_level/data_loader.md): En læser eller indlæser er noget, der tager et dokument i den virkelige verden og omdanner det til en Dokumentklasse, der derefter kan bruges i din Indeks og forespørgsler. Vi understøtter i øjeblikket almindelige tekstfiler og PDF'er med mange flere på vej.

- [**Indeks**](./high_level/data_index.md): Indeks gemmer Noderne og indlejringerne af disse noder.

- [**Forespørgselsmotor**](./high_level/query_engine.md): Forespørgselsmotorer genererer den forespørgsel, du indtaster, og giver dig resultatet tilbage. Forespørgselsmotorer kombinerer generelt en forudbygget prompt med valgte noder fra dit Indeks for at give LLM'en den kontekst, den har brug for for at besvare din forespørgsel.

- [**Chatmotor**](./high_level/chat_engine.md): En Chatmotor hjælper dig med at opbygge en chatbot, der vil interagere med dine Indeks.

## Lavniveau Modul

- [**LLM**](./low_level/llm.md): LLM klassen er et forenet interface over en stor sprogmodeludbyder som f.eks. OpenAI GPT-4, Anthropic Claude eller Meta LLaMA. Du kan nedarve den for at skrive en forbindelse til din egen store sprogmodel.

- [**Embedding**](./low_level/embedding.md): En embedding repræsenteres som en vektor af flydende punkt tal. OpenAI's text-embedding-ada-002 er vores standard embedding model, og hver embedding den genererer består af 1.536 flydende punkt tal. En anden populær embedding model er BERT, som bruger 768 flydende punkt tal til at repræsentere hver Node. Vi tilbyder en række hjælpeværktøjer til at arbejde med embeddings, herunder 3 muligheder for beregning af lighed og Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Tekstopdelingsstrategier er utroligt vigtige for den overordnede effektivitet af embedding søgningen. I øjeblikket har vi en standard, men der er ingen universel løsning. Afhængigt af kildedokumenterne kan du ønske at bruge forskellige opdelingsstørrelser og strategier. I øjeblikket understøtter vi opdeling efter fast størrelse, opdeling efter fast størrelse med overlappende sektioner, opdeling efter sætning og opdeling efter afsnit. Tekstopdeleren bruges af NodeParseren til at opdele `Dokumenter` i `Noder`.

- [**Retriever**](./low_level/retriever.md): Retrieveren er det, der faktisk vælger Noderne, der skal hentes fra indekset. Her kan du ønske at prøve at hente flere eller færre Noder pr. forespørgsel, ændre din lighedsfunktion eller oprette din egen retriever til hver enkelt brugssag i din applikation. For eksempel kan du ønske at have en separat retriever til kodeindhold vs. tekstindhold.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizeren er ansvarlig for at tage en forespørgselsstreng og bruge en liste af `Noder` til at generere et svar. Dette kan tage mange former, som f.eks. at iterere over al kontekst og forfine et svar eller opbygge et træ af sammenfatninger og returnere roden.

- [**Storage**](./low_level/storage.md): På et tidspunkt vil du gerne gemme dine indekser, data og vektorer i stedet for at køre embedding modellerne hver gang. IndexStore, DocStore, VectorStore og KVStore er abstraktioner, der giver dig mulighed for at gøre det. Sammen udgør de StorageContext. I øjeblikket tillader vi dig at gemme dine embeddings i filer på filsystemet (eller et virtuelt hukommelsesbaseret filsystem), men vi tilføjer også aktivt integrationer til Vector Databaser.
