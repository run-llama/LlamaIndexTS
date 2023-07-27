import { VectorStoreIndex } from '../indices/vectorStore/VectorStoreIndex';
import { VectorIndexOptions } from '../types';
import { jest } from '@jest/globals';

describe('VectorStoreIndex', () => {
  let vectorStoreIndex: VectorStoreIndex;
  let options: VectorIndexOptions;

  beforeEach(() => {
    options = {
      storageContext: {},
      serviceContext: {},
      docStore: {},
      vectorStore: {},
      indexStruct: {},
    };
    vectorStoreIndex = VectorStoreIndex.init(options);
  });

  test('should initialize correctly', async () => {
    expect(vectorStoreIndex).toBeInstanceOf(VectorStoreIndex);
  });

  test('should retrieve node embeddings correctly', async () => {
    const embeddings = await vectorStoreIndex.getEmbeddings();
    expect(embeddings).toBeDefined();
  });

  test('should handle documents correctly', async () => {
    const doc = { id: '1', text: 'test' };
    await vectorStoreIndex.addDocument(doc);
    const retrievedDoc = await vectorStoreIndex.getDocument(doc.id);
    expect(retrievedDoc).toEqual(doc);
    await vectorStoreIndex.deleteDocument(doc.id);
    const deletedDoc = await vectorStoreIndex.getDocument(doc.id);
    expect(deletedDoc).toBeNull();
  });
});