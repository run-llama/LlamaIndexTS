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

e você precisará adicionar uma exceção para o pdf-parse no seu next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Coloca o pdf-parse no modo NodeJS real com o Roteador de Aplicativos NextJS
  },
};

module.exports = nextConfig;
```
