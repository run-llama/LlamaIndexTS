---
sidebar_position: 3
---

# Vysokoúrovňové koncepty

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

LlamaIndex.TS vám pomáha vytvárať aplikácie s využitím LLM (napr. Q&A, chatbot) nad vlastnými dátami.

V tomto príručke o vysokoúrovňových konceptoch sa dozviete:

- ako LLM môže odpovedať na otázky pomocou vašich vlastných dát.
- kľúčové koncepty a moduly v LlamaIndex.TS pre zostavenie vlastného dotazovacieho potrubia.

## Odpovedanie na otázky vo vašich dátach

LlamaIndex používa dvojfázovú metódu pri použití LLM s vašimi dátami:

1. **indexovacia fáza**: príprava znalostnej bázy a
2. **dotazovacia fáza**: získavanie relevantného kontextu zo znalostí na pomoc LLM pri odpovedaní na otázku

![](./_static/concepts/rag.jpg)

Tento proces je tiež známy ako Retrieval Augmented Generation (RAG).

LlamaIndex.TS poskytuje základné nástroje, ktoré vám uľahčia obidve fázy.

Pojďme si každú fázu preskúmať podrobnejšie.

### Indexovacia fáza

LlamaIndex.TS vám pomáha pri príprave znalostnej bázy pomocou sady konektorov a indexov pre dáta.

![](./_static/concepts/indexing.jpg)

[**Data Loaders**](./modules/high_level/data_loader.md):
Konektor pre dáta (tzv. `Reader`) načíta dáta z rôznych zdrojov a formátov do jednoduchej reprezentácie `Document` (text a jednoduché metadáta).

[**Dokumenty / Uzly**](./modules/high_level/documents_and_nodes.md): `Document` je všeobecný kontajner pre akýkoľvek zdroj dát - napríklad PDF, výstup z API alebo získané dáta z databázy. `Node` je atomická jednotka dát v LlamaIndex a reprezentuje "kúsok" zdrojového `Document`. Je to bohatá reprezentácia, ktorá obsahuje metadáta a vzťahy (k iným uzlom), aby umožnila presné a výstižné operácie získavania.

[**Indexy dát**](./modules/high_level/data_index.md):
Po načítaní vašich dát vám LlamaIndex pomáha indexovať ich do formátu, ktorý je ľahko vyhľadateľný.

Pod kapotou LlamaIndex analyzuje surové dokumenty do medzireprezentácií, vypočíta vektorové vloženia a ukladá vaše dáta do pamäte alebo na disk.

### Dotazovacia fáza

V dotazovacej fáze dotazovacie potrubie získava najrelevantnejší kontext na základe používateľského dotazu
a prenáša ho LLM (spolu s dotazom) na syntetizáciu odpovede.

Týmto spôsobom LLM získava aktuálne znalosti, ktoré nie sú obsiahnuté v jeho pôvodných trénovacích dátach,
(zároveň sa znižuje halucinácia).

Kľúčovou výzvou v dotazovacej fáze je získavanie, orchestrácia a logické usporiadanie (potenciálne mnohých) znalostných báz.

LlamaIndex poskytuje komponovateľné moduly, ktoré vám pomáhajú vytvárať a integrovať RAG potrubia pre Q&A (dotazovací engine), chatbot (chatovací engine) alebo ako súčasť agenta.

Tieto stavebné bloky je možné prispôsobiť podľa preferencií ohodnotenia a zostaviť tak, aby logicky usporiadali viaceré znalostné bázy.

![](./_static/concepts/querying.jpg)

#### Stavebné bloky

[**Retrievers**](./modules/low_level/retriever.md):
Retriever definuje, ako efektívne získať relevantný kontext zo znalostnej bázy (tj. indexu) na základe dotazu.
Konkrétna logika získavania sa líši pre rôzne indexy, najpopulárnejším je husté získavanie z vektorového indexu.

[**Response Synthesizers**](./modules/low_level/response_synthesizer.md):
Response Synthesizer generuje odpoveď z LLM pomocou používateľského dotazu a daného súboru získaných textových častí.

"

#### Potrubia

[**Dotazovacie enginy**](./modules/high_level/query_engine.md):
Dotazovací engine je koncové potrubie, ktoré vám umožňuje klásť otázky vo vašich dátach.
Prijať prirodzený jazykový dotaz a vrátiť odpoveď spolu s referenčným kontextom získaným a preneseným na LLM.

[**Chatovacie enginy**](./modules/high_level/chat_engine.md):
Chatovací engine je koncové potrubie pre konverzáciu s vašimi dátami
(viacnásobná vzájomná komunikácia namiesto jednoduchej otázky a odpovede).

"
