import { StreamData } from "ai";
import {
  CallbackManager,
  LLamaCloudFileService,
  Metadata,
  MetadataMode,
  NodeWithScore,
  ToolCall,
  ToolOutput,
} from "llamaindex";
import path from "node:path";
import { DATA_DIR } from "../../engine/loader";
import { downloadFile } from "./file";

const LLAMA_CLOUD_DOWNLOAD_FOLDER = "output/llamacloud";

export function appendSourceData(
  data: StreamData,
  sourceNodes?: NodeWithScore<Metadata>[],
) {
  if (!sourceNodes?.length) return;
  try {
    const nodes = sourceNodes.map((node) => ({
      metadata: node.node.metadata,
      id: node.node.id_,
      score: node.score ?? null,
      url: getNodeUrl(node.node.metadata),
      text: node.node.getContent(MetadataMode.NONE),
    }));
    data.appendMessageAnnotation({
      type: "sources",
      data: {
        nodes,
      },
    });
  } catch (error) {
    console.error("Error appending source data:", error);
  }
}

export function appendEventData(data: StreamData, title?: string) {
  if (!title) return;
  data.appendMessageAnnotation({
    type: "events",
    data: {
      title,
    },
  });
}

export function appendToolData(
  data: StreamData,
  toolCall: ToolCall,
  toolOutput: ToolOutput,
) {
  data.appendMessageAnnotation({
    type: "tools",
    data: {
      toolCall: {
        id: toolCall.id,
        name: toolCall.name,
        input: toolCall.input,
      },
      toolOutput: {
        output: toolOutput.output,
        isError: toolOutput.isError,
      },
    },
  });
}

export function createCallbackManager(stream: StreamData) {
  const callbackManager = new CallbackManager();

  callbackManager.on("retrieve-end", (data) => {
    const { nodes, query } = data.detail;
    appendSourceData(stream, nodes);
    appendEventData(stream, `Retrieving context for query: '${query.query}'`);
    appendEventData(
      stream,
      `Retrieved ${nodes.length} sources to use as context for the query`,
    );
    downloadFilesFromNodes(nodes); // don't await to avoid blocking chat streaming
  });

  callbackManager.on("llm-tool-call", (event) => {
    const { name, input } = event.detail.toolCall;
    const inputString = Object.entries(input)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    appendEventData(
      stream,
      `Using tool: '${name}' with inputs: '${inputString}'`,
    );
  });

  callbackManager.on("llm-tool-result", (event) => {
    const { toolCall, toolResult } = event.detail;
    appendToolData(stream, toolCall, toolResult);
  });

  return callbackManager;
}

function getNodeUrl(metadata: Metadata) {
  if (!process.env.FILESERVER_URL_PREFIX) {
    console.warn(
      "FILESERVER_URL_PREFIX is not set. File URLs will not be generated.",
    );
  }
  const fileName = metadata["file_name"];
  if (fileName && process.env.FILESERVER_URL_PREFIX) {
    // file_name exists and file server is configured
    const pipelineId = metadata["pipeline_id"];
    if (pipelineId) {
      const name = toDownloadedName(pipelineId, fileName);
      return `${process.env.FILESERVER_URL_PREFIX}/${LLAMA_CLOUD_DOWNLOAD_FOLDER}/${name}`;
    }
    const isPrivate = metadata["private"] === "true";
    if (isPrivate) {
      return `${process.env.FILESERVER_URL_PREFIX}/output/uploaded/${fileName}`;
    }
    const filePath = metadata["file_path"];
    const dataDir = path.resolve(DATA_DIR);

    if (filePath && dataDir) {
      const relativePath = path.relative(dataDir, filePath);
      return `${process.env.FILESERVER_URL_PREFIX}/data/${relativePath}`;
    }
  }
  // fallback to URL in metadata (e.g. for websites)
  return metadata["URL"];
}

async function downloadFilesFromNodes(nodes: NodeWithScore<Metadata>[]) {
  try {
    const files = nodesToLlamaCloudFiles(nodes);
    for (const { pipelineId, fileName, downloadedName } of files) {
      const downloadUrl = await LLamaCloudFileService.getFileUrl(
        pipelineId,
        fileName,
      );
      if (downloadUrl) {
        await downloadFile(
          downloadUrl,
          downloadedName,
          LLAMA_CLOUD_DOWNLOAD_FOLDER,
        );
      }
    }
  } catch (error) {
    console.error("Error downloading files from nodes:", error);
  }
}

function nodesToLlamaCloudFiles(nodes: NodeWithScore<Metadata>[]) {
  const files: Array<{
    pipelineId: string;
    fileName: string;
    downloadedName: string;
  }> = [];
  for (const node of nodes) {
    const pipelineId = node.node.metadata["pipeline_id"];
    const fileName = node.node.metadata["file_name"];
    if (!pipelineId || !fileName) continue;
    const isDuplicate = files.some(
      (f) => f.pipelineId === pipelineId && f.fileName === fileName,
    );
    if (!isDuplicate) {
      files.push({
        pipelineId,
        fileName,
        downloadedName: toDownloadedName(pipelineId, fileName),
      });
    }
  }
  return files;
}

function toDownloadedName(pipelineId: string, fileName: string) {
  return `${pipelineId}$${fileName}`;
}
