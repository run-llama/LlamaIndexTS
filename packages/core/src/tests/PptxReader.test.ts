import { PptxReader } from '../readers/PptxReader';
import { QueryEngine } from '../QueryEngine';

describe('PptxReader', () => {
  let pptxReader: PptxReader;
  let queryEngine: QueryEngine;

  beforeEach(() => {
    pptxReader = new PptxReader();
    queryEngine = new QueryEngine();
  });

  test('should load pptx file', async () => {
    const nodes = await pptxReader.read('path/to/test/file.pptx');
    expect(nodes).toBeDefined();
    expect(nodes.length).toBeGreaterThan(0);
  });

  test('should query loaded pptx file', async () => {
    const nodes = await pptxReader.read('path/to/test/file.pptx');
    const results = queryEngine.query('test query');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
  });
});
