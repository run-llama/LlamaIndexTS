---
sidebar_position: 3
---

# QueryEngine (Dotazovací engine)

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

Dotazovací engine obaluje `Retriever` a `ResponseSynthesizer` do potrubí, které použije řetězec dotazu k získání uzlů a poté je odešle do LLM pro generování odpovědi.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("řetězec dotazu");
```

## Dotazovací engine pro poddotazy

Základní koncept Dotazovacího engine pro poddotazy spočívá v rozdělení jednoho dotazu na více dotazů, získání odpovědi na každý z těchto dotazů a následné kombinaci těchto různých odpovědí do jedné soudržné odpovědi pro uživatele. Můžete si to představit jako techniku "promyslete to krok za krokem", ale s iterací přes zdroje dat!

### Začínáme

Nejjednodušší způsob, jak začít vyzkoušet Dotazovací engine pro poddotazy, je spustit soubor subquestion.ts v adresáři [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Nástroje

Dotazovací engine pro poddotazy je implementován pomocí nástrojů (Tools). Základní myšlenkou nástrojů je, že jsou to proveditelné možnosti pro velký jazykový model. V tomto případě se náš Dotazovací engine pro poddotazy spoléhá na nástroj QueryEngineTool, který, jak jste si již domysleli, je nástrojem pro spouštění dotazů na Dotazovací engine. To nám umožňuje modelu nabídnout možnost dotazovat se na různé dokumenty pro různé otázky například. Můžete si také představit, že Dotazovací engine pro poddotazy může použít nástroj, který vyhledává něco na webu nebo získává odpověď pomocí Wolfram Alpha.

Více informací o nástrojích najdete v dokumentaci k LlamaIndex Python na adrese https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API Reference (Odkazy na rozhraní API)

- [RetrieverQueryEngine (Dotazovací engine pro získávání)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Dotazovací engine pro poddotazy)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Nástroj pro dotazovací engine)](../../api/interfaces/QueryEngineTool.md)
