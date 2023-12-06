---
sidebar_position: 3
---

# Vysokoúrovňové koncepty

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

LlamaIndex.TS vám pomáhá vytvářet aplikace s podporou LLM (např. Q&A, chatbot) nad vlastními daty.

V tomto průvodci vysokoúrovňovými koncepty se dozvíte:

- jak LLM může odpovídat na otázky pomocí vašich vlastních dat.
- klíčové koncepty a moduly v LlamaIndex.TS pro sestavení vlastního dotazovacího řetězce.

## Odpovídání na otázky v rámci vašich dat

LlamaIndex používá dvoustupňovou metodu při použití LLM s vašimi daty:

1. **indexační fáze**: příprava znalostní báze a
2. **dotazovací fáze**: získání relevantního kontextu z informací, které pomohou LLM odpovědět na otázku

![](./_static/concepts/rag.jpg)

Tento proces je také známý jako Retrieval Augmented Generation (RAG).

LlamaIndex.TS poskytuje základní nástroje, které vám usnadní oba kroky.

Pojďme si každou fázi prozkoumat podrobněji.

### Indexační fáze

LlamaIndex.TS vám pomáhá připravit znalostní bázi pomocí sady konektorů a indexů dat.

![](./_static/concepts/indexing.jpg)

[**Datoví načítadla**](./modules/high_level/data_loader.md):
Datový konektor (tzv. `Reader`) načítá data z různých zdrojů dat a formátů do jednoduché reprezentace `Document` (text a jednoduchá metadata).

[**Dokumenty / Uzly**](./modules/high_level/documents_and_nodes.md): `Document` je obecný kontejner pro jakýkoli zdroj dat - například PDF, výstup z API nebo načtená data z databáze. `Node` je atomická jednotka dat v LlamaIndex a představuje "část" zdrojového `Document`. Jedná se o bohatou reprezentaci, která zahrnuje metadata a vztahy (k ostatním uzlům), aby umožnila přesné a výstižné operace získávání.

[**Indexy dat**](./modules/high_level/data_index.md):
Jakmile jste načetli svá data, LlamaIndex vám pomáhá indexovat data do formátu, který je snadno získatelný.

Pod pokličkou LlamaIndex analyzuje nezpracované dokumenty do mezireprezentací, vypočítá vektorová vnoření a ukládá vaše data do paměti nebo na disk.

"

### Dotazovací fáze

V dotazovací fázi dotazovací řetězec získává nejrelevantnější kontext na základě uživatelského dotazu
a předává ho LLM (spolu s dotazem) k syntéze odpovědi.

Tímto způsobem LLM získává aktuální znalosti, které nejsou obsaženy v jeho původních trénovacích datech,
(což také snižuje halucinace).

Klíčovou výzvou v dotazovací fázi je získávání, orchestrace a dedukce z (potenciálně mnoha) znalostních bází.

LlamaIndex poskytuje komponovatelné moduly, které vám pomáhají sestavit a integrovat RAG řetězce pro Q&A (dotazovací engine), chatbot (chatovací engine) nebo jako součást agenta.

Tyto stavební bloky lze přizpůsobit tak, aby odrážely preference ohodnocování a byly sestaveny tak, aby dedukovaly z více znalostních bází strukturovaným způsobem.

![](./_static/concepts/querying.jpg)

#### Stavební bloky

[**Retrievery**](./modules/low_level/retriever.md):
Retriever definuje, jak efektivně získat relevantní kontext z znalostní báze (tj. indexu) na základě dotazu.
Konkrétní logika získávání se liší pro různé indexy, nejpopulárnější je husté získávání pomocí vektorového indexu.

[**Syntetizátory odpovědí**](./modules/low_level/response_synthesizer.md):
Syntetizátor odpovědí generuje odpověď z LLM pomocí uživatelského dotazu a daného souboru získaných textových částí.

"

#### Řetězce

[**Dotazovací enginy**](./modules/high_level/query_engine.md):
Dotazovací engine je koncový řetězec, který vám umožňuje klást otázky nad vašimi daty.
Přijímá dotaz v přirozeném jazyce a vrací odpověď spolu s referenčním kontextem získaným a předaným LLM.

[**Chatovací enginy**](./modules/high_level/chat_engine.md):
Chatovací engine je koncový řetězec pro konverzaci s vašimi daty
(více vzájemných otázek a odpovědí namísto jedné otázky a odpovědi).

"
