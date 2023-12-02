# 核心模块

LlamaIndex.TS提供了几个核心模块，分为高级模块，可快速入门，和低级模块，可根据需要自定义关键组件。

## 高级模块

- [**文档**](./high_level/documents_and_nodes.md): 文档代表文本文件、PDF文件或其他连续的数据片段。

- [**节点**](./high_level/documents_and_nodes.md): 基本的数据构建块。通常，这些是文档的部分，分成可管理的小块，足够小，可以输入到嵌入模型和LLM中。

- [**读取器/加载器**](./high_level/data_loader.md): 读取器或加载器是将现实世界中的文档转换为可以在您的索引和查询中使用的文档类的工具。我们目前支持纯文本文件和PDF文件，还有更多的支持正在陆续增加中。

- [**索引**](./high_level/data_index.md): 索引存储节点和这些节点的嵌入。

- [**查询引擎**](./high_level/query_engine.md): 查询引擎是用于生成您输入的查询并返回结果的工具。查询引擎通常将预先构建的提示与从您的索引中选择的节点结合起来，为LLM提供其需要回答您的查询的上下文。

- [**聊天引擎**](./high_level/chat_engine.md): 聊天引擎可帮助您构建与您的索引交互的聊天机器人。

## 低级模块

- [**LLM**](./low_level/llm.md): LLM类是一个统一的接口，用于大型语言模型提供程序，如OpenAI GPT-4，Anthropic Claude或Meta LLaMA。您可以对其进行子类化，以编写连接器以连接到您自己的大型语言模型。

- [**Embedding**](./low_level/embedding.md): 嵌入表示为浮点数向量。OpenAI的文本嵌入ada-002是我们的默认嵌入模型，它生成的每个嵌入由1,536个浮点数组成。另一个流行的嵌入模型是BERT，它使用768个浮点数来表示每个节点。我们提供了许多工具来处理嵌入，包括3种相似性计算选项和最大边际相关性。

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): 文本拆分策略对嵌入搜索的整体有效性非常重要。目前，虽然我们有一个默认值，但并没有一种大小适合所有的解决方案。根据源文档的不同，您可能希望使用不同的拆分大小和策略。目前，我们支持按固定大小拆分，带有重叠部分的固定大小拆分，按句子拆分和按段落拆分。当将`Document`拆分为`Node`时，文本拆分器由NodeParser使用。

- [**Retriever**](./low_level/retriever.md): Retriever实际上是选择要从索引中检索的节点的组件。在这里，您可能希望尝试在每个查询中检索更多或更少的节点，更改相似性函数，或为应用程序中的每个个别用例创建自己的检索器。例如，您可能希望针对代码内容和文本内容分别使用单独的检索器。

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer负责接收查询字符串，并使用`Node`列表生成响应。这可以采用许多形式，例如遍历所有上下文并完善答案，或构建摘要树并返回根摘要。

- [**Storage**](./low_level/storage.md): 在某个时候，您可能希望存储您的索引、数据和向量，而不是每次重新运行嵌入模型。IndexStore、DocStore、VectorStore和KVStore是让您执行此操作的抽象。它们组合在一起形成StorageContext。目前，我们允许您将嵌入持久化在文件系统上（或虚拟内存文件系统），但我们也在积极添加到向量数据库的集成。
