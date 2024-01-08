---
sidebar_position: 5
---

# Omgevingen

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

LlamaIndex ondersteunt momenteel officieel NodeJS 18 en NodeJS 20.

## NextJS App Router

Als je NextJS App Router route handlers/serverless functies gebruikt, moet je de NodeJS-modus gebruiken:

```js
export const runtime = "nodejs"; // standaard
```
