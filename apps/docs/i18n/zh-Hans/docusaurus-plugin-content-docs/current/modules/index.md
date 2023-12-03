# 核心模块

LlamaIndex.TS 提供了几个核心模块，分为高级模块以便快速开始使用，以及低级模块以便根据需要自定义关键组件。

## 高级模块

- [**文档**](./high_level/documents_and_nodes.md)：文档代表一个文本文件、PDF文件或其他连续的数据片段。

- [**节点**](./high_level/documents_and_nodes.md)：基本的数据构建块。通常，这些是被分割成可管理的小块的文档部分，小到足以被输入到嵌入模型和LLM中。

- [**读取器/加载器**](./high_level/data_loader.md)：读取器或加载器是将现实世界中的文档转换成可以在您的索引和查询中使用的文档类的东西。我们目前支持纯文本文件和PDF，未来将支持更多格式。

- [**索引**](./high_level/data_index.md)：索引存储节点及其嵌入。

- [**查询引擎 (QueryEngine)**](./high_level/query_engine.md)：查询引擎是生成您输入的查询并返回结果的工具。查询引擎通常结合预构建的提示与您索引中选定的节点，为LLM提供回答您查询所需的上下文。

- [**聊天引擎 (ChatEngine)**](./high_level/chat_engine.md)：聊天引擎帮助您构建一个将与您的索引互动的聊天机器人。

## 低级模块

- [**LLM**](./low_level/llm.md): LLM 类是一个统一的接口，适用于如 OpenAI GPT-4、Anthropic Claude 或 Meta LLaMA 等大型语言模型提供商。您可以子类化它以编写连接到您自己的大型语言模型的连接器。

- [**嵌入（Embedding）**](./low_level/embedding.md): 嵌入表示为一个浮点数向量。OpenAI 的 text-embedding-ada-002 是我们默认的嵌入模型，它生成的每个嵌入包含 1,536 个浮点数。另一个流行的嵌入模型是 BERT，它使用 768 个浮点数来表示每个节点。我们提供了许多工具来处理嵌入，包括 3 种相似度计算选项和最大边际相关性。

- [**文本分割器/节点解析器（TextSplitter/NodeParser）**](./low_level/node_parser.md): 文本分割策略对于嵌入搜索的整体效果非常重要。目前，虽然我们有一个默认值，但并没有一种适合所有情况的解决方案。根据源文档，您可能希望使用不同的分割大小和策略。目前我们支持按固定大小分割、按固定大小带重叠部分分割、按句子分割和按段落分割。文本分割器在将 `Document` 分割成 `Node` 时被节点解析器使用。

- [**检索器（Retriever）**](./low_level/retriever.md): 检索器实际上是从索引中选择要检索的节点的工具。在这里，您可能希望尝试检索更多或更少的节点每个查询，更改您的相似度函数，或为您应用中的每个个别用例创建自己的检索器。例如，您可能希望为代码内容与文本内容有不同的检索器。

- [**响应合成器（ResponseSynthesizer）**](./low_level/response_synthesizer.md): 响应合成器负责接受一个查询字符串，并使用一系列 `Node` 生成响应。这可以采取多种形式，如遍历所有上下文并精炼答案，或构建一个摘要树并返回根摘要。

- [**存储（Storage）**](./low_level/storage.md): 在某个时刻，您将希望存储您的索引、数据和向量，而不是每次都重新运行嵌入模型。IndexStore、DocStore、VectorStore 和 KVStore 是让您能够做到这一点的抽象。它们合在一起形成了 StorageContext。目前，我们允许您在文件系统上（或虚拟的内存文件系统中）的文件中持久化您的嵌入，但我们也在积极添加对向量数据库的集成。
