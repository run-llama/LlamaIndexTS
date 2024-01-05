export const STORAGE_DIR = "./data";
export const CHUNK_SIZE = 512;
export const CHUNK_OVERLAP = 20;
export const PGVECTOR_SCHEMA = "public";
export const PGVECTOR_TABLE = "llamaindex_embedding";

const REQUIRED_ENV_VARS = ["PG_CONNECTION_STRING", "OPENAI_API_KEY"];

export function checkRequiredEnvVars() {
  const missingEnvVars = REQUIRED_ENV_VARS.filter((envVar) => {
    return !process.env[envVar];
  });

  if (missingEnvVars.length > 0) {
    console.log(
      `The following environment variables are required but missing: ${missingEnvVars.join(
        ", ",
      )}`,
    );
    throw new Error(
      `Missing environment variables: ${missingEnvVars.join(", ")}`,
    );
  }
}
