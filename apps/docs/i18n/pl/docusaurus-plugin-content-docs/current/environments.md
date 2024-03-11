---
sidebar_position: 5
---

# Środowiska

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

LlamaIndex obecnie oficjalnie obsługuje NodeJS 18 i NodeJS 20.

## Router aplikacji NextJS

Jeśli korzystasz z obsługi trasowania NextJS App Router lub funkcji bezserwerowych, będziesz musiał użyć trybu NodeJS:

```js
export const runtime = "nodejs"; // domyślnie
```
