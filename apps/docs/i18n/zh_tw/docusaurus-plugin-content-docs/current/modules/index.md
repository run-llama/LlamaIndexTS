# 核心模組

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

LlamaIndex.TS 提供了幾個核心模組，分為高層模組和低層模組，以便快速入門和根據需要自定義關鍵組件。

## 高層模組

- [**文件 (Document)**](./high_level/documents_and_nodes.md): 代表文本文件、PDF 文件或其他連續的數據。

- [**節點 (Node)**](./high_level/documents_and_nodes.md): 基本的數據構建塊。通常，這些是文檔的部分，分成可管理的小塊，足夠小以供嵌入模型和 LLM 使用。

- [**讀取器/加載器 (Reader/Loader)**](./high_level/data_loader.md): 讀取器或加載器是將現實世界中的文檔轉換為可以在索引和查詢中使用的 Document 類的工具。我們目前支持純文本文件和 PDF，還有更多的格式即將推出。

- [**索引 (Indexes)**](./high_level/data_index.md): 索引存儲節點和這些節點的嵌入。

- [**查詢引擎 (QueryEngine)**](./high_level/query_engine.md): 查詢引擎用於生成您輸入的查詢並返回結果。查詢引擎通常將預先構建的提示與索引中選定的節點結合，以提供 LLM 回答您的查詢所需的上下文。

- [**聊天引擎 (ChatEngine)**](./high_level/chat_engine.md): 聊天引擎可幫助您構建與索引互動的聊天機器人。

## 低層模組

- [**LLM**](./low_level/llm.md): LLM 類別是一個統一的介面，用於連接到像 OpenAI GPT-4、Anthropic Claude 或 Meta LLaMA 這樣的大型語言模型提供者。您可以對其進行子類化，以編寫連接器，連接到您自己的大型語言模型。

- [**Embedding**](./low_level/embedding.md): 嵌入表示為一個浮點數向量。OpenAI 的 text-embedding-ada-002 是我們的默認嵌入模型，它生成的每個嵌入由 1,536 個浮點數組成。另一個流行的嵌入模型是 BERT，它使用 768 個浮點數來表示每個節點。我們提供了一些用於處理嵌入的實用工具，包括 3 種相似度計算選項和最大邊緣相關性。

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): 文本分割策略對於嵌入搜索的整體有效性非常重要。目前，雖然我們有一個默認值，但沒有一種大小適合所有的解決方案。根據源文件的不同，您可能希望使用不同的分割大小和策略。目前，我們支持按固定大小分割、按固定大小分割並具有重疊部分、按句子分割和按段落分割。當將 `Document` 分割為 `Node` 時，NodeParser 使用文本分割器。

- [**Retriever**](./low_level/retriever.md): Retriever 實際上是從索引中選擇要檢索的節點。在這裡，您可能希望嘗試檢索更多或更少的節點，更改相似度函數，或者為應用程序中的每個個別用例創建自己的檢索器。例如，您可能希望為代碼內容和文本內容分別使用不同的檢索器。

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer 負責接收查詢字符串，並使用一個 `Node` 列表生成回應。這可以有多種形式，例如遍歷所有上下文並精煉答案，或者構建摘要樹並返回根摘要。

- [**Storage**](./low_level/storage.md): 在某個時候，您可能希望將索引、數據和向量存儲起來，而不是每次都重新運行嵌入模型。IndexStore、DocStore、VectorStore 和 KVStore 是抽象類別，讓您可以進行存儲。它們結合在一起形成 StorageContext。目前，我們允許您將嵌入存儲在文件系統上的文件中（或者虛擬的內存文件系統），但我們也正在積極添加到向量數據庫的集成。
