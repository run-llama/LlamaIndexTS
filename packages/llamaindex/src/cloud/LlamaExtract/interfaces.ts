export interface UploadResponse {
  id: string;
  name: string;
  status: string;
}

export interface ExtractionJobResponse {
  id: string;
  status: string;
  extraction_agent_id: string;
  file_id: string;
}

export interface JobStatusResponse {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
  extraction_agent_id: string;
  file_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExtractionResult {
  // The actual structure will depend on your extraction agent configuration
  [key: string]: unknown;
}

export interface CreateAgentRequest {
  name: string;
  [key: string]: unknown; // for the JSON schema properties
}
