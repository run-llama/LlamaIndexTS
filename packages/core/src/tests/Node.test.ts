import { Node, ObjectType, MetadataMode } from '../Node';
import { v4 as uuidv4 } from 'uuid';

describe('Node class', () => {
  let node: Node;

  beforeEach(() => {
    node = new Node();
  });

  test('getType method', () => {
    expect(node.getType()).toBe(ObjectType.TEXT);
  });

  test('getContent method', () => {
    const content = 'Test content';
    node.setContent(content);
    expect(node.getContent(MetadataMode.ALL)).toBe(content);
  });

  test('getMetadataStr method', () => {
    const metadata = { key: 'value' };
    node.metadata = metadata;
    expect(node.getMetadataStr(MetadataMode.ALL)).toBe(JSON.stringify(metadata));
  });

  test('setContent method', () => {
    const content = 'Test content';
    node.setContent(content);
    expect(node.getContent(MetadataMode.ALL)).toBe(content);
  });

  // Mock LLM completions and test other methods...
});
