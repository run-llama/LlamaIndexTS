---
sidebar_position: 4
---

# エンドツーエンドの例

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

リポジトリ内のLlamaIndex.TSを使用したいくつかのエンドツーエンドの例を含めています。

以下の例をチェックしてみるか、Dev-Docsが提供する対話型のGithub Codespaceチュートリアルで数分で試してみてください。[こちら](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json)からアクセスできます。

## [チャットエンジン](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

ファイルを読み込んでLLMとチャットします。

## [ベクトルインデックス](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

ベクトルインデックスを作成し、クエリを実行します。ベクトルインデックスは埋め込みを使用して、トップkの関連ノードを取得します。デフォルトでは、kの値は2です。

## [サマリーインデックス](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

リストインデックスを作成し、クエリを実行します。この例では、`LLMRetriever`も使用されており、回答を生成する際に使用する最適なノードを選択するためにLLMが使用されます。

## [インデックスの保存/読み込み](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

ベクトルインデックスの作成と読み込み。LlamaIndex.TSでは、ストレージコンテキストオブジェクトが作成されると、ディスクへの永続化が自動的に行われます。

## [カスタマイズされたベクトルインデックス](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

ベクトルインデックスを作成し、クエリを実行すると同時に、`LLM`、`ServiceContext`、および`similarity_top_k`を設定します。

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

OpenAI LLMを作成し、直接チャットに使用します。

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Llama-2 LLMを作成し、直接チャットに使用します。

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

`SubQuestionQueryEngine`を使用しています。これは複雑なクエリを複数の質問に分割し、すべてのサブクエリの回答を集約します。

## [低レベルモジュール](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

この例では、実際のクエリエンジンの必要性をなくすために、いくつかの低レベルのコンポーネントを使用しています。これらのコンポーネントは、どこでも、どのアプリケーションでも使用できるだけでなく、カスタマイズしてサブクラス化して独自のニーズに合わせることもできます。
