---
sidebar_position: 3
---

# 查詢引擎 (QueryEngine)

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

查詢引擎將`Retriever`和`ResponseSynthesizer`封裝成一個流程，使用查詢字串來檢索節點，然後將它們發送到LLM以生成回應。

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("查詢字串");
```

## 子查詢引擎 (Sub Question Query Engine)

子查詢引擎的基本概念是將單個查詢拆分為多個查詢，為每個查詢獲取答案，然後將這些不同的答案結合成一個統一的回應，以供用戶使用。您可以將其想象為“逐步思考”提示技術，但是在數據源上進行迭代！

### 開始使用

開始嘗試子查詢引擎的最簡單方法是在[examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)中運行subquestion.ts文件。

```bash
npx ts-node subquestion.ts
```

### 工具 (Tools)

子查詢引擎使用工具 (Tools) 來實現。工具的基本概念是它們是大型語言模型的可執行選項。在這種情況下，我們的子查詢引擎依賴於查詢引擎工具 (QueryEngineTool)，正如您所猜測的，這是一個在查詢引擎上運行查詢的工具。這使我們能夠給模型提供一個選項，例如為不同的問題查詢不同的文檔。您還可以想像子查詢引擎可以使用一個在網上搜索某些內容或使用Wolfram Alpha獲取答案的工具。

您可以通過查看LlamaIndex Python文檔來了解更多關於工具的信息：https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API 參考

- [檢索器查詢引擎 (RetrieverQueryEngine)](../../api/classes/RetrieverQueryEngine.md)
- [子查詢引擎 (SubQuestionQueryEngine)](../../api/classes/SubQuestionQueryEngine.md)
- [查詢引擎工具 (QueryEngineTool)](../../api/interfaces/QueryEngineTool.md)
