---
sidebar_position: 5
---

# Môi trường

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

LlamaIndex hiện đang chính thức hỗ trợ NodeJS 18 và NodeJS 20.

## NextJS App Router

Nếu bạn đang sử dụng NextJS App Router route handlers/serverless functions, bạn sẽ cần sử dụng chế độ NodeJS:

```js
export const runtime = "nodejs"; // mặc định
```
