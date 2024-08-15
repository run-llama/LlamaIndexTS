import {
  FilesService,
  PipelinesService,
  ProjectsService,
} from "@llamaindex/cloud/api";
import type { Metadata, NodeWithScore } from "@llamaindex/core/schema";
import type { CloudConstructorParams } from "./constants.js";
import { initService } from "./utils.js";

const OUTPUT_DIR = "output/llamacloud";
const FILE_DELIMITER = "$";

export type LLamaCloudFileServiceConfigs = {
  outputDir: string;
  fileDelimiter: string;
};

export class LLamaCloudFileService {
  params?: CloudConstructorParams;
  configs: LLamaCloudFileServiceConfigs;

  constructor(
    params?: CloudConstructorParams & Partial<LLamaCloudFileServiceConfigs>,
  ) {
    this.configs = {
      outputDir: params?.outputDir ?? OUTPUT_DIR,
      fileDelimiter: params?.fileDelimiter ?? FILE_DELIMITER,
    };
    if (params) this.params = params;
    initService(params);
  }

  /**
   * get list of projects, each project contains a list of pipelines
   */
  public async getAllProjectsWithPipelines() {
    try {
      const projects = await ProjectsService.listProjectsApiV1ProjectsGet();
      const pipelines =
        await PipelinesService.searchPipelinesApiV1PipelinesGet();
      return projects.map((project) => ({
        ...project,
        pipelines: pipelines.filter((p) => p.project_id === project.id),
      }));
    } catch (error) {
      console.error("Error listing projects and pipelines:", error);
      return [];
    }
  }

  /**
   * Upload a file to a pipeline in LlamaCloud
   */
  public async addFileToPipeline(
    projectId: string,
    pipelineId: string,
    uploadFile: File | Blob,
    customMetadata: Record<string, any> = {},
  ) {
    const file = await FilesService.uploadFileApiV1FilesPost({
      projectId,
      formData: {
        upload_file: uploadFile,
      },
    });
    const files = [
      {
        file_id: file.id,
        custom_metadata: { file_id: file.id, ...customMetadata },
      },
    ];
    await PipelinesService.addFilesToPipelineApiV1PipelinesPipelineIdFilesPut({
      pipelineId,
      requestBody: files,
    });

    // Wait 2s for the file to be processed
    const maxAttempts = 20;
    let attempt = 0;
    while (attempt < maxAttempts) {
      const result =
        await PipelinesService.getPipelineFileStatusApiV1PipelinesPipelineIdFilesFileIdStatusGet(
          {
            pipelineId,
            fileId: file.id,
          },
        );
      if (result.status === "ERROR") {
        throw new Error(`File processing failed: ${JSON.stringify(result)}`);
      }
      if (result.status === "SUCCESS") {
        // File is ingested - return the file id
        return file.id;
      }
      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, 100)); // Sleep for 100ms
    }
    throw new Error(
      `File processing did not complete after ${maxAttempts} attempts.`,
    );
  }

  /**
   * Get download URLs for a list of nodes
   */
  public async getDownloadFileUrls(nodes: NodeWithScore<Metadata>[]) {
    const files = this.nodesToLlamaCloudFiles(nodes);
    const result = [];
    for (const { pipelineId, fileName } of files) {
      const fileUrl = await this.getFileUrl(pipelineId, fileName);
      if (fileUrl) {
        result.push({
          url: fileUrl.url,
          name: this.toDownloadFilename(pipelineId, fileName),
        });
      }
    }
    return result;
  }

  /**
   * Get local download URL for a file in LlamaCloud
   */
  public getLocalFilePath(
    pipelineId: string,
    fileName: string,
    folder?: string,
  ) {
    const downloadFilename = this.toDownloadFilename(pipelineId, fileName);
    const outputDir = folder ?? this.configs.outputDir;
    return `${outputDir}/${downloadFilename}`;
  }

  public async getFileUrl(pipelineId: string, name: string) {
    const allPipelineFiles =
      await PipelinesService.listPipelineFilesApiV1PipelinesPipelineIdFilesGet({
        pipelineId,
      });
    const file = allPipelineFiles.find((file) => file.name === name);
    if (!file?.file_id) return null;
    const fileContent =
      await FilesService.readFileContentApiV1FilesIdContentGet({
        id: file.file_id,
        projectId: file.project_id,
      });
    return {
      url: fileContent.url,
      filename: this.toDownloadFilename(pipelineId, name),
    };
  }

  private toDownloadFilename(pipelineId: string, fileName: string) {
    return `${pipelineId}${this.configs.fileDelimiter}${fileName}`;
  }

  private nodesToLlamaCloudFiles(nodes: NodeWithScore<Metadata>[]) {
    const files: Array<{ pipelineId: string; fileName: string }> = [];
    for (const node of nodes) {
      const pipelineId = node.node.metadata["pipeline_id"];
      const fileName = node.node.metadata["file_name"];
      if (!pipelineId || !fileName) continue;
      const isDuplicate = files.some(
        (f) => f.pipelineId === pipelineId && f.fileName === fileName,
      );
      if (!isDuplicate) {
        files.push({ pipelineId, fileName });
      }
    }
    return files;
  }
}
