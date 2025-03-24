import SwaggerParser from "@apidevtools/swagger-parser";
import { JSONSchemaType } from "ajv";
import got from "got";
import { FunctionTool, JSONValue, ToolMetadata } from "llamaindex";

interface DomainHeaders {
  [key: string]: { [header: string]: string };
}

type Input = {
  url: string;
  params: object;
};

type APIInfo = {
  description: string;
  title: string;
};

export class OpenAPIActionTool {
  // cache the loaded specs by URL
  private static specs: Record<string, any> = {};

  private readonly INVALID_URL_PROMPT =
    "This url did not include a hostname or scheme. Please determine the complete URL and try again.";

  private createLoadSpecMetaData = (info: APIInfo) => {
    return {
      name: "load_openapi_spec",
      description: `Use this to retrieve the OpenAPI spec for the API named ${info.title} with the following description: ${info.description}. Call it before making any requests to the API.`,
    };
  };

  private readonly createMethodCallMetaData = (
    method: "POST" | "PATCH" | "GET",
    info: APIInfo,
  ) => {
    return {
      name: `${method.toLowerCase()}_request`,
      description: `Use this to call the ${method} method on the API named ${info.title}`,
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: `The url to make the ${method} request against`,
          },
          params: {
            type: "object",
            description:
              method === "GET"
                ? "the URL parameters to provide with the get request"
                : `the key-value pairs to provide with the ${method} request`,
          },
        },
        required: ["url"],
      },
    } as ToolMetadata<JSONSchemaType<Input>>;
  };

  constructor(
    public openapi_uri: string,
    public domainHeaders: DomainHeaders = {},
  ) {}

  async loadOpenapiSpec(url: string): Promise<any> {
    const api = await SwaggerParser.validate(url);
    return {
      servers: "servers" in api ? api.servers : "",
      info: { description: api.info.description, title: api.info.title },
      endpoints: api.paths,
    };
  }

  async getRequest(input: Input): Promise<JSONValue> {
    if (!this.validUrl(input.url)) {
      return this.INVALID_URL_PROMPT;
    }
    try {
      const data = await got
        .get(input.url, {
          headers: this.getHeadersForUrl(input.url),
          searchParams: input.params as URLSearchParams,
        })
        .json();
      return data as JSONValue;
    } catch (error) {
      return error as JSONValue;
    }
  }

  async postRequest(input: Input): Promise<JSONValue> {
    if (!this.validUrl(input.url)) {
      return this.INVALID_URL_PROMPT;
    }
    try {
      const res = await got.post(input.url, {
        headers: this.getHeadersForUrl(input.url),
        json: input.params,
      });
      return res.body as JSONValue;
    } catch (error) {
      return error as JSONValue;
    }
  }

  async patchRequest(input: Input): Promise<JSONValue> {
    if (!this.validUrl(input.url)) {
      return this.INVALID_URL_PROMPT;
    }
    try {
      const res = await got.patch(input.url, {
        headers: this.getHeadersForUrl(input.url),
        json: input.params,
      });
      return res.body as JSONValue;
    } catch (error) {
      return error as JSONValue;
    }
  }

  public async toToolFunctions() {
    if (!OpenAPIActionTool.specs[this.openapi_uri]) {
      console.log(`Loading spec for URL: ${this.openapi_uri}`);
      const spec = await this.loadOpenapiSpec(this.openapi_uri);
      OpenAPIActionTool.specs[this.openapi_uri] = spec;
    }
    const spec = OpenAPIActionTool.specs[this.openapi_uri];
    // TODO: read endpoints with parameters from spec and create one tool for each endpoint
    // For now, we just create a tool for each HTTP method which does not work well for passing parameters
    return [
      FunctionTool.from(() => {
        return spec;
      }, this.createLoadSpecMetaData(spec.info)),
      FunctionTool.from(
        this.getRequest.bind(this),
        this.createMethodCallMetaData("GET", spec.info),
      ),
      FunctionTool.from(
        this.postRequest.bind(this),
        this.createMethodCallMetaData("POST", spec.info),
      ),
      FunctionTool.from(
        this.patchRequest.bind(this),
        this.createMethodCallMetaData("PATCH", spec.info),
      ),
    ];
  }

  private validUrl(url: string): boolean {
    const parsed = new URL(url);
    return !!parsed.protocol && !!parsed.hostname;
  }

  private getDomain(url: string): string {
    const parsed = new URL(url);
    return parsed.hostname;
  }

  private getHeadersForUrl(url: string): { [header: string]: string } {
    const domain = this.getDomain(url);
    return this.domainHeaders[domain] || {};
  }
}
