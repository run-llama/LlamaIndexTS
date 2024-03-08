export class ToolParameterProperty {
  type: string;
  description: string | null = null;

  constructor(type: string, description: string | null = null) {
    this.type = type;
    this.description = description;
  }
}

// Because AssemblyScript does not support Record<string, ToolParameterProperty> yet,
// we have to use an array of key-value pairs instead.
// When loading the metadata in application, we will convert
// the array ToolParameterPropertyRecord[] to Record<string, ToolParameterProperty>.
export class ToolParameterPropertyRecord {
  key: string;
  value: ToolParameterProperty;

  constructor(key: string, value: ToolParameterProperty) {
    this.key = key;
    this.value = value;
  }
}

export class ToolParameters {
  type: string;
  properties: ToolParameterPropertyRecord[];
  required: string[] | null = null;

  constructor(
    type: string,
    properties: ToolParameterPropertyRecord[],
    required: string[] | null = null,
  ) {
    this.type = type;
    this.properties = properties;
    this.required = required;
  }
}

// AssemblyScript does not support any type yet, so we use string and parse it in the application
export class ArgsKwargsRecord {
  key: string;
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }
}

export class ToolMetadata {
  name: string;
  description: string;
  parameters: ToolParameters | null = null;
  argsKwargs: ArgsKwargsRecord[] | null = null;

  constructor(
    name: string,
    description: string,
    parameters: ToolParameters | null = null,
    argsKwargs: ArgsKwargsRecord[] | null = null,
  ) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.argsKwargs = argsKwargs;
  }
}

export class BaseTool {
  metadata!: ToolMetadata;
  call(_args: Object): Object {
    throw new Error("Not implemented");
  }
}
