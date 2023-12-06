---
sidebar_position: 6
---

# 回應合成器 (ResponseSynthesizer)

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

回應合成器負責將查詢、節點和提示模板傳送給 LLM 以生成回應。有幾種關鍵模式可用於生成回應：

- `Refine`：通過依次處理每個檢索到的文本片段來「創建和完善」答案。這對於更詳細的答案很有用。
- `CompactAndRefine`（默認）：在每次 LLM 調用期間「壓縮」提示，將盡可能多的文本片段塞入最大提示大小內。如果有太多的片段無法塞入一個提示中，則通過多個緊湊提示來「創建和完善」答案。與 `refine` 相同，但應該會減少 LLM 調用次數。
- `TreeSummarize`：根據一組文本片段和查詢，遞歸構建一棵樹並返回根節點作為回應。適用於摘要目的。
- `SimpleResponseBuilder`：根據一組文本片段和查詢，將查詢應用於每個文本片段，同時將回應累積到一個數組中。返回所有回應的連接字符串。當您需要對每個文本片段單獨運行相同的查詢時很有用。

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "我今年10歲。" }),
    score: 1,
  },
  {
    node: new TextNode({ text: "約翰今年20歲。" }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "我幾歲？",
  nodesWithScore,
);
console.log(response.response);
```

## API 參考

- [回應合成器 (ResponseSynthesizer)](../../api/classes/ResponseSynthesizer.md)
- [創建和完善 (Refine)](../../api/classes/Refine.md)
- [壓縮和完善 (CompactAndRefine)](../../api/classes/CompactAndRefine.md)
- [樹摘要 (TreeSummarize)](../../api/classes/TreeSummarize.md)
- [簡單回應構建器 (SimpleResponseBuilder)](../../api/classes/SimpleResponseBuilder.md)
