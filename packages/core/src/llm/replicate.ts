import Replicate from "replicate";

export class ReplicateSession {
  replicateKey: string | null = null;
  replicate: Replicate;

  constructor(replicateKey: string | null = null) {
    if (replicateKey) {
      this.replicateKey = replicateKey;
    } else if (process.env.REPLICATE_API_TOKEN) {
      this.replicateKey = process.env.REPLICATE_API_TOKEN;
    } else {
      throw new Error(
        "Set Replicate token in REPLICATE_API_TOKEN env variable"
      );
    }

    this.replicate = new Replicate({ auth: this.replicateKey });
  }
}

let defaultReplicateSession: ReplicateSession | null = null;

export function getReplicateSession(replicateKey: string | null = null) {
  if (!defaultReplicateSession) {
    defaultReplicateSession = new ReplicateSession(replicateKey);
  }

  return defaultReplicateSession;
}

export * from "openai";
