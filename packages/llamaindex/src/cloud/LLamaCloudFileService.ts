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
      const { data: projects } =
        await ProjectsService.listProjectsApiV1ProjectsGet({
          throwOnError: true,
        });
      const { data: pipelines } =
        await PipelinesService.searchPipelinesApiV1PipelinesGet({
          throwOnError: true,
        });
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
    const { data: file } = await FilesService.uploadFileApiV1FilesPost({
      path: { project_id: projectId },
      body: {
        upload_file: uploadFile,
      },
      throwOnError: true,
    });
    const files = [
      {
        file_id: file.id,
        custom_metadata: { file_id: file.id, ...customMetadata },
      },
    ];
    await PipelinesService.addFilesToPipelineApiV1PipelinesPipelineIdFilesPut({
      path: {
        pipeline_id: pipelineId,
      },
      body: files,
    });

    // Wait 2s for the file to be processed
    const maxAttempts = 20;
    let attempt = 0;
    while (attempt < maxAttempts) {
      const { data: result } =
        await PipelinesService.getPipelineFileStatusApiV1PipelinesPipelineIdFilesFileIdStatusGet(
          {
            path: {
              pipeline_id: pipelineId,
              file_id: file.id,
            },
            throwOnError: true,
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
    const { data: allPipelineFiles } =
      await PipelinesService.listPipelineFilesApiV1PipelinesPipelineIdFilesGet({
        path: {
          pipeline_id: pipelineId,
        },
        throwOnError: true,
      });
    const file = allPipelineFiles.find((file) => file.name === filename);
    if (!file?.file_id) return null;
    const { data: fileContent } =
      await FilesService.readFileContentApiV1FilesIdContentGet({
        path: {
          id: file.file_id,
        },
        query: {
          project_id: file.project_id,
        },
        throwOnError: true,
      });
    return fileContent.url;
  }
}
