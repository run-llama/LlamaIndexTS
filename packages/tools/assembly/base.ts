export class ToolParameterProperty {
  type: string;
  description: string | null;

  constructor(type: string, description: string | null) {
    this.type = type;
    this.description = description;
  }
}

export class ToolParameters {
  type: string;
  properties: Map<string, ToolParameterProperty>;
  required: string[] | null;

  constructor(
    type: string,
    properties: Map<string, ToolParameterProperty>,
    required: string[] | null,
  ) {
    this.type = type;
    this.properties = properties;
    this.required = required;
  }
}

export class ToolMetadata {
  name: string;
  description: string;
  parameters: ToolParameters | null;
  argsKwargs: Map<string, Object> | null;

  constructor(
    name: string,
    description: string,
    parameters: ToolParameters | null,
    argsKwargs: Map<string, Object> | null,
  ) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.argsKwargs = argsKwargs;
  }
}

export class BaseTool {
  call(_args: Object): Object {
    return {};
  }
  metadata: ToolMetadata | null = null;

  constructor(metadata: ToolMetadata) {
    this.metadata = metadata;
  }
}
