---
sidebar_position: 5
---

# Ortamlar

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

LlamaIndex şu anda resmi olarak NodeJS 18 ve NodeJS 20'yi desteklemektedir.

## NextJS Uygulama Yönlendirici

Eğer NextJS Uygulama Yönlendirici rota işleyicileri/sunucusuz fonksiyonlar kullanıyorsanız, NodeJS modunu kullanmanız gerekecektir:

```js
export const runtime = "nodejs"; // varsayılan
```
