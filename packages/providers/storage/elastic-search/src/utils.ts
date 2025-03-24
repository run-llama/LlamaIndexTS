import { Client, type ClientOptions } from "@elastic/elasticsearch";

export function getElasticSearchClient({
  esUrl,
  esCloudId,
  esApiKey,
  esUsername,
  esPassword,
}: {
  esUrl?: string | undefined;
  esCloudId?: string | undefined;
  esApiKey?: string | undefined;
  esUsername?: string | undefined;
  esPassword?: string | undefined;
}): Client {
  const clientOptions: ClientOptions = {};

  if (esUrl && esCloudId) {
    throw new Error("Both esUrl and esCloudId cannot be provided");
  }

  if (esUrl) {
    clientOptions.node = esUrl;
  } else if (esCloudId) {
    clientOptions.cloud = { id: esCloudId };
  } else {
    throw new Error("Either elasticsearch url or cloud id must be provided");
  }

  if (esApiKey) {
    clientOptions.auth = { apiKey: esApiKey };
  } else if (esUsername && esPassword) {
    clientOptions.auth = {
      username: esUsername,
      password: esPassword,
    };
  }

  return new Client(clientOptions);
}
