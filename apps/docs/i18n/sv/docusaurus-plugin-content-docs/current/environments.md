---
sidebar_position: 5
---

# Miljöer

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

LlamaIndex stöder för närvarande officiellt NodeJS 18 och NodeJS 20.

## NextJS App Router

Om du använder NextJS App Router route handlers/serverless functions måste du använda NodeJS-läget:

```js
export const runtime = "nodejs"; // standard
```
