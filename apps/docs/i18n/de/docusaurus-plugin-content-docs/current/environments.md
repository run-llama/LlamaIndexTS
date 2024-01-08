---
sidebar_position: 5
---

# Umgebungen

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

LlamaIndex unterstützt derzeit offiziell NodeJS 18 und NodeJS 20.

## NextJS App Router

Wenn Sie den NextJS App Router für Routen-Handler/Serverless-Funktionen verwenden, müssen Sie den NodeJS-Modus verwenden:

```js
export const runtime = "nodejs"; // Standardwert
```
