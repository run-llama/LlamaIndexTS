import {
  FilesService,
  PipelinesService,
  ProjectsService,
} from "@llamaindex/cloud/api";
import { initService } from "./utils.js";

export class LLamaCloudFileService {
  /**
   * Get list of projects, each project contains a list of pipelines
   */
  public static async getAllProjectsWithPipelines() {
    initService();
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
  public static async addFileToPipeline(
    projectId: string,
    pipelineId: string,
    uploadFile: File | Blob,
    customMetadata: Record<string, any> = {},
  ) {
    initService();
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
   * Get download URL for a file in LlamaCloud
   */
  public static async getFileUrl(pipelineId: string, filename: string) {
    initService();
    const allPipelineFiles =
      await PipelinesService.listPipelineFilesApiV1PipelinesPipelineIdFilesGet({
        pipelineId,
      });
    const file = allPipelineFiles.find((file) => file.name === filename);
    if (!file?.file_id) return null;
    const fileContent =
      await FilesService.readFileContentApiV1FilesIdContentGet({
        id: file.file_id,
        projectId: file.project_id,
      });
    return fileContent.url;
  }
}
