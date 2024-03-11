import {
  IndexDict,
  IndexList,
  IndexStruct,
  IndexStructType,
  MetadataMode,
  TextNode,
  jsonToIndexStruct,
} from "llamaindex";
import { describe, expect, it } from "vitest";

describe("jsonToIndexStruct", () => {
  it("transforms json to IndexDict", () => {
    function isIndexDict(some: IndexStruct): some is IndexDict {
      return "type" in some && some.type === IndexStructType.SIMPLE_DICT;
    }

    const node = new TextNode({ text: "text", id_: "nodeId" });
    const expected = new IndexDict();
    expected.addNode(node);

    console.log("expected.toJson()", expected.toJson());
    const actual = jsonToIndexStruct(expected.toJson());

    expect(isIndexDict(actual)).toBe(true);
    expect(
      (actual as IndexDict).nodesDict.nodeId.getContent(MetadataMode.NONE),
    ).toEqual("text");
  });
  it("transforms json to IndexList", () => {
    function isIndexList(some: IndexStruct): some is IndexList {
      return "type" in some && some.type === IndexStructType.LIST;
    }

    const node = new TextNode({ text: "text", id_: "nodeId" });
    const expected = new IndexList();
    expected.addNode(node);

    const actual = jsonToIndexStruct(expected.toJson());

    expect(isIndexList(actual)).toBe(true);
    expect((actual as IndexList).nodes[0]).toEqual("nodeId");
  });
  it("fails for unknown index type", () => {
    expect(() => {
      const json = {
        indexId: "dd120b16-8dce-4ce3-9bb6-15ca87fe4a1d",
        summary: undefined,
        nodesDict: {},
        type: "FOO",
      };
      return jsonToIndexStruct(json);
    }).toThrowError("Unknown index struct type: FOO");
  });
  it("fails for unknown node type", () => {
    expect(() => {
      const json = {
        indexId: "dd120b16-8dce-4ce3-9bb6-15ca87fe4a1d",
        summary: undefined,
        nodesDict: {
          nodeId: {
            ...new TextNode({ text: "text", id_: "nodeId" }).toJSON(),
            type: "BAR",
          },
        },
        type: IndexStructType.SIMPLE_DICT,
      };
      return jsonToIndexStruct(json);
    }).toThrowError("Invalid node type: BAR");
  });
});
