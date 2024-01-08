---
sidebar_position: 5
---

# Ambientes

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

O LlamaIndex atualmente suporta oficialmente o NodeJS 18 e o NodeJS 20.

## Roteador de Aplicativos NextJS

Se você estiver usando os manipuladores de rota/funções serverless do Roteador de Aplicativos NextJS, você precisará usar o modo NodeJS:

```js
export const runtime = "nodejs"; // padrão
```
