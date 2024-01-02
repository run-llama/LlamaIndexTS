---
sidebar_position: 0
slug: /
---

# 什麼是LlamaIndex.TS?

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

LlamaIndex.TS是一個數據框架，用於LLM應用程序對私有或特定領域的數據進行摄取、結構化和訪問。雖然還提供了一個Python包（請參見[這裡](https://docs.llamaindex.ai/en/stable/)），但LlamaIndex.TS提供了一個簡單的包，針對TypeScript進行了優化，提供了核心功能。

## 🚀 為什麼選擇LlamaIndex.TS？

在其核心，LLM提供了人類和推斷數據之間的自然語言界面。廣泛可用的模型已經在大量公開可用的數據上進行了預訓練，這些數據來自維基百科、郵件列表、教科書和源代碼。

基於LLM的應用程序通常需要使用私有或特定領域的數據來擴充這些模型。不幸的是，這些數據可能分散在不同的應用程序和數據存儲中。它們可能在API後面、SQL數據庫中，或者被困在PDF和幻燈片中。

這就是**LlamaIndex.TS**的用途所在。

## 🦙 LlamaIndex.TS如何幫助？

LlamaIndex.TS提供以下工具：

- **數據加載**：直接將現有的`.txt`、`.pdf`、`.csv`、`.md`和`.docx`數據進行摄取。
- **數據索引**：將數據結構化為中間表示形式，便於LLM應用程序消耗並提高性能。
- **引擎**：提供對數據的自然語言訪問。例如：
  - 查詢引擎是強大的檢索界面，用於增強知識輸出。
  - 聊天引擎是用於與數據進行多消息、來回交互的對話界面。

## 👨‍👩‍👧‍👦 LlamaIndex 適用於誰？

LlamaIndex.TS 提供了一組核心工具，對於使用 JavaScript 和 TypeScript 構建 LLM 應用程式的任何人來說都是必不可少的。

我們的高級 API 允許初學者使用 LlamaIndex.TS 來輸入和查詢他們的資料。

對於更複雜的應用程式，我們的低階 API 允許高級使用者自定義和擴展任何模組 - 資料連接器、索引、檢索器和查詢引擎，以滿足他們的需求。

## 入門指南

`npm install llamaindex`

我們的文檔包括[安裝說明](./installation.mdx)和[入門教程](./starter.md)，以構建您的第一個應用程序。

一旦您開始運行，[高級概念](./concepts.md)提供了 LlamaIndex 模塊化架構的概述。如果需要更多實際的操作示例，請查看我們的[端到端教程](./end_to_end.md)。

## 🗺️ 生態系統

要下載或貢獻，請在以下位置找到LlamaIndex：

- Github：https://github.com/run-llama/LlamaIndexTS
- NPM：https://www.npmjs.com/package/llamaindex

## 社區

需要幫助嗎？有功能建議嗎？加入LlamaIndex社區：

- Twitter：https://twitter.com/llama_index
- Discord：https://discord.gg/dGcwcsnxhU
