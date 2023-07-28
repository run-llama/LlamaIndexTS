import { VectorStoreIndex } from '../indices/vectorStore/VectorStoreIndex';
import { VectorIndexOptions } from '../indices/vectorStore/VectorIndexOptions';
import { BaseNode } from '../base/BaseNode';

describe('VectorStoreIndex', () => {
  let vectorStoreIndex: VectorStoreIndex;
  let vectorIndexOptions: VectorIndexOptions;
  let nodes: BaseNode[];

  beforeEach(async () => {
    // Initialize options and nodes
    vectorIndexOptions = new VectorIndexOptions();
    nodes = [new BaseNode(), new BaseNode()];

    // Initialize VectorStoreIndex
    vectorStoreIndex = await VectorStoreIndex.init(vectorIndexOptions);
  });

  test('getNodeEmbeddingResults', async () => {
    const results = await VectorStoreIndex.getNodeEmbeddingResults(nodes, null, false);
    expect(results).toBeDefined();
  });

  test('buildIndexFromNodes', async () => {
    const index = await VectorStoreIndex.buildIndexFromNodes(nodes, null, null, null);
    expect(index).toBeDefined();
  });

  test('fromDocuments', async () => {
    const documents = [{ id: '1', text: 'test' }, { id: '2', text: 'test' }];
    const vectorStoreIndex = await VectorStoreIndex.fromDocuments(documents);
    expect(vectorStoreIndex).toBeDefined();
  });

  test('asRetriever', () => {
    const retriever = vectorStoreIndex.asRetriever();
    expect(retriever).toBeDefined();
  });
});