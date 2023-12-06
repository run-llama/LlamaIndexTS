---
sidebar_position: 5
---

# Περιβάλλοντα

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Το LlamaIndex υποστηρίζει επίσημα το NodeJS 18 και το NodeJS 20.

## Δρομολογητής εφαρμογής NextJS

Εάν χρησιμοποιείτε τους χειριστές δρομολογητή NextJS App Router / serverless functions, θα πρέπει να χρησιμοποιήσετε τη λειτουργία NodeJS:

```js
export const runtime = "nodejs"; // προεπιλογή
```

και θα πρέπει να προσθέσετε μια εξαίρεση για το pdf-parse στο next.config.js σας

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Βάζει το pdf-parse σε πραγματική λειτουργία NodeJS με τον δρομολογητή NextJS App
  },
};

module.exports = nextConfig;
```
