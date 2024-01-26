---
sidebar_position: 0
slug: /
---

# Vad är LlamaIndex.TS?

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

LlamaIndex.TS är ett dataramverk för LLM-applikationer för att ta emot, strukturera och få åtkomst till privata eller domänspecifika data. Även om det finns ett python-paket tillgängligt (se [här](https://docs.llamaindex.ai/en/stable/)), erbjuder LlamaIndex.TS kärnfunktioner i en enkel paket, optimerad för användning med TypeScript.

## 🚀 Varför LlamaIndex.TS?

I grunden erbjuder LLM:er ett naturligt språksgränssnitt mellan människor och infererade data. Bredvid tillgängliga modeller är förtränade på stora mängder offentligt tillgängliga data, från Wikipedia och e-postlistor till läroböcker och källkod.

Applikationer som bygger på LLM:er kräver ofta att komplettera dessa modeller med privata eller domänspecifika data. Tyvärr kan den datan vara fördelad över isolerade applikationer och datalager. Den kan finnas bakom API:er, i SQL-databaser eller fast i PDF:er och presentationsbilder.

Det är där **LlamaIndex.TS** kommer in.

## 🦙 Hur kan LlamaIndex.TS hjälpa?

LlamaIndex.TS tillhandahåller följande verktyg:

- **Datainläsning** ta emot dina befintliga `.txt`, `.pdf`, `.csv`, `.md` och `.docx` data direkt
- **Dataindex** strukturera dina data i mellanliggande representationer som är enkla och prestandaoptimerade för LLM:er att använda.
- **Motorer** ger naturlig språkåtkomst till dina data. Till exempel:
  - Frågemotorer är kraftfulla gränssnitt för återvinning av kunskapsförstärkt utdata.
  - Chattmotorer är konversationsgränssnitt för flermeddelande, "fram och tillbaka" interaktioner med dina data.

## 👨‍👩‍👧‍👦 Vem är LlamaIndex för?

LlamaIndex.TS tillhandahåller en kärnuppsättning verktyg som är nödvändiga för alla som bygger LLM-appar med JavaScript och TypeScript.

Vår högnivå-API gör att nybörjaranvändare kan använda LlamaIndex.TS för att ta emot och fråga sin data.

För mer komplexa applikationer tillåter våra lägre nivå-API:er avancerade användare att anpassa och utöka vilken modul som helst - dataanslutningar, index, hämtare och frågemotorer - för att passa deras behov.

## Komma igång

`npm install llamaindex`

Vår dokumentation inkluderar [Installationsinstruktioner](./installation.mdx) och en [Starterhandledning](./starter.md) för att bygga din första applikation.

När du är igång, ger [Högnivåkoncept](./getting_started/concepts.md) en översikt över LlamaIndex modulära arkitektur. För mer praktiska exempel, titta igenom våra [Steg-för-steg handledningar](./end_to_end.md).

## 🗺️ Ekosystem

För att ladda ner eller bidra, hitta LlamaIndex på:

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

"

## Community

Behöver du hjälp? Har du förslag på funktioner? Gå med i LlamaIndex-communityn:

- Twitter: https://twitter.com/llama_index
- Discord https://discord.gg/dGcwcsnxhU
