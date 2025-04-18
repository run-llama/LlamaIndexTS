"use client";

import { ChatInput, useChatUI, useFile } from "@llamaindex/chat-ui";
import { DocumentInfo, ImagePreview } from "@llamaindex/chat-ui/widgets";
import { getConfig } from "../lib/utils";
import { LlamaCloudSelector } from "./custom/llama-cloud-selector";

export default function CustomChatInput() {
  const { requestData, isLoading, input } = useChatUI();
  const uploadAPI = getConfig("UPLOAD_API") ?? "";
  const llamaCloudAPI = getConfig("LLAMA_CLOUD_API") ?? "";
  const {
    imageUrl,
    setImageUrl,
    uploadFile,
    files,
    removeDoc,
    reset,
    getAnnotations,
  } = useFile({ uploadAPI });

  /**
   * Handles file uploads. Overwrite to hook into the file upload behavior.
   * @param file The file to upload
   */
  const handleUploadFile = async (file: File) => {
    // There's already an image uploaded, only allow one image at a time
    if (imageUrl) {
      alert("You can only upload one image at a time.");
      return;
    }

    try {
      // Upload the file and send with it the current request data
      await uploadFile(file, requestData);
    } catch (error: unknown) {
      // Show error message if upload fails
      alert(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  // Get references to the upload files in message annotations format, see https://github.com/run-llama/chat-ui/blob/main/packages/chat-ui/src/hook/use-file.tsx#L56
  const annotations = getAnnotations();

  return (
    <ChatInput
      resetUploadedFiles={reset}
      annotations={annotations}
      className="px-20"
    >
      {/* Image preview section */}
      {imageUrl && (
        <ImagePreview url={imageUrl} onRemove={() => setImageUrl(null)} />
      )}
      {/* Document previews section */}
      {files.length > 0 && (
        <div className="flex w-full gap-4 overflow-auto py-2">
          {files.map((file) => (
            <DocumentInfo
              key={file.id}
              document={{ url: file.url, sources: [] }}
              className="mb-2 mt-2"
              onRemove={() => removeDoc(file)}
            />
          ))}
        </div>
      )}
      <ChatInput.Form>
        <ChatInput.Field />
        {uploadAPI && <ChatInput.Upload onUpload={handleUploadFile} />}
        {llamaCloudAPI && <LlamaCloudSelector />}
        <ChatInput.Submit
          disabled={
            isLoading || (!input.trim() && files.length === 0 && !imageUrl)
          }
        />
      </ChatInput.Form>
    </ChatInput>
  );
}
