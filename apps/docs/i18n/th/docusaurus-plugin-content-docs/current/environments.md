---
sidebar_position: 5
---

# สภาพแวดล้อม (Environments)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

LlamaIndex รองรับ NodeJS 18 และ NodeJS 20 อย่างเป็นทางการในปัจจุบัน

## NextJS App Router

หากคุณใช้ NextJS App Router route handlers/serverless functions คุณจะต้องใช้โหมด NodeJS:

```js
export const runtime = "nodejs"; // ค่าเริ่มต้น
```

และคุณจะต้องเพิ่มข้อยกเว้นสำหรับ pdf-parse ใน next.config.js ของคุณ

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // ให้ pdf-parse ทำงานในโหมด NodeJS จริงๆ กับ NextJS App Router
  },
};

module.exports = nextConfig;
```
