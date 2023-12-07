---
sidebar_position: 3
---

# QueryEngine (Motor de interogare)

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

Un motor de interogare încapsulează un `Retriever` și un `ResponseSynthesizer` într-un șir de procese, care va utiliza șirul de interogare pentru a obține nodurile și apoi le va trimite la LLM pentru a genera un răspuns.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("șir de interogare");
```

## Motor de interogare pentru subîntrebări

Conceptul de bază al Motorului de interogare pentru subîntrebări constă în împărțirea unei singure interogări în mai multe interogări, obținerea unui răspuns pentru fiecare dintre aceste interogări și apoi combinarea acestor răspunsuri diferite într-un singur răspuns coerent pentru utilizator. Puteți să-l considerați ca pe o tehnică de prompt "gândește-te la asta pas cu pas", dar iterând prin sursele de date!

### Începerea utilizării

Cel mai simplu mod de a începe să încercați Motorul de interogare pentru subîntrebări este să rulați fișierul subquestion.ts din [exemple](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Instrumente

Motorul de interogare pentru subîntrebări este implementat cu ajutorul Instrumentelor. Ideea de bază a Instrumentelor este că acestea sunt opțiuni executabile pentru modelul de limbă mare. În acest caz, Motorul de interogare pentru subîntrebări se bazează pe QueryEngineTool, care, așa cum ați ghicit, este un instrument pentru a rula interogări pe un Motor de interogare. Acest lucru ne permite să oferim modelului o opțiune de a interoga diferite documente pentru diferite întrebări, de exemplu. De asemenea, puteți să vă imaginați că Motorul de interogare pentru subîntrebări ar putea utiliza un Instrument care caută ceva pe web sau obține un răspuns folosind Wolfram Alpha.

Puteți afla mai multe despre Instrumente consultând documentația Python LlamaIndex https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## Referință API

- [RetrieverQueryEngine (Motor de interogare Retriever)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Motor de interogare SubQuestion)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Instrument Motor de interogare)](../../api/interfaces/QueryEngineTool.md)

"
