---
sidebar_position: 5
---

# סביבות

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

LlamaIndex כרגע תומך באופן רשמי ב-NodeJS 18 ו-NodeJS 20.

## מסלולי הראוטר של NextJS App

אם אתה משתמש במסלולי הראוטר של NextJS App לטיפול במסלולים/פונקציות שרת, יהיה עליך להשתמש במצב NodeJS:

```js
export const runtime = "nodejs"; // ברירת מחדל
```

ועליך להוסיף יוצאת דופן עבור pdf-parse בקובץ next.config.js שלך

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // מעביר את pdf-parse למצב NodeJS האמיתי עם מסלולי הראוטר של NextJS App
  },
};

module.exports = nextConfig;
```
