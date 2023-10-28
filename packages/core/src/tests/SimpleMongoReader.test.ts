import { MongoClient } from "mongodb";
import { SimpleMongoReader } from "../readers/SimpleMongoReader";

describe("SimpleMongoReader", () => {
  let mockClient: MongoClient;
  let reader: SimpleMongoReader;

  beforeEach(() => {
    mockClient = new MongoClient("");
    reader = new SimpleMongoReader(mockClient);
  });

  it("should construct correctly", () => {
    expect(reader).toBeInstanceOf(SimpleMongoReader);
  });

  it("should load data correctly", async () => {
    const mockDbName = "testDb";
    const mockCollectionName = "testCollection";
    const mockMaxDocs = 10;
    const mockQueryDict = { key: "value" };
    const mockQueryOptions = { sort: { key: 1 } };
    const mockProjection = { key: 1 };

    const mockCursor = {
      toArray: jest.fn().mockResolvedValue([{ key: "value" }]),
      limit: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
    };

    mockClient.db = jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue(mockCursor),
      }),
    });

    const result = await reader.loadData(
      mockDbName,
      mockCollectionName,
      mockMaxDocs,
      mockQueryDict,
      mockQueryOptions,
      mockProjection
    );

    expect(result).toEqual([{ text: '{"key":"value"}' }]);
  });
});
