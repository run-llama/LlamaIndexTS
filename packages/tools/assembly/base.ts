class ToolParameterProperty {
  type!: string;
  description: string | null = null;
}

// Because AssemblyScript does not support Record<string, ToolParameterProperty> yet,
// we have to use an array of key-value pairs instead.
// When loading the metadata in application, we will convert
// the array ToolParameterPropertyRecord[] to Record<string, ToolParameterProperty>.
class ToolParameterPropertyRecord {
  key!: string;
  value!: ToolParameterProperty;
}

class ToolParameters {
  type!: string;
  properties!: ToolParameterPropertyRecord[];
  required: string[] | null = null;
}

// AssemblyScript does not support any type yet, so we use string and parse it in the application
class ArgsKwargsRecord {
  key!: string;
  value!: string;
}

export class ToolMetadata {
  name!: string;
  description!: string;
  parameters: ToolParameters | null = null;
  argsKwargs: ArgsKwargsRecord[] | null = null;
}
