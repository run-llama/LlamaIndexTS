# Módulos Principais

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

O LlamaIndex.TS oferece vários módulos principais, separados em módulos de alto nível para começar rapidamente e módulos de baixo nível para personalizar os principais componentes conforme necessário.

## Módulos de Alto Nível

- [**Documento**](./high_level/documents_and_nodes.md): Um documento representa um arquivo de texto, arquivo PDF ou outro pedaço contíguo de dados.

- [**Nó**](./high_level/documents_and_nodes.md): O bloco básico de construção de dados. Mais comumente, esses são partes do documento divididas em pedaços gerenciáveis que são pequenos o suficiente para serem alimentados em um modelo de incorporação e LLM.

- [**Leitor/Carregador**](./high_level/data_loader.md): Um leitor ou carregador é algo que recebe um documento do mundo real e o transforma em uma classe Document que pode ser usada em seu Índice e consultas. Atualmente, oferecemos suporte a arquivos de texto simples e PDFs, com muitos outros a serem adicionados.

- [**Índices**](./high_level/data_index.md): os índices armazenam os Nós e as incorporações desses nós.

- [**Motor de Consulta**](./high_level/query_engine.md): Os motores de consulta são responsáveis por gerar a consulta que você insere e fornecer o resultado. Os motores de consulta geralmente combinam um prompt pré-construído com nós selecionados do seu Índice para fornecer ao LLM o contexto necessário para responder à sua consulta.

- [**Motor de Chat**](./high_level/chat_engine.md): Um Motor de Chat ajuda você a construir um chatbot que interage com seus Índices.

## Módulo de Baixo Nível

- [**LLM**](./low_level/llm.md): A classe LLM é uma interface unificada sobre um grande provedor de modelos de linguagem, como OpenAI GPT-4, Anthropic Claude ou Meta LLaMA. Você pode criar uma subclasse dela para escrever um conector para seu próprio modelo de linguagem.

- [**Embedding**](./low_level/embedding.md): Uma incorporação é representada como um vetor de números de ponto flutuante. O modelo de incorporação de texto-embedding-ada-002 da OpenAI é nosso modelo de incorporação padrão e cada incorporação que ele gera consiste em 1.536 números de ponto flutuante. Outro modelo de incorporação popular é o BERT, que usa 768 números de ponto flutuante para representar cada nó. Fornecemos várias utilidades para trabalhar com incorporações, incluindo 3 opções de cálculo de similaridade e Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): As estratégias de divisão de texto são incrivelmente importantes para a eficácia geral da pesquisa de incorporação. Atualmente, embora tenhamos um padrão, não há uma solução única para todos os casos. Dependendo dos documentos de origem, você pode querer usar tamanhos e estratégias de divisão diferentes. Atualmente, oferecemos suporte à divisão por tamanho fixo, divisão por tamanho fixo com seções sobrepostas, divisão por sentença e divisão por parágrafo. O divisor de texto é usado pelo NodeParser ao dividir `Documentos` em `Nós`.

- [**Retriever**](./low_level/retriever.md): O Retriever é o responsável por escolher os Nós a serem recuperados do índice. Aqui, você pode querer tentar recuperar mais ou menos Nós por consulta, alterar sua função de similaridade ou criar seu próprio recuperador para cada caso de uso individual em seu aplicativo. Por exemplo, você pode querer ter um recuperador separado para conteúdo de código versus conteúdo de texto.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): O ResponseSynthesizer é responsável por receber uma sequência de consulta e usar uma lista de `Nós` para gerar uma resposta. Isso pode assumir várias formas, como iterar sobre todo o contexto e refinar uma resposta ou construir uma árvore de resumos e retornar o resumo principal.

- [**Storage**](./low_level/storage.md): Em algum momento, você vai querer armazenar seus índices, dados e vetores em vez de executar os modelos de incorporação toda vez. IndexStore, DocStore, VectorStore e KVStore são abstrações que permitem fazer isso. Juntos, eles formam o StorageContext. Atualmente, permitimos que você persista suas incorporações em arquivos no sistema de arquivos (ou em um sistema de arquivos virtual na memória), mas também estamos adicionando ativamente integrações com Bancos de Dados de Vetores.
