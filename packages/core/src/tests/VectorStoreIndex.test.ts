import { VectorStoreIndex } from '../indices/vectorStore/VectorStoreIndex';
import { TextNode, Document } from '../Node';
import { BaseRetriever } from '../Retriever';
import { BaseQueryEngine } from '../QueryEngine';
import { mockEmbeddingModel } from './utility/mockOpenAI'; // import the mockEmbeddingModel

describe('VectorStoreIndex', () => {
  test('init', async () => {
    // Prepare inputs
    const options = {
      storageContext: new StorageContext(),
      serviceContext: new ServiceContext(),
      docStore: new BaseDocumentStore(),
      vectorStore: new VectorStore(),
      indexStruct: new IndexStruct(),
    }; // fill with appropriate data

    // Call the method
    const result = await VectorStoreIndex.init(options);

    // Assert the result
    expect(result).toBeInstanceOf(VectorStoreIndex);
    // Add more assertions as necessary

    // Handle edge cases and errors
    // Add code to handle edge cases and errors
  });

  // Write similar test blocks for the other methods: getNodeEmbeddingResults, buildIndexFromNodes, fromDocuments, asRetriever, asQueryEngine

  test('getNodeEmbeddingResults', async () => {
    // Prepare inputs
    const nodes = [
      new TextNode({text: 'Apple'}),
      new TextNode({text: 'Banana'}),
      new TextNode({text: 'Cherry'}),
      new TextNode({text: 'Date'}),
      new TextNode({text: 'Elderberry'}),
      new TextNode({text: 'Fig'}),
      new TextNode({text: 'Grape'}),
      new TextNode({text: 'Honeydew'}),
      new TextNode({text: 'Iced Apple'}),
      new TextNode({text: 'Jackfruit'})
    ];
    // Use the mockEmbeddingModel instead of the ServiceContext
    const serviceContext = new ServiceContext();
    serviceContext.embedModel = mockEmbeddingModel;

    // Call the method
    const result = await VectorStoreIndex.getNodeEmbeddingResults(nodes, serviceContext);

    // Assert the result
    expect(result).toBeInstanceOf(Array);
    // Assuming the getNodeEmbeddingResults method returns an array of embeddings for the input nodes
    expect(result).toHaveLength(nodes.length);
    result.forEach(embedding => {
      expect(embedding).toBeInstanceOf(Float32Array); // Assuming each embedding is a Float32Array
    });
    // Add more assertions as necessary
  });

  // Add similar test blocks for the other methods: buildIndexFromNodes, fromDocuments, asRetriever, asQueryEngine
  
  test('buildIndexFromNodes', async () => {
    // Prepare inputs
    const nodes = [
      new TextNode({text: 'Apple'}),
      new TextNode({text: 'Banana'}),
      new TextNode({text: 'Cherry'}),
      new TextNode({text: 'Date'}),
      new TextNode({text: 'Elderberry'}),
      new TextNode({text: 'Fig'}),
      new TextNode({text: 'Grape'}),
      new TextNode({text: 'Honeydew'}),
      new TextNode({text: 'Iced Apple'}),
      new TextNode({text: 'Jackfruit'})
    ];
    const serviceContext = new ServiceContext();
    serviceContext.embedModel = mockEmbeddingModel;

    // Call the method
    const result = await VectorStoreIndex.buildIndexFromNodes(nodes, serviceContext);

    // Assert the result
    expect(result).toBeInstanceOf(VectorStoreIndex);
  });

  test('fromDocuments', async () => {
    // Prepare inputs
    const documents = [
      new Document({text: 'Apple'}),
      new Document({text: 'Banana'}),
      new Document({text: 'Cherry'}),
      new Document({text: 'Date'}),
      new Document({text: 'Elderberry'}),
      new Document({text: 'Fig'}),
      new Document({text: 'Grape'}),
      new Document({text: 'Honeydew'}),
      new Document({text: 'Iced Apple'}),
      new Document({text: 'Jackfruit'})
    ];
    const serviceContext = new ServiceContext();

    // Call the method
    const result = await VectorStoreIndex.fromDocuments(documents, serviceContext);

    // Assert the result
    expect(result).toBeInstanceOf(VectorStoreIndex);
  });

  test('asRetriever', async () => {
    // Prepare inputs
    const vectorStoreIndex = new VectorStoreIndex();

    // Call the method
    const result = vectorStoreIndex.asRetriever();

    // Assert the result
    expect(result).toBeInstanceOf(BaseRetriever);
  });

  test('asQueryEngine', async () => {
    // Prepare inputs
    const vectorStoreIndex = new VectorStoreIndex();

    // Call the method
    const result = vectorStoreIndex.asQueryEngine();

    // Assert the result
    expect(result).toBeInstanceOf(BaseQueryEngine);
  });

  // Remember to handle edge cases and errors in the test cases
}) // Add a closing parenthesis at the end of the file to correctly close the `describe` function call.