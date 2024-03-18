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

export class ToolMetadata {
  name: string;
  description: string;
  parameters: ToolParameters | null = null;

  constructor(
    name: string,
    description: string,
    parameters: ToolParameters | null = null,
  ) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }
}
