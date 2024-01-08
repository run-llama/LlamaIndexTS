---
sidebar_position: 5
---

# Ympäristöt

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

LlamaIndex tukee virallisesti tällä hetkellä NodeJS:n versioita 18 ja 20.

## NextJS-sovelluksen reititin

Jos käytät NextJS-sovelluksen reitittimen reitinkäsittelijöitä/palveluttomia funktioita, sinun tulee käyttää NodeJS-tilaa:

```js
export const runtime = "nodejs"; // oletusarvo
```
