import type { IncomingMessage, ServerResponse } from "http";

export async function parseRequestBody(request: IncomingMessage) {
  const body = new Promise((resolve) => {
    const bodyParts: Buffer[] = [];
    let body: string;
    request
      .on("data", (chunk) => {
        bodyParts.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(bodyParts).toString();
        resolve(body);
      });
  }) as Promise<string>;
  const data = await body;
  return JSON.parse(data);
}

export function sendJSONResponse(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, unknown> | string | Array<unknown>,
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(typeof body === "string" ? body : JSON.stringify(body));
}

export async function pipeStreamToResponse(
  response: ServerResponse,
  stream: Response,
) {
  if (!stream.body) return;
  const reader = stream.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) return response.end();
    response.write(value);
  }
}
